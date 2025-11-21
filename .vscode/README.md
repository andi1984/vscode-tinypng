# Development Setup

## Quick Start

Press **F5** to launch the extension in debug mode!

## Recommended Development Workflow

1. **Start Development**
   - Open VSCode in this project
   - Run task: `Terminal → Run Task → npm: watch` (or `npm run watch`)
   - Select "Run Extension (Watch Mode)" from debug dropdown
   - Press **F5**

2. **Edit & Test**
   - Edit code in TypeScript files
   - Save file (auto-compiles via watch mode)
   - **Reload extension**: Press `Ctrl+R` in Extension Development Host window
   - Test your changes immediately

3. **Debug**
   - Set breakpoints in `.ts` files
   - Use Debug Console to inspect variables
   - Step through code with F10/F11

## Launch Configurations

### Run Extension
Standard debugging - compiles once and launches

### Run Extension (Watch Mode) ⭐
**Recommended for development** - auto-compiles on save, reload with Ctrl+R

### Extension Tests
Debug all tests with breakpoint support

## See Full Documentation

Read [DEVELOPMENT.md](DEVELOPMENT.md) for complete guide including:
- All keyboard shortcuts
- Debugging tips & tricks
- Breakpoint types
- Common development tasks
- Troubleshooting guide

## Key Features

✅ **Source Maps** - Debug TypeScript directly
✅ **Smart Stepping** - Skip Node.js internals
✅ **Watch Mode** - Auto-compile on save
✅ **Hot Reload** - Ctrl+R to reload changes
✅ **Test Debugging** - Set breakpoints in tests
✅ **ESLint Integration** - Auto-fix on save
