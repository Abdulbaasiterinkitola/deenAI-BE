import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { AccountDeletionRequestResponseDto } from '../dtos/account-deletion-request-response.dto';

export class RequestAccountDeletionDocs {
  static requestAccountDeletion() {
    return applyDecorators(
      ApiOperation({
        summary: 'Request account deletion',
        description:
          "Initiates the account deletion process by sending a verification OTP to the user's email. " +
          'This is the first step in permanently deleting a user account. ' +
          'The user must verify the deletion request using the OTP sent to their email.',
      }),
      ApiResponse({
        status: 201,
        description:
          "Account deletion request successfully created. An OTP has been sent to the user's email for verification.",
        type: AccountDeletionRequestResponseDto,
      }),
      ApiResponse({
        status: 401,
        description:
          'Unauthorized - User must be authenticated to request account deletion',
        schema: {
          example: {
            success: false,
            message: 'Unauthorized',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 500,
        description:
          'Internal server error - Failed to process the deletion request',
        schema: {
          example: {
            success: false,
            message: 'Failed to process account deletion request',
            status_code: 500,
          },
        },
      }),
    );
  }
}
