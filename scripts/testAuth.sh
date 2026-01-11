#!/usr/bin/env bash

# 🔐 Script for AUTH SYSTEM TESTING
# Usage: bash scripts/testAuth.sh

set -e

echo "🔐"
echo "=================================="
echo ""

# Check environment
echo "📋 Checking environment..."
if [ -z "$JWT_SECRET" ]; then
  echo "⚠️  JWT_SECRET not set in terminal"
  echo "   (It's in .env.local, that's OK)"
fi

if [ -z "$DATABASE_URL" ] && [ -z "$MONGO_URI" ]; then
  echo "❌ DATABASE_URL and MONGO_URI not set"
  exit 1
fi

echo "✅ Environment OK"
echo ""

# Check files
echo "📁 Checking critical files..."
FILES=(
  "src/app/api/auth/login/route.ts"
  "src/app/api/auth/register/route.ts"
  "src/app/api/auth/logout/route.ts"
  "src/app/api/users/me/route.ts"
  "src/components/layout/AuthContext.tsx"
  "src/components/ui/Modal/AuthModal.jsx"
  "src/lib/auth/jwt.ts"
  "src/lib/auth/cookies.ts"
  "src/lib/auth/hash.ts"
  ".env.local"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (MISSING)"
  fi
done
echo ""

# Check critical code patterns
echo "🔍 Checking critical code patterns..."

# Check credentials in AuthModal
if grep -q "credentials: 'include'" src/components/ui/Modal/AuthModal.jsx; then
  echo "✅ AuthModal has credentials: 'include'"
else
  echo "❌ AuthModal missing credentials: 'include'"
fi

# Check credentials in AuthContext
if grep -q "credentials: 'include'" src/components/layout/AuthContext.tsx; then
  echo "✅ AuthContext has credentials: 'include'"
else
  echo "❌ AuthContext missing credentials: 'include'"
fi

# Check JWT secret
if grep -q "JWT_SECRET" .env.local; then
  echo "✅ JWT_SECRET is configured"
else
  echo "❌ JWT_SECRET not in .env.local"
fi

# Check DATABASE_URL
if grep -q "DATABASE_URL" .env.local; then
  echo "✅ DATABASE_URL is configured"
else
  echo "⚠️  DATABASE_URL might not be in .env.local (check MONGO_URI)"
fi

echo ""
echo "=================================="
echo "✅ PRE-FLIGHT CHECK COMPLETE"
echo ""
echo "🚀 NEXT STEPS:"
echo "  1. Run: npm run dev"
echo "  2. Open: http://localhost:3000"
echo "  3. Test registration"
echo "  4. Check DevTools → Application → Cookies"
echo "  5. Test login"
echo "  6. Test password change"
echo ""
