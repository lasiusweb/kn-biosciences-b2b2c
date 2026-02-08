# Production Deployment Configuration for KN Biosciences

## Vercel Configuration
```json
{
  "version": 2,
  "name": "kn-biosciences",
  "framework": "nextjs",
  "settings": {
    "frameworkDetection": true,
    "serverless": true,
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "outputDirectory": "."
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_APP_URL": "https://your-domain.vercel.app"
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "regions": ["hnd1", "iad1", "sfo1", "cle1", "gru1", "cdg1", "ams1", "lhr1", "fra1"]
}
```

## Docker Configuration
```dockerfile
# Use the official Node.js runtime as a parent image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about usage.
# Learn more here: https://nextjs.org/telemetry
# Disable telemetry collection
RUN npx next telemetry disable

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

## Docker Compose for Local Development
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      target: runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=http://supabase:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key
      - SUPABASE_SERVICE_ROLE_KEY=service_role_key
      - NEXT_PUBLIC_HASURA_URL=http://hasura:8080/v1/graphql
      - NEXT_PUBLIC_HASURA_ADMIN_SECRET=hasura_admin_secret
      - RAZORPAY_KEY_ID=test_key
      - RAZORPAY_KEY_SECRET=test_secret
      - PAYU_MERCHANT_KEY=test_merchant
      - PAYU_SALT=test_salt
      - DELHIVERY_API_KEY=test_key
      - DELHIVERY_API_SECRET=test_secret
      - ZOHO_CLIENT_ID=test_client
      - ZOHO_CLIENT_SECRET=test_secret
      - ZOHO_REFRESH_TOKEN=test_refresh
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      - SESSION_SECRET=super_secret_session_key
      - NEXTAUTH_SECRET=nextauth_secret
      - KV_URL=redis://redis:6379
      - KV_REST_API_URL=http://redis:6379
      - KV_REST_API_TOKEN=redis_token
    depends_on:
      - supabase
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  supabase:
    image: supabase/postgres:15
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: kn_biosciences
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
      - supabase_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  hasura:
    image: hasura/graphql-engine:v2.15.2
    ports:
      - "8080:8080"
    depends_on:
      - supabase
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:postgres@supabase:5432/kn_biosciences
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
      HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup, http-log, webhook-log, websocket-log, query-log
      HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256", "key": "very_secret_key"}'
      HASURA_GRAPHQL_ADMIN_SECRET: hasura_admin_secret

volumes:
  supabase_data:
  redis_data:
```

## Kubernetes Configuration (Production)
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kn-biosciences
  labels:
    app: kn-biosciences
spec:
  replicas: 3
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
        image: your-registry/kn-biosciences:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: supabase-url
        - name: NEXT_PUBLIC_SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: supabase-anon-key
        - name: SUPABASE_SERVICE_ROLE_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: supabase-service-role-key
        - name: NEXT_PUBLIC_HASURA_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: hasura-url
        - name: NEXT_PUBLIC_HASURA_ADMIN_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: hasura-admin-secret
        - name: RAZORPAY_KEY_ID
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: razorpay-key-id
        - name: RAZORPAY_KEY_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: razorpay-key-secret
        - name: PAYU_MERCHANT_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: payu-merchant-key
        - name: PAYU_SALT
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: payu-salt
        - name: DELHIVERY_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: delhivery-api-key
        - name: DELHIVERY_API_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: delhivery-api-secret
        - name: ZOHO_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: zoho-client-id
        - name: ZOHO_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: zoho-client-secret
        - name: ZOHO_REFRESH_TOKEN
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: zoho-refresh-token
        - name: NEXT_PUBLIC_APP_URL
          value: "https://yourdomain.com"
        - name: SESSION_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: session-secret
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: nextauth-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: kn-biosciences-service
spec:
  selector:
    app: kn-biosciences
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kn-biosciences-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "8m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: kn-biosciences-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kn-biosciences-service
            port:
              number: 80
