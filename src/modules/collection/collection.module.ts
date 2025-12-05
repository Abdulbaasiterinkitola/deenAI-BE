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

@Module({
  imports: [TypeOrmModule.forFeature([Collection]), ConfigModule],
  controllers: [CollectionController],
  providers: [
    CollectionService,
    CollectionsCoreService,
    CollectionsValidationService,
    CollectionsCompressionService,
    CollectionActionModel,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
