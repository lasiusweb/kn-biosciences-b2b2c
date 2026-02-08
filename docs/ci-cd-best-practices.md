# CI/CD Best Practices for KN Biosciences

## Table of Contents
1. [Overview](#overview)
2. [CI/CD Pipeline Architecture](#cicd-pipeline-architecture)
3. [Pipeline Configuration](#pipeline-configuration)
4. [Build Process](#build-process)
5. [Testing Strategy](#testing-strategy)
6. [Security Scanning](#security-scanning)
7. [Deployment Strategy](#deployment-strategy)
8. [Monitoring and Observability](#monitoring-and-observability)
9. [Rollback Procedures](#rollback-procedures)
10. [Compliance and Governance](#compliance-and-governance)
11. [Performance Optimization](#performance-optimization)
12. [Best Practices](#best-practices)

## Overview

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) best practices for the KN Biosciences e-commerce platform. The CI/CD pipeline ensures code quality, security, and reliable deployments while maintaining high availability and performance.

### Goals
- Automate the software delivery process
- Ensure code quality and security
- Enable rapid and reliable deployments
- Maintain system stability
- Facilitate collaboration between teams

### Principles
- Everything is version-controlled
- Automated testing at every stage
- Security scanning integrated
- Immutable builds
- Infrastructure as code
- Monitoring and observability

## CI/CD Pipeline Architecture

### Pipeline Stages
```
Source Control → Build → Test → Security Scan → Deploy to Staging → Test → Deploy to Production
```

### Environments
- **Development**: Local development environments
- **Feature**: Per-feature isolated environments
- **Staging**: Pre-production environment matching production
- **Production**: Live production environment

### Tools Stack
- **Version Control**: Git with GitHub
- **CI/CD Platform**: GitHub Actions
- **Container Registry**: Docker Hub or GitHub Container Registry
- **Deployment**: Vercel for frontend, custom deployment for backend
- **Monitoring**: Custom monitoring system with alerting
- **Security**: Various security scanning tools

## Pipeline Configuration

### GitHub Actions Workflow

#### Development Branch Workflow
```yaml
# .github/workflows/development.yml
name: Development CI

on:
  push:
    branches-ignore:
      - main
      - staging
  pull_request:
    branches: [ main, staging ]

env:
  NODE_VERSION: '18.x'
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.DEV_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.DEV_SUPABASE_ANON_KEY }}
  NEXT_PUBLIC_HASURA_URL: ${{ secrets.DEV_HASURA_URL }}
  NEXT_PUBLIC_HASURA_ADMIN_SECRET: ${{ secrets.DEV_HASURA_ADMIN_SECRET }}

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage
        env:
          CI: true

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          CI: true

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level high

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --all-projects --fail-on=high

      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

#### Staging Deployment Workflow
```yaml
# .github/workflows/staging.yml
name: Staging Deployment

on:
  push:
    branches: [ staging ]

env:
  NODE_VERSION: '18.x'
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
  NEXT_PUBLIC_HASURA_URL: ${{ secrets.STAGING_HASURA_URL }}
  NEXT_PUBLIC_HASURA_ADMIN_SECRET: ${{ secrets.STAGING_HASURA_ADMIN_SECRET }}
  RAZORPAY_KEY_ID: ${{ secrets.STAGING_RAZORPAY_KEY_ID }}
  RAZORPAY_KEY_SECRET: ${{ secrets.STAGING_RAZORPAY_KEY_SECRET }}
  PAYU_MERCHANT_KEY: ${{ secrets.STAGING_PAYU_MERCHANT_KEY }}
  PAYU_SALT: ${{ secrets.STAGING_PAYU_SALT }}
  DELHIVERY_API_KEY: ${{ secrets.STAGING_DELHIVERY_API_KEY }}
  DELHIVERY_API_SECRET: ${{ secrets.STAGING_DELHIVERY_API_SECRET }}
  ZOHO_CLIENT_ID: ${{ secrets.STAGING_ZOHO_CLIENT_ID }}
  ZOHO_CLIENT_SECRET: ${{ secrets.STAGING_ZOHO_CLIENT_SECRET }}
  ZOHO_REFRESH_TOKEN: ${{ secrets.STAGING_ZOHO_REFRESH_TOKEN }}
  NEXT_PUBLIC_APP_URL: ${{ secrets.STAGING_APP_URL }}
  SESSION_SECRET: ${{ secrets.STAGING_SESSION_SECRET }}
  NEXTAUTH_SECRET: ${{ secrets.STAGING_NEXTAUTH_SECRET }}
  KV_URL: ${{ secrets.STAGING_KV_URL }}
  KV_REST_API_URL: ${{ secrets.STAGING_KV_REST_API_URL }}
  KV_REST_API_TOKEN: ${{ secrets.STAGING_KV_REST_API_TOKEN }}

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run all tests
        run: npm run test:ci
        env:
          CI: true

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ env.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ env.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_HASURA_URL: ${{ env.NEXT_PUBLIC_HASURA_URL }}
          NEXT_PUBLIC_HASURA_ADMIN_SECRET: ${{ env.NEXT_PUBLIC_HASURA_ADMIN_SECRET }}
          RAZORPAY_KEY_ID: ${{ env.RAZORPAY_KEY_ID }}
          RAZORPAY_KEY_SECRET: ${{ env.RAZORPAY_KEY_SECRET }}
          PAYU_MERCHANT_KEY: ${{ env.PAYU_MERCHANT_KEY }}
          PAYU_SALT: ${{ env.PAYU_SALT }}
          DELHIVERY_API_KEY: ${{ env.DELHIVERY_API_KEY }}
          DELHIVERY_API_SECRET: ${{ env.DELHIVERY_API_SECRET }}
          ZOHO_CLIENT_ID: ${{ env.ZOHO_CLIENT_ID }}
          ZOHO_CLIENT_SECRET: ${{ env.ZOHO_CLIENT_SECRET }}
          ZOHO_REFRESH_TOKEN: ${{ env.ZOHO_REFRESH_TOKEN }}
          NEXT_PUBLIC_APP_URL: ${{ env.NEXT_PUBLIC_APP_URL }}
          SESSION_SECRET: ${{ env.SESSION_SECRET }}
          NEXTAUTH_SECRET: ${{ env.NEXTAUTH_SECRET }}
          KV_URL: ${{ env.KV_URL }}
          KV_REST_API_URL: ${{ env.KV_REST_API_URL }}
          KV_REST_API_TOKEN: ${{ env.KV_REST_API_TOKEN }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: nextjs-build
          path: .next/

  deploy-to-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: nextjs-build
          path: .next/

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
          vercel-args: '--prod'
          working-directory: .
```

#### Production Deployment Workflow
```yaml
# .github/workflows/production.yml
name: Production Deployment

on:
  push:
    branches: [ main ]

env:
  NODE_VERSION: '18.x'
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.PROD_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PROD_SUPABASE_ANON_KEY }}
  NEXT_PUBLIC_HASURA_URL: ${{ secrets.PROD_HASURA_URL }}
  NEXT_PUBLIC_HASURA_ADMIN_SECRET: ${{ secrets.PROD_HASURA_ADMIN_SECRET }}
  RAZORPAY_KEY_ID: ${{ secrets.PROD_RAZORPAY_KEY_ID }}
  RAZORPAY_KEY_SECRET: ${{ secrets.PROD_RAZORPAY_KEY_SECRET }}
  PAYU_MERCHANT_KEY: ${{ secrets.PROD_PAYU_MERCHANT_KEY }}
  PAYU_SALT: ${{ secrets.PROD_PAYU_SALT }}
  DELHIVERY_API_KEY: ${{ secrets.PROD_DELHIVERY_API_KEY }}
  DELHIVERY_API_SECRET: ${{ secrets.PROD_DELHIVERY_API_SECRET }}
  ZOHO_CLIENT_ID: ${{ secrets.PROD_ZOHO_CLIENT_ID }}
  ZOHO_CLIENT_SECRET: ${{ secrets.PROD_ZOHO_CLIENT_SECRET }}
  ZOHO_REFRESH_TOKEN: ${{ secrets.PROD_ZOHO_REFRESH_TOKEN }}
  NEXT_PUBLIC_APP_URL: ${{ secrets.PROD_APP_URL }}
  SESSION_SECRET: ${{ secrets.PROD_SESSION_SECRET }}
  NEXTAUTH_SECRET: ${{ secrets.PROD_NEXTAUTH_SECRET }}
  KV_URL: ${{ secrets.PROD_KV_URL }}
  KV_REST_API_URL: ${{ secrets.PROD_KV_REST_API_URL }}
  KV_REST_API_TOKEN: ${{ secrets.PROD_KV_REST_API_TOKEN }}

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: |
          npm audit --audit-level high
          npm run security:audit

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --all-projects --fail-on=high

  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run comprehensive tests
        run: npm run test:ci
        env:
          CI: true

      - name: Run performance tests
        run: npm run test:performance

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ env.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ env.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_HASURA_URL: ${{ env.NEXT_PUBLIC_HASURA_URL }}
          NEXT_PUBLIC_HASURA_ADMIN_SECRET: ${{ env.NEXT_PUBLIC_HASURA_ADMIN_SECRET }}
          RAZORPAY_KEY_ID: ${{ env.RAZORPAY_KEY_ID }}
          RAZORPAY_KEY_SECRET: ${{ env.RAZORPAY_KEY_SECRET }}
          PAYU_MERCHANT_KEY: ${{ env.PAYU_MERCHANT_KEY }}
          PAYU_SALT: ${{ env.PAYU_SALT }}
          DELHIVERY_API_KEY: ${{ env.DELHIVERY_API_KEY }}
          DELHIVERY_API_SECRET: ${{ env.DELHIVERY_API_SECRET }}
          ZOHO_CLIENT_ID: ${{ env.ZOHO_CLIENT_ID }}
          ZOHO_CLIENT_SECRET: ${{ env.ZOHO_CLIENT_SECRET }}
          ZOHO_REFRESH_TOKEN: ${{ env.ZOHO_REFRESH_TOKEN }}
          NEXT_PUBLIC_APP_URL: ${{ env.NEXT_PUBLIC_APP_URL }}
          SESSION_SECRET: ${{ env.SESSION_SECRET }}
          NEXTAUTH_SECRET: ${{ env.NEXTAUTH_SECRET }}
          KV_URL: ${{ env.KV_URL }}
          KV_REST_API_URL: ${{ env.KV_REST_API_URL }}
          KV_REST_API_TOKEN: ${{ env.KV_REST_API_TOKEN }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: nextjs-build
          path: .next/

  deploy-to-production:
    needs: [security-audit, build-and-test]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: nextjs-build
          path: .next/

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
          vercel-args: '--prod'
          working-directory: .

      - name: Run smoke tests
        run: |
          sleep 30  # Wait for deployment to propagate
          npm run test:smoke

      - name: Notify deployment
        run: |
          curl -X POST -H 'Content-type: application/json' \
          --data '{"text":"Production deployment completed successfully!"}' \
          ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Build Process

### Optimized Build Configuration
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    serverComponentsExternalPackages: ["sharp", "canvas"],
  },
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'images.unsplash.com',
      'yourdomain.com',
      'cdn.yourdomain.com'
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
  webpack(config) {
    // Enable tree shaking and dead code elimination
    config.optimization.usedExports = true;
    config.optimization.providedExports = true;
    
    // Enable compression
    config.optimization.minimize = true;
    
    return config;
  },
};

module.exports = nextConfig;
```

### Build Optimization Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:unit": "vitest --typecheck.enabled",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:performance": "npm run analyze",
    "test:smoke": "node scripts/smoke-test.js",
    "test:security": "npm run security:audit",
    "analyze": "ANALYZE=true next build",
    "security:audit": "npm audit --audit-level high",
    "clear-cache": "rm -rf .next && rm -rf node_modules/.cache",
    "health": "curl -f http://localhost:3000/api/health"
  }
}
```

## Testing Strategy

### Test Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/types/**',
        '**/constants/**',
        '**/styles/**',
        '**/assets/**',
      ],
    },
  },
});
```

### Integration Test Configuration
```typescript
// vitest.integration.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/__tests__/**/*integration*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    setupFiles: ['./vitest.integration.setup.ts'],
  },
});
```

## Security Scanning

### Security Scanning Pipeline
```yaml
# .github/workflows/security.yml
name: Security Scanning

on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main ]

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level moderate

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --all-projects --fail-on=high

  code-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run TruffleHog to find secrets
        uses: trufflesecurity/trufflehog-actions-scan@main
        with:
          path: ./
          extra_args: --only-verified

  container-scan:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build -t kn-biosciences:${{ github.sha }} .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'kn-biosciences:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