```

## GitHub Actions CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run test
      
    - name: Run type checking
      run: npm run type-check

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        NEXT_PUBLIC_HASURA_URL: ${{ secrets.NEXT_PUBLIC_HASURA_URL }}
        NEXT_PUBLIC_HASURA_ADMIN_SECRET: ${{ secrets.NEXT_PUBLIC_HASURA_ADMIN_SECRET }}
        RAZORPAY_KEY_ID: ${{ secrets.RAZORPAY_KEY_ID }}
        RAZORPAY_KEY_SECRET: ${{ secrets.RAZORPAY_KEY_SECRET }}
        PAYU_MERCHANT_KEY: ${{ secrets.PAYU_MERCHANT_KEY }}
        PAYU_SALT: ${{ secrets.PAYU_SALT }}
        DELHIVERY_API_KEY: ${{ secrets.DELHIVERY_API_KEY }}
        DELHIVERY_API_SECRET: ${{ secrets.DELHIVERY_API_SECRET }}
        ZOHO_CLIENT_ID: ${{ secrets.ZOHO_CLIENT_ID }}
        ZOHO_CLIENT_SECRET: ${{ secrets.ZOHO_CLIENT_SECRET }}
        ZOHO_REFRESH_TOKEN: ${{ secrets.ZOHO_REFRESH_TOKEN }}
        NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
        SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
        NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        KV_URL: ${{ secrets.KV_URL }}
        KV_REST_API_URL: ${{ secrets.KV_REST_API_URL }}
        KV_REST_API_TOKEN: ${{ secrets.KV_REST_API_TOKEN }}

    - name: Deploy to Vercel
      run: |
        npm install -g vercel
        vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --scope=${{ secrets.VERCEL_ORG_ID }}
```

## Environment-Specific Configuration

### Production Environment
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://www.knbiosciences.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_HASURA_URL=https://your-project.hasura.app/v1/graphql
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your_production_hasura_secret
RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_key_secret
PAYU_MERCHANT_KEY=your_production_merchant_key
PAYU_SALT=your_production_salt
DELHIVERY_API_KEY=your_production_delhivery_key
DELHIVERY_API_SECRET=your_production_delhivery_secret
ZOHO_CLIENT_ID=your_production_zoho_client_id
ZOHO_CLIENT_SECRET=your_production_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_production_zoho_refresh_token
SESSION_SECRET=your_production_session_secret
NEXTAUTH_SECRET=your_production_nextauth_secret
KV_URL=your_production_kv_url
KV_REST_API_URL=your_production_kv_rest_api_url
KV_REST_API_TOKEN=your_production_kv_rest_api_token
```

### Staging Environment
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.knbiosciences.com
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
NEXT_PUBLIC_HASURA_URL=https://staging-project.hasura.app/v1/graphql
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your_staging_hasura_secret
RAZORPAY_KEY_ID=your_staging_razorpay_key_id
RAZORPAY_KEY_SECRET=your_staging_razorpay_key_secret
PAYU_MERCHANT_KEY=your_staging_merchant_key
PAYU_SALT=your_staging_salt
DELHIVERY_API_KEY=your_staging_delhivery_key
DELHIVERY_API_SECRET=your_staging_delhivery_secret
ZOHO_CLIENT_ID=your_staging_zoho_client_id
ZOHO_CLIENT_SECRET=your_staging_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_staging_zoho_refresh_token
SESSION_SECRET=your_staging_session_secret
NEXTAUTH_SECRET=your_staging_nextauth_secret
KV_URL=your_staging_kv_url
KV_REST_API_URL=your_staging_kv_rest_api_url
KV_REST_API_TOKEN=your_staging_kv_rest_api_token
```

## Performance Tuning Configuration

### Next.js Configuration (next.config.js)
```js
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

### Package.json Scripts for Deployment
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "analyze": "ANALYZE=true next build",
    "deploy:staging": "vercel --token=$VERCEL_TOKEN --scope=$VERCEL_ORG_ID --environment=preview",
    "deploy:production": "vercel --prod --token=$VERCEL_TOKEN --scope=$VERCEL_ORG_ID",
    "health": "curl -f http://localhost:3000/api/health"
  }
}
```

This deployment configuration provides a complete setup for deploying the KN Biosciences application to production environments with proper security, performance optimization, and monitoring.