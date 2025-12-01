import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reflection } from './models/reflection.model';
import { ReflectionsController } from './reflections.controller';
import { ReflectionsService } from './reflections.service';
import { ReflectionsCoreService } from './services/reflections-core.service';
import { ReflectionsValidationService } from './services/reflections-validation.service';
import { ReflectionsActionModel } from './action-models/reflections.action-model';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PlansModule } from '@modules/plans/plans.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reflection]), UsersModule, AuthModule, PlansModule],
  controllers: [ReflectionsController],
  providers: [
    ReflectionsService,
    ReflectionsCoreService,
    ReflectionsValidationService,
    ReflectionsActionModel,
  ],
  exports: [ReflectionsService],
})
export class ReflectionsModule { }
