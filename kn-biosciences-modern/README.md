# KN Biosciences Modern - World-Class Agricultural E-Commerce Platform

A comprehensive D2C and B2B e-commerce platform for farmers and dealers/distributors in the agricultural sector.

## 🌱 Project Overview

This is a modern, scalable e-commerce platform built specifically for the agricultural industry, serving both individual farmers (D2C) and dealers/distributors (B2B) with a complete range of agricultural and aquaculture solutions.

## 🚀 Tech Stack

### Backend (API)
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **API**: GraphQL with Apollo
- **Authentication**: JWT with refresh tokens
- **Caching**: Redis
- **File Storage**: AWS S3 / Supabase Storage

### Frontend (Client)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form with Yup validation
- **Animations**: Framer Motion
- **Charts**: Recharts

## 📦 Project Structure

```
kn-biosciences-modern/
├── api/                    # Backend API service
│   ├── src/
│   │   ├── entities/      # Database entities
│   │   ├── dto/           # Data transfer objects
│   │   ├── guards/        # Authentication guards
│   │   ├── pipes/         # Validation pipes
│   │   ├── modules/       # Feature modules
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utility libraries
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript type definitions
│   │   ├── app/           # Next.js app router pages
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── next.config.js
├── shared/                 # Shared utilities and types
├── infrastructure/         # Infrastructure as code
└── docs/                   # Documentation
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL
- Redis
- Docker (optional, for containerization)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kn-biosciences-modern
```

2. Install dependencies for both services:
```bash
# Install root dependencies
npm install

# Install API dependencies
cd api && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

3. Set up environment variables:
```bash
# Copy environment files
cp api/.env.example api/.env
cp client/.env.example client/.env.local
```

4. Set up the database:
```bash
# Run database migrations
cd api && npm run db:migrate
```

5. Start the development servers:
```bash
# Option 1: Run both services concurrently
npm run dev

# Option 2: Run services separately
# Terminal 1:
cd api && npm run dev

# Terminal 2:
cd client && npm run dev
```

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Run API tests
cd api && npm run test

# Run client tests
cd client && npm run test
```

## 🚢 Deployment

The application is designed for deployment on modern cloud platforms:

- **Recommended**: Vercel for frontend, AWS/GCP for backend
- **Alternative**: Docker containers with Kubernetes
- **CI/CD**: GitHub Actions or similar

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/kn-biosciences/modern/issues)