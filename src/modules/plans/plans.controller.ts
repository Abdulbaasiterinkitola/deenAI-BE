import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansDocs } from './docs/plans.doc';
import { PlanQueryDto } from './dto/plan-query.dto';

@PlansDocs.tag()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @PlansDocs.getAll()
  async getAll(@Query() query: PlanQueryDto) {
    const data = await this.plansService.getAll(query);

    return {
      success: true,
      status: 'success',
      message: 'Plans retrieved successfully',
      data,
      meta: null,
      status_code: 200,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @PlansDocs.getById()
  async getById(@Param('id') id: string) {
    const data = await this.plansService.getById(id);

    return {
      success: true,
      status: 'success',
      message: 'Plan retrieved successfully',
      data,
      meta: null,
      status_code: 200,
    };
  }
}
