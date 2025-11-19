import { Injectable } from '@nestjs/common';
import dataSource from '../../database/data-source';
import { createClient } from 'redis';
import * as nodemailer from 'nodemailer';

@Injectable()
export class HealthService {
  private redis = createClient({ url: process.env.REDIS_URL });

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async checkServiceStatus(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkDatabase() {
    try {
      await dataSource.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }

  async checkRedis() {
    try {
      if (!this.redis.isOpen) await this.redis.connect();
      const pong = await this.redis.ping();
      return pong === 'PONG' ? 'up' : 'down';
    } catch (err) {
      console.error(err);
      return 'down';
    }
  }

  async checkSMTP() {
    try {
      await this.transporter.verify();
      return 'up';
    } catch (err) {
      console.error(err);
      return 'down';
    }
  }

  async checkHealth() {
    const database = await this.checkDatabase();
    const redis = await this.checkRedis();
    const smtp = await this.checkSMTP();
    const serverOk = await this.checkServiceStatus(
      'https://api.ottoman.emerj.net/',
    );

    const isHealthy = database === 'up' && redis === 'up' && smtp === 'up' && serverOk === true;
    return {
      status: isHealthy ? 'ok' : 'error',
      services: {
        database,
        redis,
        smtp,
        serverOk,
        uptime: `${Math.floor(process.uptime())}s`,
      },
      timestamp: new Date().toISOString(),
      httpStatus: isHealthy ? 200 : 503,
    };
  }
}
