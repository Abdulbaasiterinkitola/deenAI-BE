import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { Cache } from 'cache-manager';
import { TokenUsageActionModel } from '@modules/token-usage/action-models/token-usage.action-model';
import { TokenUsageService } from '@modules/token-usage/token-usage.service';
import { CustomHttpException } from '@shared/custom.exception';
import {
  OverviewDto,
  TimeSeriesDto,
  TopUserDto,
  BreakdownDto,
  PlanStatsDto,
  UserDetailDto,
  TimeSeriesPoint,
} from '../dtos/token-stats.dto';

@Injectable()
export class SuperadminTokenStatsService {
  private readonly logger = new Logger(SuperadminTokenStatsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly tokenUsageAction: TokenUsageActionModel,
    private readonly tokenUsageService: TokenUsageService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private daysAgoIso(days: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString();
  }

  private parseDateOrNull(s?: string): Date | null {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  async getOverview(): Promise<OverviewDto> {
    const cacheKey = 'superadmin:tokens:overview';
    const cached = await this.cacheManager.get<OverviewDto>(cacheKey);
    if (cached) return cached;

    try {
      // total all-time
      const totalRow = await this.dataSource.query(
        `SELECT COALESCE(SUM(input_tokens + output_tokens),0) AS total FROM token_usage`,
      );
      const totalAllTime = Number(totalRow?.[0]?.total || 0);

      // last 7 & 30 days
      const since7 = this.daysAgoIso(7);
      const since30 = this.daysAgoIso(30);

      const last7Row = await this.dataSource.query(
        `SELECT COALESCE(SUM(input_tokens + output_tokens),0) AS total FROM token_usage WHERE created_at >= $1`,
        [since7],
      );
      const last30Row = await this.dataSource.query(
        `SELECT COALESCE(SUM(input_tokens + output_tokens),0) AS total FROM token_usage WHERE created_at >= $1`,
        [since30],
      );

      const inputRow = await this.dataSource.query(
        `SELECT COALESCE(SUM(input_tokens),0) AS sum FROM token_usage`,
      );

      const outputRow = await this.dataSource.query(
        `SELECT COALESCE(SUM(output_tokens),0) AS sum FROM token_usage`,
      );

      const avgRow = await this.dataSource.query(`
        SELECT AVG(user_total) AS avg_per_user FROM (
          SELECT SUM(input_tokens + output_tokens) AS user_total FROM token_usage GROUP BY user_id
        ) t
      `);

      const result: OverviewDto = {
        totalAllTime,
        totalLast7Days: Number(last7Row?.[0]?.total || 0),
        totalLast30Days: Number(last30Row?.[0]?.total || 0),
        averagePerUser: Number(avgRow?.[0]?.avg_per_user || 0),
        inputTokens: Number(inputRow?.[0]?.sum || 0),
        outputTokens: Number(outputRow?.[0]?.sum || 0),
      };

      await this.cacheManager.set(cacheKey, result, 120);
      return result;
    } catch (err) {
      this.logger.error('Overview aggregation failed', err as any);
      throw new CustomHttpException('Failed to compute overview', 500);
    }
  }

  async getUsageTrend(opts: {
    period: 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
  }): Promise<TimeSeriesDto> {
    const { period, startDate, endDate } = opts;
    const start =
      this.parseDateOrNull(startDate) ||
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const end = this.parseDateOrNull(endDate) || new Date();

    if (start > end) throw new CustomHttpException('Invalid date range', 400);

    try {
      const trunc =
        period === 'month'
          ? `date_trunc('month', created_at)`
          : period === 'week'
            ? `date_trunc('week', created_at)`
            : `date_trunc('day', created_at)`;

      const rows: Array<{
        bucket: string;
        input: string;
        output: string;
        total: string;
      }> = await this.dataSource.query(
        `
        SELECT ${trunc} as bucket,
          COALESCE(SUM(input_tokens),0)::bigint AS input,
          COALESCE(SUM(output_tokens),0)::bigint AS output,
          COALESCE(SUM(input_tokens + output_tokens),0)::bigint AS total
        FROM token_usage
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY bucket
        ORDER BY bucket ASC
        `,
        [start.toISOString(), end.toISOString()],
      );

      const points: TimeSeriesPoint[] = rows.map((r) => ({
        timestamp: new Date(r.bucket).toISOString(),
        input: Number(r.input),
        output: Number(r.output),
        total: Number(r.total),
      }));

      const granularity: 'hour' | 'day' | 'week' =
        period === 'month' ? 'week' : period;
      return { granularity, points };
    } catch (err) {
      this.logger.error('Usage trend aggregation failed', err as any);
      throw new CustomHttpException('Failed to compute usage trend', 500);
    }
  }

  async getTopUsers(opts: {
    limit: number;
    period: 'all' | '7d' | '30d';
  }): Promise<TopUserDto[]> {
    const { limit, period } = opts;
    try {
      const params: any[] = [];
      let where = '';
      if (period === '7d') {
        where = `WHERE tu.created_at >= $1`;
        params.push(this.daysAgoIso(7));
      } else if (period === '30d') {
        where = `WHERE tu.created_at >= $1`;
        params.push(this.daysAgoIso(30));
      }
      params.push(limit);

      interface TopUserRow {
        userId: string;
        name: string | null;
        email: string | null;
        plan: string | null;
        totalTokens: string;
      }

      const rows = await this.dataSource.query<TopUserRow[]>(
        `
        SELECT u.id as "userId", u.name, u.email, p.name as plan, COALESCE(SUM(tu.input_tokens + tu.output_tokens),0)::bigint as "totalTokens"
        FROM token_usage tu
        JOIN users u ON u.id = tu.user_id
        LEFT JOIN plans p ON p.id = u.plan_id
        ${where}
        GROUP BY u.id, u.name, u.email, p.name
        ORDER BY "totalTokens" DESC
        LIMIT $${params.length}
        `,
        params,
      );

      return rows.map((r: TopUserRow) => ({
        userId: r.userId,
        name: r.name ?? null,
        email: r.email ?? null,
        plan: r.plan ?? null,
        totalTokens: Number(r.totalTokens || 0),
      }));
    } catch (err) {
      this.logger.error('Top users query failed', err as any);
      throw new CustomHttpException('Failed to compute top users', 500);
    }
  }

  async getBreakdown(): Promise<BreakdownDto> {
    try {
      const inputRow = await this.dataSource.query(
        `SELECT COALESCE(SUM(input_tokens),0) AS sum FROM token_usage`,
      );
      const outputRow = await this.dataSource.query(
        `SELECT COALESCE(SUM(output_tokens),0) AS sum FROM token_usage`,
      );
      const totalRequestsRow = await this.dataSource.query(
        `SELECT COUNT(*) AS c FROM token_usage`,
      );

      const input = Number(inputRow?.[0]?.sum || 0);
      const output = Number(outputRow?.[0]?.sum || 0);
      const totalRequests = Number(totalRequestsRow?.[0]?.c || 0);

      const avgPerRequest = totalRequests
        ? (input + output) / totalRequests
        : 0;
      const ratio = output ? input / output : input > 0 ? Infinity : 0;

      return {
        inputTokens: input,
        outputTokens: output,
        inputToOutputRatio: ratio,
        avgPerRequest,
      };
    } catch (err) {
      this.logger.error('Breakdown query failed', err as any);
      throw new CustomHttpException('Failed to compute breakdown', 500);
    }
  }

  async getByPlan(): Promise<PlanStatsDto[]> {
    try {
      interface PlanRow {
        plan_id: string | null;
        plan_name: string | null;
        total_tokens: string;
        avg_per_user: string;
      }

      const rows = await this.dataSource.query<PlanRow[]>(`
        SELECT
          p.id AS plan_id,
          p.name AS plan_name,
          COALESCE(SUM(tu.input_tokens + tu.output_tokens),0)::bigint AS total_tokens,
          AVG(user_sum) AS avg_per_user
        FROM token_usage tu
        JOIN users u ON u.id = tu.user_id
        LEFT JOIN plans p ON p.id = u.plan_id
        JOIN (
          SELECT user_id, SUM(COALESCE(input_tokens,0)+COALESCE(output_tokens,0)) AS user_sum
          FROM token_usage
          GROUP BY user_id
        ) us ON us.user_id = u.id
        GROUP BY p.id, p.name
        ORDER BY total_tokens DESC
      `);

      const totalAllRow = await this.dataSource.query(
        `SELECT COALESCE(SUM(input_tokens + output_tokens),0) AS total FROM token_usage`,
      );
      const totalAll = Number(totalAllRow?.[0]?.total || 0);

      return rows.map((r: PlanRow) => ({
        planId: r.plan_id ?? null,
        planName: r.plan_name ?? null,
        totalTokens: Number(r.total_tokens || 0),
        avgPerUser: Number(r.avg_per_user || 0),
        percentageOfTotal: totalAll
          ? (Number(r.total_tokens || 0) / totalAll) * 100
          : 0,
      }));
    } catch (err) {
      this.logger.error('Plan aggregation failed', err as any);
      throw new CustomHttpException('Failed to compute plan stats', 500);
    }
  }

  async getUserDetail(opts: {
    userId: string;
    page: number;
    limit: number;
  }): Promise<UserDetailDto> {
    const { userId, page, limit } = opts;
    try {
      // total consumed by user
      const totalRow = await this.dataSource.query(
        `SELECT COALESCE(SUM(input_tokens + output_tokens),0) AS total FROM token_usage WHERE user_id = $1`,
        [userId],
      );
      const total = Number(totalRow?.[0]?.total || 0);

      // billing period (use user's billingStart if present in users table)
      const billingStartRow = await this.dataSource.query(
        `SELECT billing_start FROM users WHERE id = $1`,
        [userId],
      );
      const billingStart = billingStartRow?.[0]?.billing_start
        ? new Date(billingStartRow[0].billing_start)
        : (() => {
            const d = new Date();
            d.setUTCDate(d.getUTCDate() - 30);
            return d;
          })();

      const periodRow = await this.dataSource.query(
        `SELECT COALESCE(SUM(input_tokens + output_tokens),0) AS total FROM token_usage WHERE user_id = $1 AND created_at >= $2`,
        [userId, billingStart.toISOString()],
      );
      const periodConsumed = Number(periodRow?.[0]?.total || 0);

      // history (paginated)
      const offset = (page - 1) * limit;

      interface HistoryRow {
        timestamp: string;
        input: string;
        output: string;
        total: string;
      }

      const historyRows = await this.dataSource.query<HistoryRow[]>(
        `SELECT created_at as timestamp, COALESCE(input_tokens,0) as input, COALESCE(output_tokens,0) as output, COALESCE(input_tokens+output_tokens,0) as total
         FROM token_usage
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      const points: TimeSeriesPoint[] = historyRows.map((r: HistoryRow) => ({
        timestamp: new Date(r.timestamp).toISOString(),
        input: Number(r.input || 0),
        output: Number(r.output || 0),
        total: Number(r.total || 0),
      }));

      const avg = points.length
        ? points.reduce((s, p) => s + p.total, 0) / points.length
        : 0;

      return {
        userId,
        totalConsumed: total,
        periodConsumed,
        averagePerRequest: avg,
        history: points,
      };
    } catch (err) {
      this.logger.error('User detail query failed', err as any);
      throw new CustomHttpException('Failed to compute user detail', 500);
    }
  }

  async getTimeSeries(opts: {
    granularity: 'hour' | 'day' | 'week';
    startDate?: string;
    endDate?: string;
  }): Promise<TimeSeriesDto> {
    const { granularity, startDate, endDate } = opts;
    const start =
      this.parseDateOrNull(startDate) ||
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
    const end = this.parseDateOrNull(endDate) || new Date();

    if (start > end) throw new CustomHttpException('Invalid date range', 400);

    try {
      const trunc =
        granularity === 'hour'
          ? `date_trunc('hour', created_at)`
          : granularity === 'week'
            ? `date_trunc('week', created_at)`
            : `date_trunc('day', created_at)`;
      const rows: Array<{
        bucket: string;
        input: string;
        output: string;
        total: string;
      }> = await this.dataSource.query(
        `
        SELECT ${trunc} as bucket,
          COALESCE(SUM(input_tokens),0)::bigint AS input,
          COALESCE(SUM(output_tokens),0)::bigint AS output,
          COALESCE(SUM(input_tokens + output_tokens),0)::bigint AS total
        FROM token_usage
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY bucket
        ORDER BY bucket ASC
        `,
        [start.toISOString(), end.toISOString()],
      );

      const points = rows.map((r) => ({
        timestamp: new Date(r.bucket).toISOString(),
        input: Number(r.input),
        output: Number(r.output),
        total: Number(r.total),
      }));

      return { granularity, points };
    } catch (err) {
      this.logger.error('Time series query failed', err as any);
      throw new CustomHttpException('Failed to compute time series', 500);
    }
  }
}
