# DeenAI Backend

DeenAI Backend API built with NestJS, TypeORM, and PostgreSQL.

## 📖 About DeenAI

**DeenAI – Your Intelligent Qur'an-Centered Spiritual Companion**

DeenAI is a warm, intelligent, and faith-centered digital companion designed to help Muslims build a peaceful, consistent, and emotionally supportive relationship with the Qur'an. It brings together AI-guided reflections, a clean Qur'an reading experience, and essential daily worship tools—all in one calming, distraction-free space.

### Key Features

1. **AI-Powered Qur'an Chat**  
   - Qur'anic references, explanations, gentle emotional guidance  

2. **Immersive Qur'an Reader**  
   - Uthmani script, English translation, bookmarks, adjustable fonts  

3. **My Reflections**  
   - Private encrypted journaling, linked ayahs, auto-save  

4. **Prayer Times & Reminders**  
   - Accurate timings, countdown, configurable notifications  

5. **Tasbih**  
   - Simple counter with persistent state

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:hngprojects/deenAI-BE.git
   cd deenAI-BE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **Generate a secure JWT secret:**
   ```bash
   # Method 1: Quick generation
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Method 2: Using the generator script
   node generate-jwt.js secret
   ```
   
   Add the generated secret to your `.env` file:
   ```bash
   JWT_SECRET=your_generated_secret_here
   ```

4. **Run Migrations**
   ```bash
   npm run build
   npm run migration:run
   ```

5. **Start Development Server**
   ```bash
   npm run start:dev
   ```

6. **Access Swagger Documentation**
   ```
   http://localhost:PORT/api/docs
   ```

## 📋 Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start the application in development mode with hot reload
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the application in production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:cov` - Run unit tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run migration:create` - Create a new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:rollback` - Rollback the last migration

## 🏗️ Project Structure

For detailed information about the project structure and architecture, see the architecture documentation in the repository.

## 🔧 Environment Variables

Required environment variables (see `.env.example` for a complete template):

```bash
# Application
PORT=4001
NODE_ENV=development

# Database
DB_TYPE=postgres
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_ENTITIES=dist/entities/**/*.entity{.ts,.js}
DB_MIGRATIONS=dist/database/migrations/*{.ts,.js}
DB_SSL=false

# JWT Authentication
# Generate secure secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_jwt_secret_key_here
JWT_TIMEFRAME=6M

# Email Configuration (SMTP) - Optional
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@yourdomain.com

# OAuth Multi-Platform Configuration
# Google OAuth Client IDs for different platforms
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
ANDRIOD_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
APPLE_CLIENT_ID=your-apple-service-id
```

## 🔐 JWT Token Generation

For development and testing, you can generate JWT tokens:

### Generate JWT Secret
```bash
# Quick method
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using generator script
node generate-jwt.js secret
```

### Generate Test JWT Tokens
```bash
# Basic token
node generate-jwt.js token

# Custom token
node generate-jwt.js token --userId=user123 --email=test@deenai.com --expiresIn=7d
```

### Using Generated Tokens
```bash
# In API requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:6001/api/protected-endpoint
```

For more details, see [JWT_GENERATOR.md](./JWT_GENERATOR.md)

## 📚 Documentation

- [API Documentation](http://localhost:PORT/api/docs) - Swagger API documentation (when server is running)
- [Multi-Platform OAuth](./src/modules/auth/MULTI_PLATFORM_AUTH.md) - OAuth authentication guide
- [JWT Generator](./JWT_GENERATOR.md) - JWT token generation guide

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📝 License

ISC
