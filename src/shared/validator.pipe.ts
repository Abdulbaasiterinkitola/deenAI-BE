import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus,
  Type,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { CustomHttpException } from './custom.exception';

type ClassType<T extends object = object> = ClassConstructor<T>;

const primitiveTypes: ClassType[] = [String, Boolean, Number, Array, Object];

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(
    value: unknown,
    { metatype, type }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.shouldValidate(metatype) || type === 'custom') {
      return value;
    }

    if (typeof value !== 'object' || value === null) {
      return value;
    }

    const objectInstance = plainToInstance(metatype, value);

    const errors = await validate(objectInstance);

    if (errors.length > 0) {
      const formattedErrors: Record<string, string[]> = {};
      errors.forEach((error) => {
        if (error.constraints) {
          formattedErrors[error.property] = Object.values(error.constraints);
        }
      });

      throw new CustomHttpException(
        {
          message: 'Validation failed',
          errors: formattedErrors,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return objectInstance;
  }

  private shouldValidate(metatype?: Type<unknown>): metatype is ClassType {
    if (!metatype) {
      return false;
    }

    return !primitiveTypes.includes(metatype as ClassType);
  }
}
