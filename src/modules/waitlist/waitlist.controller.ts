import { Controller, Post, Get, Body, ValidationPipe } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  async create(@Body(ValidationPipe) createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistService.create(createWaitlistDto);
  }

  @Get()
  async findAll() {
    return this.waitlistService.findAll();
  }
}