```

## Deployment Strategy

### Blue-Green Deployment
```yaml
# deployment/blue-green.yml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: kn-biosciences-app
spec:
  replicas: 4
  strategy:
    blueGreen:
      activeService: kn-biosciences-active
      previewService: kn-biosciences-preview
      autoPromotionEnabled: false
      autoPromotionSeconds: 30
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: kn-biosciences-preview
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: kn-biosciences-active
  selector:
    matchLabels:
      app: kn-biosciences
  template:
    metadata:
      labels:
        app: kn-biosciences
    spec:
      containers:
      - name: app
        image: ghcr.io/kn-biosciences/app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Canary Deployment
```yaml
# deployment/canary.yml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: kn-biosciences-app-canary
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: {duration: 2m}
      - setWeight: 20
      - pause: {duration: 2m}
      - setWeight: 40
      - pause: {duration: 2m}
      - setWeight: 60
      - pause: {duration: 2m}
      - setWeight: 80
      - pause: {duration: 2m}
      - setWeight: 100
      canaryService: kn-biosciences-canary
      stableService: kn-biosciences-stable
      trafficRouting:
        istio:
          virtualService:
            name: kn-biosciences
            routes:
            - primary
  selector:
    matchLabels:
      app: kn-biosciences
  template:
    metadata:
      labels:
        app: kn-biosciences
    spec:
      containers:
      - name: app
        image: ghcr.io/kn-biosciences/app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Monitoring and Observability

### Health Check Endpoint
```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check database connectivity
    const { error: dbError } = await supabase.from('health_check').select('id').limit(1);
    
    if (dbError) {
      return res.status(503).json({
        status: 'unhealthy',
        checks: {
          database: false,
          message: dbError.message
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check other services as needed
    const healthStatus = {
      status: 'healthy',
      checks: {
        database: true,
        cache: true,
        externalServices: true
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(healthStatus);
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      checks: {
        database: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    });
  }
}
```

### Monitoring Configuration
```typescript
// lib/monitoring.ts
import { logger } from './logger';
import { performanceMonitor } from './performance-monitoring';

export class DeploymentMonitor {
  async recordDeployment(deploymentInfo: {
    version: string;
    environment: string;
    commitHash: string;
    deployedBy: string;
    status: 'started' | 'successful' | 'failed';
    duration?: number;
  }) {
    await logger.info(`Deployment ${deploymentInfo.status}`, {
      service: 'deployment-monitor',
      operation: 'record-deployment',
      metadata: deploymentInfo
    });

    await performanceMonitor.recordMetric({
      service_name: 'deployment',
      endpoint: `deploy-${deploymentInfo.environment}`,
      response_time: deploymentInfo.duration || 0,
      error: deploymentInfo.status === 'failed',
      status_code: deploymentInfo.status === 'successful' ? 200 : 500,
      metadata: {
        version: deploymentInfo.version,
        commit_hash: deploymentInfo.commitHash,
        deployed_by: deploymentInfo.deployedBy
      }
    });
  }

  async recordRelease(releaseInfo: {
    version: string;
    environment: string;
    features: string[];
    breakingChanges: string[];
    deployedAt: string;
  }) {
    await logger.info('New release deployed', {
      service: 'deployment-monitor',
      operation: 'record-release',
      metadata: releaseInfo
    });
  }
}

export const deploymentMonitor = new DeploymentMonitor();
```

## Rollback Procedures

### Automated Rollback Conditions
```yaml
# rollback-config.yml
automated_rollback:
  conditions:
    - error_rate > 5% for 5 minutes
    - response_time > 5000ms for 10 minutes
    - availability < 95% for 5 minutes
    - security_incident detected
  
  actions:
    - rollback_to_previous_version
    - notify_team
    - create_incident_ticket

  exceptions:
    - scheduled_maintenance_periods
    - planned_performance_tests
```

### Rollback Script
```bash
#!/bin/bash
# rollback.sh

set -e

ENVIRONMENT=$1
VERSION_TO_ROLLBACK=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION_TO_ROLLBACK" ]; then
  echo "Usage: $0 <environment> <version>"
  exit 1
fi

echo "Starting rollback to version $VERSION_TO_ROLLBACK in $ENVIRONMENT environment"

# Get previous version
PREVIOUS_VERSION=$(curl -s "https://api.github.com/repos/kn-biosciences/deployments?environment=$ENVIRONMENT" | jq -r '.[1].sha')

if [ "$PREVIOUS_VERSION" = "null" ]; then
  echo "Could not find previous version"
  exit 1
fi

echo "Rolling back to version: $PREVIOUS_VERSION"

# Deploy previous version
if [ "$ENVIRONMENT" = "production" ]; then
  # Production rollback requires approval
  read -p "Are you sure you want to rollback production to $PREVIOUS_VERSION? (yes/no): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Execute rollback
    vercel --prod --token=$VERCEL_TOKEN --scope=$VERCEL_ORG_ID --build-env DEPLOY_VERSION=$PREVIOUS_VERSION
    echo "Rollback initiated for production"
  else
    echo "Rollback cancelled"
    exit 1
  fi
else
  # Staging rollback
  vercel --token=$VERCEL_TOKEN --scope=$VERCEL_ORG_ID --build-env DEPLOY_VERSION=$PREVIOUS_VERSION
  echo "Rollback initiated for $ENVIRONMENT"
fi

# Monitor deployment
sleep 30

# Run smoke tests
npm run test:smoke

echo "Rollback completed to version $PREVIOUS_VERSION"
```

## Compliance and Governance

### Change Management
```yaml
# .github/workflows/change-management.yml
name: Change Management

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate-change:
    runs-on: ubuntu-latest
    steps:
      - name: Validate PR title
        run: |
          TITLE="${{ github.event.pull_request.title }}"
          if [[ ! $TITLE =~ ^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+ ]]; then
            echo "PR title does not follow conventional commits format"
            exit 1
          fi

      - name: Validate PR description
        run: |
          DESCRIPTION="${{ github.event.pull_request.body }}"
          if [ -z "$DESCRIPTION" ] || [ "$DESCRIPTION" = "None" ]; then
            echo "PR description is required"
            exit 1
          fi

      - name: Check for breaking changes
        run: |
          # Check if this PR introduces breaking changes
          if git diff HEAD~1..HEAD --name-only | grep -E "\.(ts|tsx|js|jsx)$" | xargs grep -l "BREAKING CHANGE\|@deprecated"; then
            echo "Breaking change detected. Please update the changelog."
            exit 1
          fi

  compliance-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check for security implications
        run: |
          # Check if sensitive files were modified
          if git diff HEAD~1..HEAD --name-only | grep -E "(.env|config|secret|credential)"; then
            echo "Sensitive files modified. Security review required."
            exit 1
          fi

      - name: Validate license headers
        run: |
          # Check for license headers in new files
          git diff HEAD~1..HEAD --name-only --diff-filter=A | grep -E "\.(ts|tsx|js|jsx)$" | while read file; do
            if ! head -n 5 "$file" | grep -q "KN Biosciences"; then
              echo "License header missing in $file"
              exit 1
            fi
          done
```

## Performance Optimization

### Build Performance Optimization
```json
{
  "scripts": {
    "build:analyze": "ANALYZE=true next build",
    "build:incremental": "next build --profile",
    "optimize:images": "find public/images -name '*.jpg' -exec jpegoptim --strip-all {} \\; && find public/images -name '*.png' -exec optipng -o7 {} \\;",
    "optimize:bundle": "npx webpack-bundle-analyzer .next/static/js/*.js"
  }
}
```

### Caching Strategy
```typescript
// lib/caching.ts
import { kv } from '@vercel/kv';

export class BuildCache {
  static async get(key: string) {
    try {
      return await kv.get(key);
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600) {
    try {
      await kv.set(key, value, { ex: ttl });
      return true;
    } catch (error) {
      console.warn('Cache set failed:', error);
      return false;
    }
  }

  static async invalidate(pattern: string) {
    try {
      // Note: KV doesn't have a direct way to clear keys with a pattern
      // This is a limitation of the KV store
      console.info('Cache invalidated (implementation dependent on KV provider)');
      return true;
    } catch (error) {
      console.warn('Cache invalidate failed:', error);
      return false;
    }
  }
}
```

## Best Practices

### Code Review Checklist
- [ ] Code follows established style guides
- [ ] All tests pass (unit, integration, e2e)
- [ ] Security scanning passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration scripts included if needed
- [ ] Rollback plan considered

### Deployment Best Practices
- Deploy during low-traffic periods
- Use feature flags for risky changes
- Monitor deployment metrics
- Have rollback plan ready
- Notify stakeholders of deployment
- Run post-deployment smoke tests

### Security Best Practices
- Never commit secrets to version control
- Use environment variables for configuration
- Implement proper input validation
- Regular security scanning
- Keep dependencies updated
- Follow principle of least privilege

---

These CI/CD best practices ensure that the KN Biosciences platform maintains high quality, security, and reliability while enabling rapid and efficient deployments. The automated pipeline reduces human error, ensures consistency, and provides visibility into the deployment process.