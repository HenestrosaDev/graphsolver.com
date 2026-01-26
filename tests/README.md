# Tests Directory

This directory contains test-related files and fixtures for the GraphSolver application.

## Structure

- `fixtures/` - Test data files and sample graphs in various formats (JSON, CSV, GML, etc.)
  - Used for testing import/export functionality
  - Contains example graphs for different algorithms

## Test Files

The main test files are located in `src/composables/__tests__/` following the standard Vitest convention for co-located tests.

## Running Tests

```bash
npm test
# or
npx vitest run
```

## Adding Test Fixtures

When adding new test data files:
1. Place them in the appropriate `fixtures/` subdirectory
2. Use descriptive names that indicate the graph structure or format
3. Ensure they are valid and represent realistic test cases