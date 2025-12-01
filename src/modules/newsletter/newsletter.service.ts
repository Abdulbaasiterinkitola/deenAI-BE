import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { NewsletterModelAction } from './newsletter.model-action';
import { UsersService } from '@modules/users/users.service';
import { EmailService } from '@modules/email/email.service';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly newsletterModelAction: NewsletterModelAction,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Subscribe user to newsletter
   */
  async subscribeUser(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // Check if user exists
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new CustomHttpException(
        { message: 'User not found. Please register first.' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if already subscribed
    const existingSubscription = await this.newsletterModelAction.get({
      email,
    });

    if (existingSubscription) {
      if (existingSubscription.isSubscribed) {
        // Already subscribed - idempotent response
        return {
          success: true,
          message: 'You are already subscribed to our newsletter',
        };
      }

      // Resubscribe - update existing record
      await this.newsletterModelAction.update({
        updatePayload: { isSubscribed: true },
        identifierOptions: { email },
        transactionOptions: { useTransaction: false },
      });

      this.logger.log(`User ${email} resubscribed to newsletter`);
    } else {
      // New subscription
      await this.newsletterModelAction.create({
        createPayload: {
          userId: user.id || null,
          email,
          isSubscribed: true,
        },
        transactionOptions: { useTransaction: false },
      });

      this.logger.log(`User ${email} subscribed to newsletter`);
    }

    // Send welcome email (non-blocking)
    this.sendWelcomeEmail(user.email, user.name).catch((error) => {
      this.logger.error(
        `Failed to send welcome email to ${email}: ${error.message}`,
      );
    });

    return {
      success: true,
      message:
        'Successfully subscribed to newsletter! Check your email for confirmation.',
    };
  }

  /**
   * Unsubscribe user from newsletter
   */
  async unsubscribeUser(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // Check if subscription exists
    const subscription = await this.newsletterModelAction.get({ email });

    if (!subscription) {
      // Not subscribed - idempotent response
      return {
        success: true,
        message: 'You are not subscribed to our newsletter',
      };
    }

    if (!subscription.isSubscribed) {
      // Already unsubscribed - idempotent response
      return {
        success: true,
        message: 'You have already unsubscribed from our newsletter',
      };
    }

    // Unsubscribe - update record
    await this.newsletterModelAction.update({
      updatePayload: { isSubscribed: false },
      identifierOptions: { email },
      transactionOptions: { useTransaction: false },
    });

    this.logger.log(`User ${email} unsubscribed from newsletter`);

    // Get user info for email
    const user = await this.usersService.getUserByEmail(email);

    // Send feedback email (non-blocking)
    this.sendFeedbackEmail(email, user?.name || 'User').catch((error) => {
      this.logger.error(
        `Failed to send feedback email to ${email}: ${error.message}`,
      );
    });

    return {
      success: true,
      message:
        "Successfully unsubscribed from newsletter. We'd love to hear your feedback!",
    };
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(email: string): Promise<boolean> {
    const subscription = await this.newsletterModelAction.get({ email });
    return subscription?.isSubscribed || false;
  }

  /**
   * Send welcome email to new subscriber
   */
  private async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.emailService.sendEmail(
        email,
        'Welcome to DeenAI Newsletter!',
        'newsletter-welcome',
        {
          name: name || 'Subscriber',
          unsubscribeLink: `${process.env.FRONTEND_URL}/newsletter/unsubscribe`,
        },
      );
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send feedback request email to unsubscribed user
   */
  private async sendFeedbackEmail(email: string, name: string): Promise<void> {
    try {
      await this.emailService.sendEmail(
        email,
        "We're Sorry to See You Go - DeenAI",
        'newsletter-unsubscribe-feedback',
        {
          name: name || 'User',
          feedbackLink: `${process.env.FRONTEND_URL}/feedback`,
          resubscribeLink: `${process.env.FRONTEND_URL}/newsletter/subscribe`,
        },
      );
      this.logger.log(`Feedback email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send feedback email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get subscription statistics (admin use)
   */
  async getSubscriptionStats(): Promise<{
    total: number;
    subscribed: number;
    unsubscribed: number;
  }> {
    const total = await this.newsletterModelAction.count({});
    const subscribed = await this.newsletterModelAction.count({
      isSubscribed: true,
    });
    const unsubscribed = total - subscribed;

    return {
      total,
      subscribed,
      unsubscribed,
    };
  }
}
