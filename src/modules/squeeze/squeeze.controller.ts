import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SqueezeService } from './squeeze.service';
import { SqueezeDto } from './dtos/squeeze.dto';
import { Public } from '@guards/public.decorator';
import { SqueezeDocs } from './docs/squeeze.doc';

@Controller('squeeze')
@SqueezeDocs.tag
export class SqueezeController {
  constructor(private readonly service: SqueezeService) {}

  @Post()
  @Public()
  @SqueezeDocs.register()
  async register(@Body() body: SqueezeDto) {
      return await this.service.register(body);
}
}
