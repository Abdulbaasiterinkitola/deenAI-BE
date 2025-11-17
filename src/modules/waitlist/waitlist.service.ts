import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waitlist } from '../../entities/waitlist.entity';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist)
    private waitlistRepository: Repository<Waitlist>,
    private mailService: MailService,
  ) {}

  async create(createWaitlistDto: CreateWaitlistDto) {
    const existingUser = await this.waitlistRepository.findOne({
      where: { email: createWaitlistDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered in waitlist');
    }

    const waitlistEntry = this.waitlistRepository.create(createWaitlistDto);
    const saved = await this.waitlistRepository.save(waitlistEntry);

    // Queue welcome email (with error handling)
    try {
      await this.mailService.sendWelcomeEmail(saved.email, saved.name);
    } catch (error) {
      console.log('Email service error:', error.message);
      // Continue without failing the registration
    }

    return {
      message: 'Successfully joined waitlist',
      data: { id: saved.id, email: saved.email, name: saved.name },
    };
  }

  async findAll() {
    return this.waitlistRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}