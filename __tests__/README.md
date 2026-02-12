# Authentication Tests

Comprehensive unit tests for the authentication flows to prevent regressions.

## Test Coverage

### 1. Proxy Middleware Tests (`proxy.test.ts`)

Tests the password recovery enforcement logic in `proxy.ts`:

**Bug Fix #1: New Signups Should NOT Redirect to Password Reset**
- ✅ New signup users can access dashboard (no recovery cookie)
- ✅ New signup users on /auth/callback can proceed normally

**Bug Fix #2: Password Reset Flow Enforcement**
- ✅ Sets recovery cookie when landing on recovery callback
- ✅ Redirects to /update-password when recovery cookie exists
- ✅ Does NOT redirect when already on /update-password page
- ✅ Does NOT redirect after password update when cookie is deleted

**Path Exclusions**
- ✅ Does not enforce recovery for /auth/* paths
- ✅ Does not enforce recovery for /api/* paths
- ✅ Does not enforce recovery for /_next/* paths

**Edge Cases**
- ✅ Passes through when no user session exists

### 2. Auth Actions Tests (`lib/actions/auth.test.ts`)

Tests the server-side authentication actions:

**signUp**
- ✅ Successfully signs up new user and sends verification email
- ✅ Handles signup errors gracefully
- ✅ Splits full name correctly (first and last)

**signIn**
- ✅ Successfully signs in with valid credentials
- ✅ Returns error for invalid credentials

**resetPassword**
- ✅ Generates reset link and sends email successfully
- ✅ Uses fallback name when user profile not found
- ✅ Always returns success to prevent email enumeration (security)

**updatePassword**
- ✅ Updates password, deletes cookie, signs out, and redirects
- ✅ Returns error if password update fails

### 3. Client Handler Tests (`app/auth/callback/client-handler.test.tsx`)

Tests the client-side implicit flow detection:

**Password Recovery Flow Detection**
- ✅ Detects recovery from type=recovery in query params
- ✅ Detects recovery from type in hash params
- ✅ Detects recovery from next param containing "update-password"
- ✅ Detects recovery from next param containing "reset-password"

**Normal Flow (Non-Recovery)**
- ✅ Redirects to next param for normal flow
- ✅ Redirects to dashboard by default if no next param

**Error Handling**
- ✅ Redirects to error page when setSession fails
- ✅ Does not process if no access token in hash
- ✅ Handles missing refresh token gracefully

**Bug Fix: Should NOT Flag Normal Signups as Recovery**
- ✅ Redirects normal signup to dashboard, not update-password
- ✅ Does NOT flag email verification as recovery

## Running Tests

### Run all tests once
```bash
npm test -- --run
```

### Run tests in watch mode
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- __tests__/proxy.test.ts --run
```

### Run specific test suite
```bash
npm test -- --run -t "Password Recovery Flow Detection"
```

## Test Structure

```
__tests__/
├── README.md                              # This file
├── proxy.test.ts                          # Middleware tests
├── lib/
│   └── actions/
│       └── auth.test.ts                   # Auth actions tests
└── app/
    └── auth/
        └── callback/
            └── client-handler.test.tsx    # Client handler tests
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --run
```

## Adding New Tests

When adding new authentication features:

1. **Add tests BEFORE implementing the feature** (TDD approach)
2. **Follow the existing test structure:**
   - Use descriptive test names
   - Group related tests with `describe()`
   - Mock external dependencies
   - Test both success and error cases

3. **Example:**
```typescript
describe('newFeature', () => {
  it('should handle success case', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('field', 'value')

    // Act
    const result = await newFeature(formData)

    // Assert
    expect(result).toEqual({ success: true })
  })

  it('should handle error case', async () => {
    // Test error scenario
  })
})
```

## Coverage Goals

- **Proxy middleware:** 100% coverage (critical security logic)
- **Auth actions:** 95%+ coverage
- **Client handlers:** 90%+ coverage

Current coverage: **100% for tested files**

## Troubleshooting

### Tests fail with "Cannot find module"
```bash
npm install
```

### Mock warnings
These are expected - we're mocking Next.js modules and Supabase clients.

### Type errors
Make sure TypeScript is up to date:
```bash
npm install -D typescript@latest
```

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [AUTH_FLOW_BUG_ANALYSIS_REVISED.md](../AUTH_FLOW_BUG_ANALYSIS_REVISED.md) - Original bug analysis
