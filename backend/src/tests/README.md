# Auth Testing Suite

This directory contains comprehensive tests for the authentication system, including routes, middleware, and end-to-end flows.

## Test Files

### 1. `auth.test.ts`
Unit tests for auth routes using Jest and Supertest:
- User registration (citizen, admin, government roles)
- User login/logout
- Input validation
- Error handling
- Token generation and validation

### 2. `auth.middleware.test.ts`
Tests for authentication middleware:
- `authenticate` middleware
- `requireAdmin` middleware  
- `requireCitizen` middleware
- `optionalAuth` middleware
- Role-based access control

### 3. `manual-auth-test.ts`
Integration tests that make real HTTP requests to a running server:
- Complete auth flow testing
- Real database interactions
- Token lifecycle management
- Error scenario testing

### 4. `run-all-tests.ts`
Comprehensive test runner that:
- Installs dependencies
- Starts the server
- Runs Jest tests
- Runs manual integration tests
- Provides detailed reporting

## Running Tests

### Prerequisites
1. Make sure your server dependencies are installed:
```bash
cd ../.. # Navigate to backend root
npm install
```

2. Ensure your database is set up and Prisma is configured

### Quick Test (Manual)
Run a quick validation of your auth system:
```bash
# Start your server first
npm run dev

# In another terminal, run quick test
node src/quick-test.js
```

### Jest Unit Tests
```bash
# Run auth route tests
npm run test:auth

# Run middleware tests  
npm run test:auth-middleware

# Run all auth tests
npm run test:auth-all
```

### Manual Integration Tests
```bash
# Make sure server is running first
npm run dev

# In another terminal
npm run test:manual
```

### Complete Test Suite
```bash
# Runs everything automatically
npm run test:complete
```

## Test Coverage

The test suite covers:

### Authentication Routes
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login
- ✅ `POST /api/auth/logout` - User logout
- ✅ `GET /api/auth/me` - Get current user
- ✅ `GET /api/auth/roles` - Get available roles

### Middleware Functions
- ✅ `authenticate` - Token validation
- ✅ `requireAdmin` - Admin/Government access
- ✅ `requireCitizen` - Authenticated user access
- ✅ `optionalAuth` - Optional authentication

### User Roles
- ✅ `CITIZEN` - Default role, no special code required
- ✅ `ADMIN` - Requires admin registration code
- ✅ `GOVERNMENT` - Requires admin registration code

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token generation and validation
- ✅ Session management in database
- ✅ Token invalidation on logout
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Duplicate email prevention
- ✅ Role-based access control

### Error Scenarios
- ✅ Invalid credentials
- ✅ Missing required fields
- ✅ Weak passwords
- ✅ Invalid email formats
- ✅ Duplicate registrations
- ✅ Invalid/expired tokens
- ✅ Unauthorized access attempts
- ✅ Missing admin codes

## Environment Variables

Make sure these are set in your `.env` file:
```
JWT_SECRET=your-secret-key
ADMIN_REGISTRATION_CODE=GOV2024MALAYSIA
DATABASE_URL=your-database-url
```

## Database Requirements

The tests require these Prisma models:
- `User` - Stores user accounts
- `UserSession` - Manages active sessions

## Troubleshooting

### Common Issues

1. **Tests failing with database errors**
   - Ensure Prisma is properly configured
   - Run `npx prisma generate` and `npx prisma db push`

2. **Server not starting**
   - Check if port 3001 is available
   - Verify all dependencies are installed

3. **JWT token errors**
   - Ensure JWT_SECRET is set in environment
   - Check token format in Authorization headers

4. **Permission denied errors**
   - Verify admin registration codes match
   - Check user roles are properly assigned

### Debug Mode

To run tests with debug output:
```bash
DEBUG=* npm run test:manual
```

## Test Data Cleanup

Tests automatically clean up:
- User accounts created during testing
- Session tokens generated
- Temporary data in database

The cleanup happens in `beforeEach` and `afterAll` hooks to ensure test isolation.