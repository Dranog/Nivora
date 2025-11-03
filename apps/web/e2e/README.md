# E2E Tests

End-to-end tests for OLIVER platform using Playwright.

## Setup

```bash
npm install -D @playwright/test
npx playwright install
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/marketplace.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

## Test Coverage

- **Marketplace**: Listing browsing, filtering, detail view, creation
- **Messages**: Conversations list, chat functionality, message sending

## TODO

- [ ] Implement authentication helpers for login/logout
- [ ] Add test data seeding before tests
- [ ] Implement WebSocket testing for real-time messages
- [ ] Add visual regression tests
- [ ] Add API integration tests
- [ ] Test boost functionality
- [ ] Test request creation and acceptance flow

## Notes

- Tests assume the API is running on `http://localhost:3000`
- Some tests require authentication - update with proper login flow
- Use test database for E2E tests to avoid data pollution
