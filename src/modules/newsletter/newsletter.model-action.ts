import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { NewsletterSubscription } from './models/newsletter-subscription.model';

@Injectable()
export class NewsletterModelAction extends AbstractModelAction<NewsletterSubscription> {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly newsletterRepository: Repository<NewsletterSubscription>,
  ) {
    super(newsletterRepository, NewsletterSubscription);
  }
}
