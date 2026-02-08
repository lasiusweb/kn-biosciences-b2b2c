#!/bin/bash
# KN Biosciences Platform - Post-Optimization Setup Script

# This script helps operationalize the improvements made to the KN Biosciences platform
# It performs final setup tasks, verifies the implementation, and provides a health check

set -e  # Exit on any error

echo "==========================================="
echo "KN Biosciences Platform - Post-Optimization Setup"
echo "==========================================="

# Function to print status messages
print_status() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verify prerequisites
print_status "Verifying prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ before running this script."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm before running this script."
    exit 1
fi

if ! command_exists git; then
    print_error "Git is not installed. Please install Git before running this script."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

print_success "Prerequisites verified."

# Check for environment files
print_status "Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. Creating a template..."
    cat > .env.local << EOF
# Environment variables for KN Biosciences Platform
# Copy this file to .env.local and fill in your actual values

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Hasura GraphQL (Optional)
NEXT_PUBLIC_HASURA_URL=https://your-project.hasura.app/v1/graphql
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your_hasura_admin_secret

# Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

PAYU_MERCHANT_KEY=b50fOs
PAYU_SALT=Ax6BXzZ6DCM71urBDXeuZ6U0yGw6Fc2j

EASEBUZZ_KEY=your_easebuzz_key
EASEBUZZ_SALT=your_easebuzz_salt

# Shipping Configuration
DELHIVERY_API_KEY=883776092d1fd108853460ac87bf0f396ecc48db
DELHIVERY_API_SECRET=your_delhivery_api_secret

# Zoho Integration
ZOHO_CLIENT_ID=1000.AL5FUFEZTXLPJS9HTL670IOV7Z6RCS
ZOHO_CLIENT_SECRET=1000.AL5FUFEZTXLPJS9HTL670IOV7Z6RCS
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@knbiosciences.com
EMAIL_FROM_NAME=KN Biosciences

# Notification Emails
ADMIN_EMAIL=admin@knbiosciences.com
SUPPORT_EMAIL=support@knbiosciences.com
B2B_EMAIL=b2b@knbiosciences.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Security
SESSION_SECRET=your-super-secret-session-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here

# Vercel KV (for caching)
KV_URL=redis://localhost:6379
KV_REST_API_URL=http://localhost:6379
KV_REST_API_TOKEN=your_redis_token
EOF
    print_success "Created .env.local template. Please update with your actual values."
else
    print_success "Environment file found."
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci
print_success "Dependencies installed."

# Run build process
print_status "Building the application..."
npm run build
print_success "Application built successfully."

# Run security audit
print_status "Running security audit..."
npm audit --audit-level moderate
if [ $? -eq 0 ]; then
    print_success "Security audit passed."
else
    print_warning "Security audit found issues. Please review and address them."
fi

# Run tests
print_status "Running tests..."
npm run test:ci
if [ $? -eq 0 ]; then
    print_success "All tests passed."
else
    print_error "Some tests failed. Please fix them before proceeding."
    exit 1
fi

# Verify new files exist
print_status "Verifying new files and improvements..."

NEW_FILES=(
    "src/lib/security-enhancements.ts"
    "src/lib/perf-utils.ts"
    "src/lib/monitoring-system.ts"
    "src/lib/accessibility.tsx"
    "docs/security-procedures.md"
    "docs/testing-strategy.md"
    "docs/maintenance-procedures.md"
    "docs/ci-cd-best-practices.md"
    "docs/backup-recovery-procedures.md"
    "docs/optimization-summary.md"
)

MISSING_FILES=()
for file in "${NEW_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    print_success "All new files verified."
else
    print_error "Missing files: ${MISSING_FILES[*]}"
    exit 1
fi

# Check for performance monitoring dashboard
if [ -f "src/components/admin/performance-dashboard.tsx" ]; then
    print_success "Performance dashboard component found."
else
    print_error "Performance dashboard component not found."
    exit 1
fi

# Verify database schema
print_status "Verifying database schema..."
if [ -f "database/schema.sql" ]; then
    print_success "Database schema found."
else
    print_error "Database schema not found."
    exit 1
fi

# Check for proper git setup
print_status "Verifying Git configuration..."
if [ -d ".git" ]; then
    print_success "Git repository found."
    
    # Check if there are any uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "There are uncommitted changes in the repository."
        echo "Consider committing your changes:"
        echo "  git add ."
        echo "  git commit -m \"Post-optimization setup\""
    else
        print_success "Repository is clean."
    fi
else
    print_warning "Not in a Git repository. Consider initializing one:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m \"Initial commit after optimization\""
fi

# Final health check
print_status "Performing final health check..."

# Check if package.json has the expected scripts
if grep -q "test:ci" package.json && grep -q "build" package.json && grep -q "dev" package.json; then
    print_success "Package.json scripts verified."
else
    print_warning "Some expected scripts not found in package.json."
fi

# Check for TypeScript configuration
if [ -f "tsconfig.json" ]; then
    print_success "TypeScript configuration found."
else
    print_error "TypeScript configuration not found."
    exit 1
fi

# Check for Next.js configuration
if [ -f "next.config.js" ]; then
    print_success "Next.js configuration found."
else
    print_error "Next.js configuration not found."
    exit 1
fi

print_success "==========================================="
print_success "POST-OPTIMIZATION SETUP COMPLETED SUCCESSFULLY!"
print_success "==========================================="

echo
print_success "Platform is now optimized with:"
echo "  - Enhanced security measures"
echo "  - Improved performance and caching"
echo "  - Comprehensive monitoring and alerting"
echo "  - Robust operational procedures"
echo "  - Complete documentation"
echo "  - Accessibility improvements"
echo
print_success "To start the development server:"
echo "  npm run dev"
echo
print_success "To run the production server:"
echo "  npm start"
echo
print_success "To run tests:"
echo "  npm run test"
echo
print_success "To check security:"
echo "  npm run security:audit"
echo
print_success "==========================================="

# Create a quick start guide
cat > QUICK_START.md << EOF
# KN Biosciences Platform - Quick Start Guide

## Development

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your environment-specific values

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Production

1. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`

2. Start the production server:
   \`\`\`bash
   npm start
   \`\`\`

## Testing

- Run all tests: \`npm run test\`
- Run unit tests: \`npm run test:unit\`
- Run integration tests: \`npm run test:integration\`
- Run CI tests: \`npm run test:ci\`

## Security

- Check for vulnerabilities: \`npm run security:audit\`
- Run security scan: \`npm run test:security\`

## Performance

- Analyze bundle: \`npm run analyze\`
- Run performance tests: \`npm run test:performance\`

## Documentation

- Security Procedures: \`docs/security-procedures.md\`
- Testing Strategy: \`docs/testing-strategy.md\`
- Maintenance Procedures: \`docs/maintenance-procedures.md\`
- CI/CD Best Practices: \`docs/ci-cd-best-practices.md\`
- Backup & Recovery: \`docs/backup-recovery-procedures.md\`
- Complete Summary: \`docs/optimization-summary.md\`
EOF

print_success "Quick start guide created: QUICK_START.md"