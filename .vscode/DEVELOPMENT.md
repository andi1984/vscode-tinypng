# VSCode Extension Development Guide

## Quick Start

### Running the Extension in Development

1. **Option A: Simple Run (F5)**
   - Press `F5` or select "Run Extension" from the debug dropdown
   - Compiles TypeScript once, then launches extension in new window
   - Use this for quick testing

2. **Option B: Watch Mode (Recommended for Development)**
   - Select "Run Extension (Watch Mode)" from debug dropdown
   - Press `F5`
   - TypeScript recompiles automatically on file save
   - Reload extension with `Ctrl+R` in Extension Development Host window
   - Use this for active development

### Running Tests

- **Run All Tests**: Select "Extension Tests" and press `F5`
- **Run from Terminal**: `npm test`
- **Debug Specific Test**: Set breakpoint in test file, then F5 with "Extension Tests" selected

## Development Workflow

### Best Practice: Watch Mode Development

```bash
# Terminal 1: Start watch mode (auto-compile on save)
npm run watch

# Then press F5 to launch extension
# Edit code → Save → Ctrl+R in extension window to reload
```

### Debugging Features

#### Source Maps
- Full source map support enabled
- Breakpoints work in `.ts` files
- Step through TypeScript code directly

#### Smart Stepping
- Automatically skips over Node.js internals
- Configured to skip `<node_internals>/**`
- Focus on your code

#### Debug Configuration
- **outFiles**: Maps compiled JS to TypeScript sources
- **sourceMaps**: Enables debugging TypeScript files
- **smartStep**: Skips uninteresting code

## Project Structure

```
vscode-tinypng/
├── .vscode/
│   ├── launch.json       # Debug configurations
│   ├── tasks.json        # Build tasks
│   ├── settings.json     # Workspace settings
│   └── DEVELOPMENT.md    # This file
├── out/                  # Compiled JavaScript
│   ├── extension.js
│   └── test/
├── test/                 # Test source files
│   ├── suite/
│   │   ├── extension.test.ts
│   │   ├── integration.test.ts
│   │   └── unit.test.ts
│   └── runTest.ts
├── extension.ts          # Main extension code
├── tsconfig.json         # TypeScript config
└── package.json          # Extension manifest
```

## Available Launch Configurations

### 1. Run Extension
- **Purpose**: Quick testing
- **Behavior**: Compiles once, launches extension
- **Use When**: Testing specific feature quickly
- **Shortcut**: F5 (default)

### 2. Run Extension (Watch Mode)
- **Purpose**: Active development
- **Behavior**: Starts watch mode, auto-recompiles on save
- **Use When**: Writing new code
- **Reload**: Ctrl+R in extension window after changes

### 3. Extension Tests
- **Purpose**: Test debugging
- **Behavior**: Runs all tests in debug mode
- **Use When**: Debugging failing tests
- **Features**: Set breakpoints in test files

## Available Tasks

### Build Tasks

```bash
# Compile once
npm run compile

# Watch mode (auto-compile on save)
npm run watch

# Compile for production (vscode:prepublish)
npm run vscode:prepublish
```

### Test Tasks

```bash
# Run all tests
npm test

# Run specific test file (after compile)
npm run compile && node out/test/runTest.js
```

### Lint Tasks

```bash
# Run linter
npm run lint

# Auto-fix lint issues
npx eslint --ext .js,.ts . test --fix
```

## Keyboard Shortcuts

### Debugging
- `F5` - Start debugging
- `Shift+F5` - Stop debugging
- `Ctrl+Shift+F5` - Restart debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out
- `Ctrl+K Ctrl+I` - Show hover

### Extension Development Host
- `Ctrl+R` - Reload extension (when in watch mode)
- `Ctrl+Shift+P` - Command palette
- `F1` - Command palette

## Breakpoint Types

### Line Breakpoints
- Click in gutter or press F9
- Execution stops at that line

### Conditional Breakpoints
- Right-click breakpoint → Edit Breakpoint
- Add condition like `file.fsPath.endsWith('.png')`
- Only breaks when condition is true

### Logpoints
- Right-click in gutter → Add Logpoint
- Non-breaking logging
- Example: `Compressing {file.fsPath}`

## Common Development Tasks

### Adding a New Command

1. **Update package.json**:
```json
{
  "contributes": {
    "commands": [{
      "command": "extension.newCommand",
      "title": "New Command",
      "category": "TinyPNG"
    }]
  }
}
```

2. **Register in extension.ts**:
```typescript
let disposable = vscode.commands.registerCommand(
    'extension.newCommand',
    () => {
        vscode.window.showInformationMessage('New command!');
    }
);
context.subscriptions.push(disposable);
```

3. **Test**:
- Press F5 to launch
- Ctrl+Shift+P in extension window
- Type "TinyPNG: New Command"

### Adding a New Test

1. **Create test in test/suite/**:
```typescript
test('My new test', () => {
    assert.ok(true);
});
```

2. **Run tests**:
- Select "Extension Tests" in debug dropdown
- Press F5
- Or run `npm test` in terminal

### Debugging Extension Activation

Set breakpoint in `activate()` function:
```typescript
function activate(context: ExtensionContext) {
    // Breakpoint here
    const apiKey = vscode.workspace.getConfiguration('tinypng')
        .get<string>('apiKey');
}
```

Press F5 - debugger stops on activation.

## Tips & Tricks

### Fast Iteration
1. Start watch mode: `npm run watch`
2. Press F5 with "Run Extension (Watch Mode)"
3. Edit code → Save
4. Ctrl+R in extension window
5. Test changes immediately

### Debugging Tips
- Use Debug Console to evaluate expressions
- Inspect variables in sidebar
- Watch expressions update in real-time
- Use Logpoints to avoid breaking execution

### Performance Profiling
1. Add timestamps to console.log:
```typescript
console.log(`[${Date.now()}] Starting compression`);
```

2. Check Extension Host logs:
   - Help → Toggle Developer Tools
   - Console tab shows all logs

### Testing Specific Scenarios
Create test workspace:
```bash
mkdir -p /tmp/tinypng-test
cd /tmp/tinypng-test
# Add test images
```

Then debug with that folder open.

## Troubleshooting

### Extension Doesn't Activate
- Check activation events in package.json
- Verify extension is in correct directory
- Check Extension Host Developer Tools for errors

### Breakpoints Not Working
- Ensure source maps are enabled (they are)
- Check outFiles path in launch.json
- Verify TypeScript compiled successfully

### Changes Not Reflected
- Did you reload the extension window? (Ctrl+R)
- Is watch mode running?
- Check terminal for compilation errors

### Tests Failing
- Compile first: `npm run compile`
- Check test output for errors
- Debug with "Extension Tests" configuration

## Advanced Configuration

### Custom Extension Development Path
Edit launch.json args:
```json
"args": [
    "--extensionDevelopmentPath=${workspaceFolder}",
    "/path/to/test/workspace"
]
```

### Multiple Extension Testing
Install other extensions in test window:
```json
"args": [
    "--extensionDevelopmentPath=${workspaceFolder}"
    // Remove --disable-extensions
]
```

### Environment Variables
Add to launch configuration:
```json
"env": {
    "TINYPNG_DEBUG": "true"
}
```

## Resources

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Next Steps

- [ ] Try "Run Extension (Watch Mode)" for development
- [ ] Set breakpoints and debug your code
- [ ] Run and debug tests
- [ ] Use Logpoints for non-breaking debugging
- [ ] Profile extension performance
