Email Module Usage Guide
The email module features a primary (SMTP) and fallback (Mailgun) transport for high availability.

**Architecture**
The module follows a Producer-Consumer pattern using Redis and Bull:

API (Producer): The EmailServiceController receives a POST /email request. (for testing the comsumer)

Queue: The EmailService (Producer) creates a job and adds it to the email queue in Redis. The API responds instantly with success: true.

Worker (Consumer): The ProcessMail processor, running in a separate background thread, picks up the job from Redis.

Template Engine: The processor loads an HTML template from the file system (e.g., waitlist.html) and injects variables (like {{name}}).

Transport:

Attempt 1: Tries to send the email via the primary SMTP transport.

Attempt 2 (Fallback): If SMTP fails, it automatically retries sending via the Mailgun API.

Logging: All attempts, successes, and failures are logged by the ProcessMail logger.

Setup

1. Environment Variables

This module is configured entirely by environment variables. Create a .env file in your project root with the following keys:

# Redis Connection
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Primary Transport: SMTP
# (e.g., Gmail, SendGrid, etc.)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM="Your App Name <no-reply@yourapp.com>"

# Alternate MAIL_* variable names (optional)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_NAME=Your App Name
MAIL_FROM_ADDRESS=no-reply@yourapp.com

# Optional domain used in templates
DOMAIN="Your App Name <no-reply@yourapp.com>"


2. HTML Templates
The service loads HTML templates from the file system.

Location: src/modules/email/templates/



<!-- src/modules/email/templates/waitlist.html -->
<h1>Hi {{name}},</h1>
<p>Welcome to our service!</p>


Usage in Other NestJS Modules

The EmailService is exported from the EmailServiceModule, allowing any other module in your application to import, inject, and use it.

This is the recommended way to send emails from your business logic (e.g., in an AuthService after a user signs up).

Step 1: Import EmailServiceModule

In the module that needs to send emails (e.g., AuthModule), add EmailServiceModule to the imports array.

src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailServiceModule } from '../email/email.module'; // 1. Import

@Module({
  imports: [
    EmailServiceModule, // 2. Add to imports
    // ... other modules
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}


Step 2: Inject EmailService

In your service (e.g., AuthService), inject the EmailService into the constructor.

src/modules/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service'; // 1. Import

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService, // 2. Inject
  ) {}

  async signUp(email: string, name: string) {
    // ... your logic to create a user ...

    // 3. Call the service directly
    await this.emailService.sendEmail(
      email,
      name,
      subject,
      'welcome', // This is the template name
    );

    // ... return user or token ...
  }
}

