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

Required environment variables:

```bash
# Application
PORT=6001
NODE_ENV=development

# Database
DB_TYPE=postgres
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_ENTITIES=dist/modules/**/*.model{.ts,.js}
DB_MIGRATIONS=dist/database/migrations/*{.ts,.js}
DB_SSL=false

# JWT
JWT_SECRET=your_secret_key
JWT_TIMEFRAME=3d

# Other services...
```

## 📚 Documentation

- [API Documentation](http://localhost:PORT/api/docs) - Swagger API documentation (when server is running)

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
