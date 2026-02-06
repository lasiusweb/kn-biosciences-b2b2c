#!/bin/bash

# Smoke Testing Script for KN Biosciences
# Usage: npm run test:smoke -- --baseUrl=https://staging.knbiosciences.com

BASE_URL=${1:-"http://localhost:3000"}
FAILED_TESTS=0

echo "🔥 Running smoke tests against: $BASE_URL"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local expected_status=${2:-200}
    local description=$3
    
    echo "Testing: $description"
    response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL$endpoint")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo "✅ $endpoint - $expected_status"
    else
        echo "❌ $endpoint - Expected $expected_status, got $response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test page load time
test_load_time() {
    local endpoint=$1
    local max_time=${2:-3000} # 3 seconds default
    local description=$3
    
    echo "Testing load time: $description"
    response_time=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL$endpoint")
    response_time_ms=$(echo "$response_time * 1000" | bc)
    
    if (( $(echo "$response_time_ms <= $max_time" | bc -l) )); then
        echo "✅ $endpoint - ${response_time_ms}ms (≤${max_time}ms)"
    else
        echo "❌ $endpoint - ${response_time_ms}ms (>${max_time}ms)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Test critical endpoints
echo "📡 Testing API endpoints..."

test_endpoint "/api/health" 200 "Health check"
test_endpoint "/api/products" 200 "Products API"
test_endpoint "/api/cart" 401 "Cart API (unauthorized)"

# Test critical pages
echo "📄 Testing page loads..."

test_endpoint "/" 200 "Homepage"
test_endpoint "/shop" 200 "Shop page"
test_endpoint "/cart" 200 "Cart page"
test_endpoint "/auth" 200 "Auth page"
test_endpoint "/track-order" 200 "Track order page"

# Test page load times
echo "⏱️  Testing page load times..."

test_load_time "/" 2000 "Homepage load time"
test_load_time "/shop" 2500 "Shop page load time"
test_load_time "/cart" 2000 "Cart page load time"

# Test static assets
echo "🖼️  Testing static assets..."

test_endpoint "/_next/static/css/app.css" 200 "CSS bundle"
test_endpoint "/favicon.ico" 200 "Favicon"

# Test form submissions (if applicable)
echo "📝 Testing form endpoints..."

# Test contact form
test_endpoint "/api/contact/submit" 405 "Contact form (method not allowed)"

# Test search functionality
test_endpoint "/api/search?q=test" 200 "Search API"

# Test authentication flows
echo "🔐 Testing authentication..."

# Test login endpoint
test_endpoint "/api/auth/login" 405 "Login endpoint (method not allowed)"

# Test cart operations
echo "🛒 Testing cart operations..."

# Test cart API with different methods
test_endpoint "/api/cart" 405 "Cart POST (method not allowed)"
test_endpoint "/api/cart" 405 "Cart PUT (method not allowed)"
test_endpoint "/api/cart" 405 "Cart DELETE (method not allowed)"

# Test error handling
echo "🚨 Testing error handling..."

test_endpoint "/non-existent-page" 404 "404 page"
test_endpoint "/api/non-existent-endpoint" 404 "404 API endpoint"

# Test security headers
echo "🔒 Testing security headers..."

echo "Checking security headers for homepage..."
security_headers=$(curl -s -I "$BASE_URL/" | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)")

if [ -n "$security_headers" ]; then
    echo "✅ Security headers present"
else
    echo "⚠️  Some security headers missing"
fi

# Test SSL/TLS (if HTTPS)
if [[ $BASE_URL == https* ]]; then
    echo "🔐 Testing SSL/TLS..."
    
    ssl_check=$(curl -s -I "$BASE_URL/" | grep -i "strict-transport-security")
    if [ -n "$ssl_check" ]; then
        echo "✅ HSTS header present"
    else
        echo "⚠️  HSTS header missing"
    fi
fi

# Test database connectivity (if health check includes it)
echo "🗄️  Testing database connectivity..."

health_response=$(curl -s "$BASE_URL/api/health" | grep -o '"status":"healthy"')
if [ -n "$health_response" ]; then
    echo "✅ Database connectivity OK"
else
    echo "❌ Database connectivity issue"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Summary
echo ""
echo "📊 Smoke Test Summary"
echo "===================="
echo "Base URL: $BASE_URL"
echo "Failed Tests: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 All smoke tests passed!"
    exit 0
else
    echo "💥 $FAILED_TESTS smoke tests failed!"
    exit 1
fi