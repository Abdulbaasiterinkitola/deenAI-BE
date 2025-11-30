import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';

import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

// Swagger docs decorators
import {
  SubscribeDocs,
  UnsubscribeDocs,
  CheckStatusDocs,
  StatsDocs,
} from './docs/newsletter.docs';

import { AuthGuard } from '@guards/auth.guard';

import { Request } from 'express';

interface AuthRequest extends Request {
  user?: { email?: string };
}

@Controller('newsletter')
@ApiTags('Newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(200)
  @SubscribeDocs()
  async subscribe(
    @Body() subscribeDto: SubscribeDto,
    @Req() request: AuthRequest,
  ) {
    const email = request.user?.email || subscribeDto.email;

    if (!email) {
      throw new CustomHttpException(
        { message: 'Email is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.newsletterService.subscribeUser(email);
  }

  @Post('unsubscribe')
  @HttpCode(200)
  @UnsubscribeDocs()
  async unsubscribe(
    @Body() unsubscribeDto: UnsubscribeDto,
    @Req() request: AuthRequest,
  ) {
    const email = request.user?.email || unsubscribeDto.email;

    if (!email) {
      throw new CustomHttpException(
        { message: 'Email is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.newsletterService.unsubscribeUser(email);
  }

  @Get('status')
  @UseGuards(AuthGuard)
  @CheckStatusDocs()
  async checkStatus(@Req() request: AuthRequest) {
    const email = request.user?.email;

    if (!email) {
      throw new CustomHttpException(
        { message: 'Authentication required' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isSubscribed = await this.newsletterService.isSubscribed(email);

    return { success: true, isSubscribed };
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  @StatsDocs()
  async getStats() {
    const stats = await this.newsletterService.getSubscriptionStats();

    return { success: true, data: stats };
  }
}
