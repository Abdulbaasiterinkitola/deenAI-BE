import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StreaksService } from './streaks.service';
import { AuthGuard } from '@guards/auth.guard';
import { StreaksDocs } from './docs/streaks.doc';

@ApiTags('Streaks')
@ApiBearerAuth()
@Controller('streaks')
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @StreaksDocs.getStreakState()
  async getStreakState(@Request() req: any) {
    const userId = req.user?.id as string;
    return await this.streaksService.getStreakState(userId);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @StreaksDocs.updateStreak()
  async updateStreak(@Request() req: any) {
    const userId = req.user?.id as string;
    return await this.streaksService.updateStreak(userId);
  }
}
