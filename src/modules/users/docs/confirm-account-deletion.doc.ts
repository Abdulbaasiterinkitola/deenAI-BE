import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ConfirmAccountDeletionDto } from '../dtos/confirm-account-deletion.dto';
import { AccountDeletionConfirmResponseDto } from '../dtos/account-deletion-confirm-response.dto';

export class ConfirmAccountDeletionDocs {
  static confirmAccountDeletion() {
    return applyDecorators(
      ApiOperation({
        summary: 'Confirm account deletion',
        description:
          "Completes the account deletion process by verifying the OTP sent to the user's email. " +
          "Upon successful verification, the user's account and all associated data will be permanently deleted. " +
          'This action is irreversible and cannot be undone.',
      }),
      ApiBody({
        type: ConfirmAccountDeletionDto,
        description: 'OTP verification for account deletion',
      }),
      ApiResponse({
        status: 200,
        description:
          'Account successfully deleted. All user data has been permanently removed.',
        type: AccountDeletionConfirmResponseDto,
      }),
      ApiResponse({
        status: 400,
        description: 'Bad Request - Invalid or expired OTP',
        schema: {
          example: {
            success: false,
            message: 'Invalid or expired OTP',
            error: 'The provided OTP is incorrect or has expired',
            status_code: 400,
          },
        },
      }),
      ApiResponse({
        status: 401,
        description:
          'Unauthorized - User must be authenticated to confirm account deletion',
        schema: {
          example: {
            success: false,
            message: 'Unauthorized',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 404,
        description:
          'Not Found - No pending deletion request found for this user',
        schema: {
          example: {
            success: false,
            message: 'No pending deletion request found',
            status_code: 404,
          },
        },
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error - Failed to delete the account',
        schema: {
          example: {
            success: false,
            message: 'Failed to delete account',
            status_code: 500,
          },
        },
      }),
    );
  }
}
