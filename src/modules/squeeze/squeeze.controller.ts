import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SqueezeService } from './squeeze.service';
import { SqueezeDto } from './dtos/squeeze.dto';
import { Public } from '@guards/public.decorator';
import { SqueezeDocs } from './docs/squeeze.doc';

@Controller('squeeze')
@SqueezeDocs.tag
@Throttle({
  default: { limit: 3, ttl: 60 * 1000 }, // 3 requests per minute
})
export class SqueezeController {
  constructor(private readonly service: SqueezeService) {}

  @Post()
  @Public()
  @SqueezeDocs.register()
  async register(@Body() body: SqueezeDto) {
    return await this.service.register(body);
  }
}
