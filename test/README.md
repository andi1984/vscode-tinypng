# TinyPNG Extension - Test Suite

## Running Tests

```bash
# Run all tests
npm test

# Compile TypeScript
npm run compile

# Watch mode
npm run watch
```

## Test Files

- **[suite/extension.test.ts](suite/extension.test.ts)** - Extension integration tests (activation, commands, configuration, file types)
- **[suite/integration.test.ts](suite/integration.test.ts)** - Advanced integration tests (menus, metadata, dependencies)
- **[suite/unit.test.ts](suite/unit.test.ts)** - Unit tests (path handling, pattern matching, git integration)

## Test Coverage

- ✅ All 4 commands (compressFile, compressFolder, getCompressionCount, compressGitStage)
- ✅ Configuration properties (apiKey, forceOverwrite, compressedFilePostfix)
- ✅ File type recognition (.png, .jpg, .jpeg, .webp)
- ✅ Menu contributions and activation events
- ✅ Core business logic (path handling, git integration)

## GitHub Actions

Tests run automatically on push/PR to `develop` branch with:
- Node.js versions: 20.x, 21.x, 22.x
- Headless execution via xvfb-action
- TypeScript compilation check
- Linting validation
