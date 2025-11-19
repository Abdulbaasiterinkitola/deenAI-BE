import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContactBodyValidator } from '../validators/contact.validator';
import { ValidationResponseDto } from '@shared/docs-response.dto';

class ContactSubmissionDoc {
  @ApiProperty({ example: '9a0c31f1-23fb-42c4-b530-7a279c0bb9e0' })
  id: string;

  @ApiProperty({ example: '1250d8ab-64e3-4cd7-9f29-8c828a4a9691' })
  identifier: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Aisha Ahmed' })
  name: string;

  @ApiProperty({ example: 'Feedback about the app' })
  subject: string;

  @ApiProperty({
    example: 'I appreciate the gentle reminders. Thank you for building this!',
  })
  content: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  updatedAt: Date;
}

class ContactSubmissionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Contact form submitted successfully' })
  message: string;

  @ApiProperty({ type: ContactSubmissionDoc })
  data: ContactSubmissionDoc;
}

export const ContactDocs = {
  tag: ApiTags('Contact'),
  submit: () =>
    applyDecorators(
      ApiOperation({ summary: 'Submit a contact form message' }),
      ApiBody({ type: ContactBodyValidator }),
      ApiResponse({
        status: 201,
        description: 'Contact form submitted successfully',
        type: ContactSubmissionResponseDto,
      }),
      ApiResponse({
        status: 422,
        description: 'Validation error',
        type: ValidationResponseDto,
      }),
    ),
};
