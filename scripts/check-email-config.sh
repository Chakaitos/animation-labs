#!/bin/bash
# Email Configuration Checker
# Verifies that all required environment variables are set

echo "=== Email Configuration Check ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_env() {
  local var_name=$1
  local required=$2

  if vercel env ls 2>/dev/null | grep -q "$var_name"; then
    echo -e "${GREEN}✓${NC} $var_name is set"
    return 0
  else
    if [ "$required" = "true" ]; then
      echo -e "${RED}✗${NC} $var_name is MISSING (required)"
      return 1
    else
      echo -e "${YELLOW}⚠${NC} $var_name is missing (optional)"
      return 0
    fi
  fi
}

echo "Checking Vercel environment variables..."
echo ""

# Required variables
ERRORS=0

check_env "RESEND_API_KEY" "true" || ((ERRORS++))
check_env "SUPABASE_SERVICE_ROLE_KEY" "true" || ((ERRORS++))
check_env "N8N_WEBHOOK_SECRET" "true" || ((ERRORS++))
check_env "N8N_WEBHOOK_URL" "true" || ((ERRORS++))

echo ""
echo "Checking optional variables..."
echo ""

check_env "NEXT_PUBLIC_SUPABASE_URL" "false"
check_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "false"
check_env "STRIPE_SECRET_KEY" "false"
check_env "STRIPE_WEBHOOK_SECRET" "false"

echo ""
echo "=== Summary ==="

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}All required environment variables are set!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Test signup flow: npm run dev and create account"
  echo "2. Check email inbox for verification email"
  echo "3. Test video creation and check for completion email"
  echo "4. Monitor Vercel logs: vercel logs --follow"
  echo "5. Check Resend dashboard: https://resend.com/emails"
else
  echo -e "${RED}Missing $ERRORS required environment variable(s)${NC}"
  echo ""
  echo "To fix:"
  echo "1. Go to https://vercel.com/[team]/animatelabs/settings/environment-variables"
  echo "2. Add missing variables"
  echo "3. Redeploy: vercel --prod"
  echo ""
  echo "Get API keys:"
  echo "- RESEND_API_KEY: https://resend.com/api-keys"
  echo "- SUPABASE_SERVICE_ROLE_KEY: Supabase Dashboard > Settings > API"
  echo "- N8N_WEBHOOK_SECRET: Generate with: openssl rand -hex 32"
fi

echo ""
