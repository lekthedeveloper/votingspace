# 🗳️ Collaborative Decision Voting App - Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.x-orange)

A robust backend API for anonymous collaborative decision-making through voting.

## ✨ Features

- 🔐 **User Authentication** (JWT)
- 🏠 **Decision Rooms** with configurable options
- 🎭 **Anonymous Voting** system
- ⚡ **Real-time Results** (via WebSockets)
- 📚 **API Documentation** (Swagger)
- 🛡️ **Rate Limiting** & Security Middlewares

## 🛠️ Tech Stack

- ⚡ **Runtime**: Node.js 18+
- 📘 **Language**: TypeScript 5
- 🚀 **Framework**: Express.js
- 🐘 **Database**: PostgreSQL (with Prisma ORM)
- 🔑 **Authentication**: JWT with refresh tokens
- 📖 **API Docs**: Swagger UI
- 🐳 **Containerization**: Docker

## 🚀 Setup Instructions

### 1. 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- NPM (Node Package Manager)

### 2. 📦 Installation

```bash
# Clone repository
git clone https://github.com/your-repo/voting-app-backend.git
cd voting-app-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### 3. ⚙️ Configure Environment

Edit the `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/votingapp?schema=public"

# JWT
JWT_SECRET=your_secure_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Email (for password reset)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_username
EMAIL_PASSWORD=your_password
```

### 4. 🗄️ Database Setup

```bash
# Initialize Prisma (if starting fresh)
npx prisma init

# Run migrations to create database tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Optional: Seed database with initial data
npx prisma db seed

# View your database in Prisma Studio
npx prisma studio
```

## 5. 🔄 Prisma Commands

```bash
# Initialize Prisma in your project
npx prisma init

# Create and apply a new migration
npx prisma migrate dev --name your_migration_name

# Generate Prisma client after schema changes
npx prisma generate

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Format your Prisma schema
npx prisma format

# Validate your Prisma schema
npx prisma validate
```

### 6. 🏃‍♂️ Running the App

```bash
# Development mode (watch)
npm run dev

# Production build
npm run build && npm start
```

## 📖 API Documentation

Access Swagger UI at `http://localhost:5000/api-docs` when running locally.

### 🔗 Key Endpoints

| Method | Endpoint | Description | Icon |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | 👤 |
| POST | `/api/v1/auth/login` | Login user | 🔐 |
| POST | `/api/v1/rooms` | Create decision room | 🏠 |
| GET | `/api/v1/rooms/:id` | Get room details | 📋 |
| POST | `/api/v1/votes/:roomId` | Cast vote in room | 🗳️ |
| GET | `/api/v1/rooms/:id/stats` | Get voting statistics | 📊 |

## 🚀 Deployment

### 🐳 Option 1: Docker

```bash
docker build -t voting-backend .
docker run -p 5000:5000 --env-file .env voting-backend
```

### ☁️ Option 2: Render/Heroku

1. 🗄️ Set up PostgreSQL add-on
2. ⚙️ Configure environment variables
3. 🔗 Deploy via connected GitHub repo

### 🔒 Production Notes

- 🔐 Use HTTPS
- 🏭 Set `NODE_ENV=production`
- 🌐 Configure proper CORS origins
- 📝 Implement logging rotation

## 👨‍💻 Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Prisma studio (database GUI)
npx prisma studio
```

## 🌍 Environment Variables

| Variable | Required | Default | Description | Icon |
|----------|----------|---------|-------------|------|
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string | 🗄️ |
| `JWT_SECRET` | ✅ | - | Secret for signing JWT tokens | 🔑 |
| `JWT_ACCESS_EXPIRES_IN` | ❌ | 15m | Access token expiry | ⏰ |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | 7d | Refresh token expiry | 🔄 |
| `FRONTEND_URL` | ✅ | - | Allowed CORS origin | 🌐 |
| `PORT` | ❌ | 5000 | Server port | 🚪 |
| `NODE_ENV` | ❌ | development | Runtime environment | 🏗️ |

## 📁 Project Structure

```
voting_backend/
├── 📁 logs/              # Application logs
├── 📁 node_modules/      # Dependencies
├── 📁 prisma/            # Database schema and migrations
│   ├── 📁 migrations/    # Database migration files
│   │   ├── 📄 20250622145215_init/
│   │   ├── 📄 20250622205023_add_password_field/
│   │   └── 📄 20250625011600_sync_database_schema/
│   ├── 📄 migration_lock.toml
│   └── 📄 schema.prisma  # Prisma schema definition
├── 📁 src/               # Source code
│   ├── 📁 config/        # Configuration files
│   ├── 📁 controllers/   # Route controllers
│   ├── 📁 middleware/    # Custom middleware
│   ├── 📁 models/        # Database models
│   ├── 📁 routes/        # API route definitions
│   ├── 📁 services/      # Business logic
│   ├── 📁 types/         # TypeScript interfaces
│   ├── 📁 utils/         # Helper functions
│   ├── 📁 validations/   # Request validations
│   ├── 📁 views/         # View templates
│   ├── 📄 app.ts         # Express app setup
│   └── 📄 server.ts      # Server entry point
├── 📄 .env               # Environment variables
├── 📄 .env.example       # Environment template
├── 📄 .gitignore         # Git ignore rules
├── 📄 check-tables.js    # Database table checker
├── 📄 generate-secrets.js # Secret generation utility
├── 📄 package-lock.json  # NPM lock file
├── 📄 package.json       # Project dependencies
├── 📄 README.md          # Project documentation
├── 📄 test-db-connection.js # Database connection test
├── 📄 test-prisma-client.js # Prisma client test
└── 📄 tsconfig.json      # TypeScript configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
