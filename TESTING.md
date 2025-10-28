# Testing Guide for uCAN Monitor

This document provides comprehensive guidance on testing the uCAN web monitor UI components and related functionality.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Testing Stack](#testing-stack)
- [Writing Tests](#writing-tests)
- [Test Patterns](#test-patterns)
- [Mocking Strategies](#mocking-strategies)
- [Coverage](#coverage)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The uCAN monitor uses a modern testing approach with:
- **Jest** as the test runner
- **React Testing Library** for component testing
- **TypeScript** for type-safe tests
- **User Event** for realistic user interactions

### Testing Philosophy

We follow these principles:
1. **Test behavior, not implementation** - Focus on what users see and do
2. **Write tests that resemble user interactions** - Use accessible queries
3. **Avoid testing implementation details** - Don't test internal state
4. **Maintain high coverage for critical paths** - Especially bug-prone areas

## Getting Started

### Prerequisites

All testing dependencies are already installed. If you need to reinstall:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Project Structure

```
battlewithbytes.io/
├── jest.config.js              # Jest configuration
├── tests/
│   ├── setup.ts               # Global test setup
│   └── __mocks__/             # Mock files
│       └── fileMock.js        # Asset mocks
├── src/
│   └── app/tools/ucan/
│       └── components/
│           ├── __tests__/     # Component tests
│           │   ├── BoardInfoPanel.test.tsx
│           │   ├── ConnectionPanel.test.tsx
│           │   └── UCANMonitor.integration.test.tsx
│           └── *.tsx          # Components to test
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test BoardInfoPanel

# Run tests matching pattern
npm test -- --testNamePattern="max_rules"
```

### Coverage Reports

After running tests with coverage, view the HTML report:

```bash
# Open coverage report (generated in coverage/ directory)
open coverage/lcov-report/index.html
```

## Testing Stack

### Core Libraries

1. **Jest** - Test runner and assertion library
   - Configured for jsdom environment (simulates browser)
   - Supports TypeScript via ts-jest
   - Module path mapping for `@/` imports

2. **React Testing Library**
   - Component rendering utilities
   - Accessible query methods (getByRole, getByText, etc.)
   - User interaction helpers

3. **jest-dom**
   - Custom matchers for DOM assertions
   - Examples: `toBeInTheDocument()`, `toHaveClass()`, `toBeDisabled()`

4. **User Event**
   - Realistic user interaction simulation
   - Better than `fireEvent` for most cases
   - Handles keyboard, mouse, and touch events

## Writing Tests

### Basic Test Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockHandler = jest.fn();

    render(<MyComponent onAction={mockHandler} />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

### Querying Elements

Use queries in this priority order:

1. **Accessible queries** (preferred)
   - `getByRole()` - Buttons, links, headings
   - `getByLabelText()` - Form fields
   - `getByPlaceholderText()` - Inputs

2. **Semantic queries**
   - `getByText()` - Text content
   - `getByAltText()` - Images

3. **Test IDs** (last resort)
   - `getByTestId()` - Use only when accessibility queries won't work

```typescript
// Good - accessible
const button = screen.getByRole('button', { name: /submit/i });
const input = screen.getByLabelText('Email address');

// Avoid - implementation details
const element = container.querySelector('.my-class');
```

### Async Operations

Always use `waitFor()` for async operations:

```typescript
test('loads data', async () => {
  render(<AsyncComponent />);

  // Wait for element to appear
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });
});
```

### User Interactions

Use `userEvent` for realistic interactions:

```typescript
test('user can type in input', async () => {
  const user = userEvent.setup();
  render(<Form />);

  const input = screen.getByLabelText('Name');
  await user.type(input, 'John Doe');

  expect(input).toHaveValue('John Doe');
});

test('user can select option', async () => {
  const user = userEvent.setup();
  render(<Dropdown />);

  const select = screen.getByLabelText('Country');
  await user.selectOptions(select, 'US');

  expect(select).toHaveValue('US');
});
```

## Test Patterns

### 1. Component State Testing

Test different states of your component:

```typescript
describe('BoardInfoPanel', () => {
  test('shows loading state when capabilities undefined', () => {
    render(<BoardInfoPanel isConnected={true} capabilities={undefined} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows disconnected state', () => {
    render(<BoardInfoPanel isConnected={false} />);
    expect(screen.getByText('No board connected')).toBeInTheDocument();
  });

  test('shows connected state with data', () => {
    render(<BoardInfoPanel isConnected={true} capabilities={mockCaps} />);
    expect(screen.getByText('uCAN RP2040')).toBeInTheDocument();
  });
});
```

### 2. Conditional Rendering

Test that elements appear/disappear based on conditions:

```typescript
test('shows edit button only when connected', () => {
  const { rerender } = render(<Component isConnected={false} />);
  expect(screen.queryByText('Edit')).not.toBeInTheDocument();

  rerender(<Component isConnected={true} />);
  expect(screen.getByText('Edit')).toBeInTheDocument();
});
```

### 3. Regression Tests

Write tests that prevent specific bugs from returning:

```typescript
describe('max_rules Display - Regression Tests', () => {
  test('displays max_rules value correctly when defined', () => {
    const caps = { ...mockCapabilities, max_rules: 8 };
    render(<BoardInfoPanel capabilities={caps} />);

    // Should show "8 maximum", not "max rules"
    expect(screen.getByText(/8/)).toBeInTheDocument();
    expect(screen.getByText(/maximum/)).toBeInTheDocument();
  });

  test('displays "Loading..." when max_rules is undefined', () => {
    const capsWithoutMaxRules = { ...mockCapabilities };
    delete capsWithoutMaxRules.max_rules;

    render(<BoardInfoPanel capabilities={capsWithoutMaxRules} />);

    // Should show "Loading..." not "max rules"
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### 4. Event Handler Testing

Test that callbacks are called with correct arguments:

```typescript
test('calls onDeleteRule with correct ID', async () => {
  const user = userEvent.setup();
  const onDeleteRule = jest.fn();
  global.confirm = jest.fn(() => true);

  render(<RuleList rules={mockRules} onDeleteRule={onDeleteRule} />);

  const deleteButton = screen.getByTitle('Delete rule');
  await user.click(deleteButton);

  expect(onDeleteRule).toHaveBeenCalledWith(mockRules[0].id);
});
```

### 5. Form Testing

Test form interactions and validation:

```typescript
test('validates and submits form', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<EditForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Name'), 'New Name');
  await user.click(screen.getByRole('button', { name: /save/i }));

  expect(onSubmit).toHaveBeenCalledWith({ name: 'New Name' });
});
```

## Mocking Strategies

### Mocking Modules

Mock external dependencies:

```typescript
// At top of test file
jest.mock('../../utils/deviceStorage', () => ({
  loadLastDevice: jest.fn(() => null),
  formatDeviceName: jest.fn((device) => `Device ${device?.vendorId}`),
  saveLastDevice: jest.fn(),
}));
```

### Mocking Web APIs

Web Serial API and other browser APIs are mocked in `tests/setup.ts`:

```typescript
// Already configured in tests/setup.ts
global.navigator.serial = {
  requestPort: jest.fn(),
  getPorts: jest.fn().mockResolvedValue([]),
} as any;
```

### Mocking Next.js Components

Image and Link components are mocked in setup:

```typescript
// Already configured in tests/setup.ts
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
```

### Mocking Child Components

For integration tests, mock complex child components:

```typescript
jest.mock('../MessageLog', () => ({
  __esModule: true,
  default: ({ messages }: any) => (
    <div data-testid="message-log">
      Messages: {messages.length}
    </div>
  ),
}));
```

## Coverage

### Coverage Goals

Aim for these coverage thresholds:
- Statements: 50%+
- Branches: 50%+
- Functions: 50%+
- Lines: 50%+

### Critical Areas

Prioritize testing:
1. **Bug-prone components** - Areas with previous bugs
2. **Complex logic** - State management, filtering, calculations
3. **User interactions** - Forms, buttons, modals
4. **Edge cases** - Undefined values, empty states, error conditions

### Viewing Coverage

```bash
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

## Continuous Integration

### Pre-commit Testing

Run tests before committing:

```bash
# Add to .git/hooks/pre-commit
npm test -- --bail --findRelatedTests
```

### CI Pipeline

Tests should run on:
- Every pull request
- Main branch commits
- Before deployment

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Problem:** TypeScript module resolution issues

**Solution:** Check `jest.config.js` moduleNameMapper:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### 2. "ReferenceError: window is not defined"

**Problem:** Code runs before jsdom is set up

**Solution:** Ensure `testEnvironment: 'jsdom'` in jest.config.js

#### 3. "Act warnings"

**Problem:** State updates not wrapped in act()

**Solution:** Use `waitFor()` for async operations:
```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

#### 4. "Cannot read properties of undefined"

**Problem:** Props or dependencies not provided

**Solution:** Provide all required props:
```typescript
const defaultProps = {
  isConnected: false,
  onConnect: jest.fn(),
  // ... all required props
};

render(<Component {...defaultProps} />);
```

#### 5. Tests pass locally but fail in CI

**Problem:** Timing issues or environment differences

**Solution:** Increase timeouts and use `waitFor()`:
```typescript
await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
}, { timeout: 5000 });
```

### Debugging Tests

#### Enable verbose output

```bash
npm test -- --verbose
```

#### Run single test

```bash
npm test -- -t "test name"
```

#### Debug in VS Code

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

#### Use screen.debug()

Print current DOM state:
```typescript
test('debugging', () => {
  render(<Component />);
  screen.debug(); // Prints entire DOM
  screen.debug(screen.getByRole('button')); // Prints specific element
});
```

## Best Practices

### DO

- Test user-facing behavior
- Use accessible queries (getByRole, getByLabelText)
- Write descriptive test names
- Group related tests with describe blocks
- Mock external dependencies
- Test edge cases and error states
- Keep tests focused and simple
- Use setup functions for repetitive code

### DON'T

- Test implementation details
- Use container.querySelector() when possible to avoid
- Access component state or props directly
- Write overly complex test setup
- Share state between tests
- Ignore console warnings/errors
- Skip writing tests for "simple" components
- Copy-paste test code without understanding it

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure tests pass locally
3. Check coverage doesn't decrease
4. Add regression tests for bug fixes
5. Update this guide if introducing new patterns

---

Last updated: 2025-10-27
