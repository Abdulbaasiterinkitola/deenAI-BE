import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { NotificationSettings } from '../models/notification-setting.model';

@Injectable()
export class NotificationSettingsModelAction extends AbstractModelAction<NotificationSettings> {
  constructor(
    @InjectRepository(NotificationSettings)
    repository: Repository<NotificationSettings>,
  ) {
    super(repository, NotificationSettings);
  }
}
