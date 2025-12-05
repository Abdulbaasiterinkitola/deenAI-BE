import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectionsCoreService } from './services/collection-core.service';
import { CollectionsValidationService } from './services/collection-validator.service';
import { CollectionsCompressionService } from './services/collection-compression.service';
import { CollectionActionModel } from './action-models/collection.action-model';
import { Collection } from './models/collection-model';
import { HadithCollectionsController } from './controllers/hadith.controller';
import { HadithCollectionsService } from './services/hadith-collection.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection]), ConfigModule],
  controllers: [CollectionController, HadithCollectionsController],
  providers: [
    CollectionService,
    CollectionsCoreService,
    CollectionsValidationService,
    CollectionsCompressionService,
    CollectionActionModel,
    HadithCollectionsService,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
