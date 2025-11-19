import { Injectable } from '@nestjs/common';
import { ContactDto } from '../dtos/contact.dto';
import { CustomHttpException } from '@shared/custom.exception';
import { HttpStatus } from '@nestjs/common';

type ContactErrors = Partial<Record<keyof ContactDto, string[]>>;

@Injectable()
export class ContactValidationService {
  validatePayload(payload: ContactDto): ContactDto {
    const errors: ContactErrors = {};

    const sanitizedEmail = this.sanitize(payload.email);
    const sanitizedName = this.sanitize(payload.name);
    const sanitizedSubject = this.sanitize(payload.subject);
    const sanitizedContent = this.sanitize(payload.content);

    if (!sanitizedEmail) {
      this.addError(errors, 'email', 'email should not be empty');
    } else if (sanitizedEmail.length > 255) {
      this.addError(errors, 'email', 'email must not exceed 255 characters');
    }

    if (!sanitizedName) {
      this.addError(errors, 'name', 'name should not be empty');
    } else if (sanitizedName.length > 255) {
      this.addError(errors, 'name', 'name must not exceed 255 characters');
    }

    if (!sanitizedSubject) {
      this.addError(errors, 'subject', 'subject should not be empty');
    } else if (sanitizedSubject.length > 255) {
      this.addError(
        errors,
        'subject',
        'subject must not exceed 255 characters',
      );
    }

    if (!sanitizedContent) {
      this.addError(errors, 'content', 'content should not be empty');
    } else if (sanitizedContent.length > 5000) {
      this.addError(
        errors,
        'content',
        'content must not exceed 5000 characters',
      );
    }

    if (Object.keys(errors).length > 0) {
      throw new CustomHttpException(
        {
          message: 'Validation failed',
          errors,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return {
      ...payload,
      email: sanitizedEmail,
      name: sanitizedName,
      subject: sanitizedSubject,
      content: sanitizedContent,
    };
  }

  private sanitize(value: string): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private addError(
    errors: ContactErrors,
    field: keyof ContactDto,
    message: string,
  ): void {
    errors[field] = errors[field] ? [...errors[field], message] : [message];
  }
}
