# DeenAI Backend - Architecture Documentation

This document outlines the initial backend architecture setup. It covers the core patterns for TypeORM abstraction, error handling, configuration management, and database setup.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Database Setup & TypeORM Configuration](#database-setup--typeorm-configuration)
3. [TypeORM Abstraction Layer](#typeorm-abstraction-layer)
4. [Error Handling](#error-handling)
5. [Configuration Management](#configuration-management)
6. [Application Bootstrap](#application-bootstrap)
7. [Key Patterns & Best Practices](#key-patterns--best-practices)

---

## Project Structure

```
src/
├── app.module.ts              # Root module with global configuration
├── main.ts                    # Application entry point
├── config/                    # Configuration files
│   ├── auth.config.ts
│   └── ...
├── database/                  # Database configuration
│   ├── data-source.ts        # TypeORM DataSource configuration
│   ├── migrations/           # Database migrations
│   └── seeds/                # Database seeders
├── entities/                  # Base entities
│   └── base.entity.ts        # Abstract base entity
├── shared/                    # Shared utilities and abstractions
│   ├── abstract-model-action.ts  # TypeORM abstraction layer
│   ├── custom.exception.ts       # Custom exception class
│   ├── validation-exception.filter.ts  # Exception filter
│   ├── env.validator.ts          # Environment variable validation
│   ├── response.interceptor.ts   # Response transformation
│   ├── validator.pipe.ts         # Validation pipe
│   └── helpers/                   # Helper functions
├── modules/                   # Feature modules
│   └── [module-name]/
│       ├── [module].module.ts
│       ├── [module].service.ts       # Main service (bridge)
│       ├── [module].controller.ts
│       ├── [module].model-action.ts  # Extends AbstractModelAction
│       ├── services/                 # Specialized services
│       │   ├── [module]-validation.service.ts
│       │   ├── [module]-query.service.ts
│       │   ├── [module]-core.service.ts
│       │   └── [specific]-[module].service.ts
│       └── models/
│           └── [entity].model.ts
├── guards/                    # Authentication & authorization guards
├── decorators/                # Custom decorators
└── types/                     # TypeScript type definitions
    └── generic/               # Generic types for CRUD operations
```

---

## Database Setup & TypeORM Configuration

### Data Source Configuration (`database/data-source.ts`)

The database connection is configured using TypeORM's `DataSource` class with the following key features:

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const dataSource = new DataSource({
  type: (process.env.DB_TYPE as 'postgres') || 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  database: process.env.DB_NAME,
  entities: [process.env.DB_ENTITIES!],
  migrations: [process.env.DB_MIGRATIONS!],
  namingStrategy: new SnakeNamingStrategy(),  // Converts camelCase to snake_case
  synchronize: false,  // Always false in production - use migrations
  migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true',
});

export async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;
```

**Key Points:**
- Uses `SnakeNamingStrategy` to automatically convert camelCase entity properties to snake_case database columns
- Environment-based configuration (supports `.env` and `.env.test`)
- Manual initialization function for explicit control
- `synchronize: false` - migrations are required for schema changes

### Integration with NestJS (`app.module.ts`)

```typescript
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    ...dataSource.options,
  }),
  dataSourceFactory: async () => {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    return dataSource;
  },
}),
```

**Why this approach:**
- Reuses the same DataSource instance across the application
- Ensures proper initialization before NestJS starts
- Allows migrations to use the same DataSource configuration

### Base Entity (`entities/base.entity.ts`)

All entities should extend this base class to get common fields:

```typescript
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AbstractBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Usage:**
```typescript
import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '@entities/base.entity';

@Entity('users')
export class User extends AbstractBaseEntity {
  @Column()
  email: string;
  
  @Column()
  name: string;
}
```

---

## TypeORM Abstraction Layer

### AbstractModelAction Class

The `AbstractModelAction` class provides a consistent, abstracted interface for all database operations, eliminating direct repository usage in services.

**Location:** `src/shared/abstract-model-action.ts`

**Key Features:**
- Standardized CRUD operations (create, update, delete, get, list)
- Built-in transaction support
- Automatic pagination handling
- Type-safe operations with generics

### Implementation Example

```typescript
// user.model-action.ts
import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { User } from './models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserModelAction extends AbstractModelAction<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, User);
  }
}
```

### Available Methods

#### 1. Create
```typescript
async create(
  createRecordOptions: CreateRecordGeneric<DeepPartial<T>>
): Promise<T | null>
```

**Usage:**
```typescript
const user = await this.userModelAction.create({
  createPayload: { email: 'user@example.com', name: 'John Doe' },
  transactionOptions: { useTransaction: false }
});
```

#### 2. Update
```typescript
async update(
  updateRecordOptions: UpdateRecordGeneric<
    QueryDeepPartialEntity<T>,
    FindOptionsWhere<T>
  >
)
```

**Usage:**
```typescript
const updatedUser = await this.userModelAction.update({
  updatePayload: { name: 'Jane Doe' },
  identifierOptions: { id: 'user-uuid' },
  transactionOptions: { useTransaction: false }
});
```

#### 3. Delete
```typescript
async delete(deleteRecordOptions: DeleteRecordGeneric<FindOptionsWhere<T>>)
```

**Usage:**
```typescript
await this.userModelAction.delete({
  identifierOptions: { id: 'user-uuid' },
  transactionOptions: { useTransaction: false }
});
```

#### 4. Get (Single Record)
```typescript
async get(
  getRecordIdentifierOptions: object,
  queryOptions?: object,
  relations?: object
)
```

**Usage:**
```typescript
const user = await this.userModelAction.get(
  { id: 'user-uuid' },
  {},
  { workspace: true }
);
```

#### 5. List (With Pagination)
```typescript
async list(
  listRecordOptions: ListRecordGeneric<object>
): Promise<{ payload: T[]; paginationMeta: Partial<PaginationMeta> }>
```

**Usage:**
```typescript
const result = await this.userModelAction.list({
  filterRecordOptions: { isActive: true },
  paginationPayload: { limit: 10, page: 1 },
  relations: { workspace: true },
  order: { createdAt: 'DESC' }
});

// Returns:
// {
//   payload: User[],
//   paginationMeta: {
//     total: 100,
//     limit: 10,
//     page: 1,
//     totalPages: 10,
//     hasNext: true,
//     hasPrevious: false
//   }
// }
```

#### 6. Transaction Support
```typescript
async transaction<T>(
  runInTransaction: (manager: EntityManager) => Promise<T>
): Promise<T>
```

**Usage:**
```typescript
await this.userModelAction.transaction(async (manager) => {
  const user = await this.userModelAction.create({
    createPayload: { email: 'user@example.com' },
    transactionOptions: {
      useTransaction: true,
      transaction: manager
    }
  });
  
  // Other operations within the same transaction
  return user;
});
```

#### 7. Helper Methods
- `exists(where: FindOptionsWhere<T>): Promise<boolean>` - Check if record exists
- `count(where: FindOptionsWhere<T>): Promise<number>` - Count records

### Benefits of This Abstraction

1. **Consistency**: All modules use the same CRUD patterns
2. **Type Safety**: Full TypeScript support with generics
3. **Transaction Support**: Built-in transaction handling
4. **Pagination**: Automatic pagination metadata calculation
5. **Maintainability**: Changes to database operations only need to be made in one place
6. **Testability**: Easy to mock the abstraction layer

---

## Error Handling

### Custom Exception Class

**Location:** `src/shared/custom.exception.ts`

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(response: string | Record<string, unknown>, status: HttpStatus) {
    super(response, status);
  }

  getResponse(): { message: string; success: boolean; errors?: unknown } {
    const response = super.getResponse();
    const status_code = this.getStatus();
    const success = status_code === 201 || status_code === 200 ? true : false;

    if (typeof response === 'object' && response !== null) {
      const res = response as Record<string, unknown>;
      return {
        message: (res.message || 'An error occurred') as string,
        errors: res.errors,
        success,
      };
    }

    return {
      message: response,
      success,
    };
  }
}
```

**Usage:**
```typescript
throw new CustomHttpException(
  {
    message: 'User not found',
    errors: { userId: ['Invalid user ID'] }
  },
  HttpStatus.NOT_FOUND
);
```

### Validation Exception Filter

**Location:** `src/shared/validation-exception.filter.ts`

The validation exception filter handles all HTTP exceptions and formats them consistently.

**Registration in `main.ts`:**
```typescript
app.useGlobalFilters(new ValidationExceptionFilter());
```

### Validation Pipe

**Location:** `src/shared/validator.pipe.ts`

The custom validation pipe integrates with `class-validator` and transforms validation errors into a consistent format.

**Registration in `main.ts`:**
```typescript
app.useGlobalPipes(new ValidationPipe());
```

### Response Interceptor

**Location:** `src/shared/response.interceptor.ts`

The response interceptor:
- Transforms responses to a consistent format
- Removes private fields (passwords, IDs, etc.)
- Handles errors consistently

**Response Format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... }  // For paginated responses
}
```

**Registration in `main.ts`:**
```typescript
app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
```

---

## Configuration Management

### Environment Variable Validation

**Location:** `src/shared/env.validator.ts`

All environment variables are validated at application startup using `class-validator`.

### Config Module Setup

**In `app.module.ts`:**
```typescript
ConfigModule.forRoot({
  isGlobal: true,
  validate: validateEnv,  // Validates on startup
  load: [authConfig],      // Loads additional config files
}),
```

### Configuration Files

**Example:** `config/auth.config.ts`
```typescript
import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: (process.env.JWT_TIMEFRAME || '3d') as StringValue,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
}));
```

**Usage in Services:**
```typescript
import { ConfigService } from '@nestjs/config';

constructor(private configService: ConfigService) {
  const authConfig = this.configService.get('auth');
  // Access: authConfig.jwtSecret, authConfig.jwtExpiry, etc.
}
```

### Required Environment Variables

Based on the `.env.example`, ensure these are set:

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

---

## Application Bootstrap

### Main Entry Point (`main.ts`)

The main entry point initializes the NestJS application with:
- Database connection
- Global prefix configuration
- Global pipes, interceptors, and filters
- Swagger documentation

**Key Bootstrap Steps:**
1. Create NestJS application
2. Initialize database connection explicitly
3. Configure global prefix for routes
4. Register global pipes, interceptors, and filters
5. Setup Swagger documentation
6. Start the server

---

## Key Patterns & Best Practices

### 1. Module Structure

Each feature module should follow this structure:

```
modules/[feature]/
├── [feature].module.ts          # Module definition
├── [feature].service.ts          # Main service (bridge between controller and services)
├── [feature].controller.ts       # HTTP endpoints
├── [feature].model-action.ts     # Database operations (extends AbstractModelAction)
├── models/
│   └── [entity].model.ts        # TypeORM entity
├── services/                    # Specialized services
│   ├── [feature]-validation.service.ts
│   ├── [feature]-query.service.ts
│   ├── [feature]-core.service.ts
│   └── [specific]-[feature].service.ts
├── dto/                         # Data Transfer Objects
├── types/                       # TypeScript types
└── validators/                  # Custom validators
```

### 2. Service Architecture Pattern

Services should follow a modular architecture where each service has a single responsibility. The main service acts as a bridge between the controller and specialized services.

#### Service Folder Structure

Each module should have a `services/` folder containing specialized services:

```
modules/[feature]/
├── [feature].service.ts          # Main service (bridge between controller and services)
├── services/
│   ├── [feature]-validation.service.ts    # Validation logic
│   ├── [feature]-query.service.ts        # Complex queries and data retrieval
│   ├── [feature]-core.service.ts         # Core business logic (CRUD operations)
│   ├── [feature]-notification.service.ts # Notification-specific logic
│   └── [specific]-[feature].service.ts  # Other specialized services
```

#### Service Flow

The request flow follows this pattern:

```
Controller → Main Service → Validation Service → Core/Query Service → Model Action → Database
```

#### Main Service (Bridge Pattern)

The main service (`[feature].service.ts`) acts as a bridge between the controller and specialized services. It orchestrates the flow but delegates actual work to specialized services.

#### Validation Service

The validation service (`[feature]-validation.service.ts`) handles all validation logic:
- DTO validation
- Entity existence checks
- Business rule validation
- Parameter validation

#### Query Service

The query service (`[feature]-query.service.ts`) handles complex queries, filtering, pagination, and data retrieval operations.

#### Core Service

The core service (`[feature]-core.service.ts`) handles the core business logic:
- Creating entities
- Updating entities
- Deleting entities
- Complex business operations
- Transaction management

#### Specialized Services

Additional services can be created for specific functionalities:
- **Notification Service** (`[feature]-notification.service.ts`): Handles notifications, emails, etc.
- **Auth Services**: `local-auth.service.ts`, `google-auth.service.ts`, `apple-auth.service.ts` - Each handles one authentication method

#### Key Principles

1. **Single Responsibility**: Each service should do one thing well
2. **Validation First**: Always validate before executing business logic
3. **Main Service as Bridge**: The main service orchestrates but doesn't contain business logic
4. **Separation of Concerns**: 
   - Validation → Validation Service
   - Queries → Query Service
   - Business Logic → Core Service
   - Specific Features → Specialized Services
5. **Service Flow**: Controller → Main Service → Validation → Core/Query → Model Action → Database

### 3. Entity Definition

Always extend `AbstractBaseEntity`:

```typescript
import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '@entities/base.entity';

@Entity('users')
export class User extends AbstractBaseEntity {
  @Column()
  email: string;

  @Column()
  name: string;
}
```

### 4. Error Handling in Controllers

Controllers should use the service layer and let the global exception filter handle errors.

### 5. TypeScript Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@decorators/*": ["src/decorators/*"],
      "@database/*": ["src/database/*"],
      "@entities/*": ["src/entities/*"],
      "@modules/*": ["src/modules/*"],
      "@shared/*": ["src/shared/*"],
      "@guards/*": ["src/guards/*"],
      "@helpers/*": ["src/shared/helpers/*"],
      "@config/*": ["src/config/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

### 6. Database Migrations

**Create migration:**
```bash
npm run migration:create -- src/database/migrations/MigrationName
```

**Run migrations:**
```bash
npm run migration:run
```

**Rollback migration:**
```bash
npm run migration:rollback
```

### 7. Naming Conventions

- **Entities**: PascalCase (e.g., `User`, `Workspace`)
- **Models**: PascalCase with `.model.ts` suffix (e.g., `user.model.ts`)
- **Model Actions**: PascalCase with `.model-action.ts` suffix (e.g., `user.model-action.ts`)
- **Services**: PascalCase with `.service.ts` suffix
- **Controllers**: PascalCase with `.controller.ts` suffix
- **DTOs**: PascalCase with `.dto.ts` suffix
- **Database columns**: snake_case (handled by `SnakeNamingStrategy`)

---

## Summary

This architecture provides:

✅ **Consistent Database Operations** - AbstractModelAction ensures all modules use the same patterns  
✅ **Type Safety** - Full TypeScript support throughout  
✅ **Error Handling** - Standardized error responses and validation  
✅ **Configuration Management** - Validated environment variables at startup  
✅ **Maintainability** - Clear separation of concerns and consistent patterns  
✅ **Scalability** - Easy to add new modules following the established patterns  

By following these patterns, you'll have a robust, maintainable backend that's easy to extend and test.

