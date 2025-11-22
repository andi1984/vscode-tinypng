# Contributing to VS Code TinyPNG Extension

Thank you for considering contributing to the VS Code TinyPNG extension! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/vscode-tinypng.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Node.js 22 (as specified in `.nvmrc`)
- npm or yarn
- VS Code

### Building the Extension
```bash
npm run compile
```

### Running Tests
```bash
npm test
```

### Testing the Extension Locally
1. Press `F5` in VS Code to open a new Extension Development Host window
2. Test your changes in this window
3. View debug logs in the Debug Console

## Commit Message Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification. This is important because our automated release workflow uses commit messages to determine version bumps and generate changelogs.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | minor (0.x.0) |
| `fix` | Bug fix | patch (0.0.x) |
| `docs` | Documentation changes | patch (0.0.x) |
| `style` | Code style changes (formatting, etc.) | patch (0.0.x) |
| `refactor` | Code refactoring | patch (0.0.x) |
| `perf` | Performance improvements | patch (0.0.x) |
| `test` | Adding or updating tests | patch (0.0.x) |
| `chore` | Build process or auxiliary tool changes | patch (0.0.x) |
| `ci` | CI configuration changes | patch (0.0.x) |

### Breaking Changes

Add `!` after the type or include `BREAKING CHANGE:` in the footer:

```
feat!: remove support for legacy compression API

BREAKING CHANGE: The old compression API has been removed.
Use the new queue-based API instead.
```

This will trigger a major version bump (x.0.0).

### Scopes (Optional)

Scopes help categorize changes:
- `compression` - Compression service changes
- `queue` - Queue service changes
- `config` - Configuration changes
- `ui` - UI/UX changes
- `commands` - VS Code command changes

### Examples

**Good commit messages:**
```
feat(compression): add WebP format support

Implements WebP compression using TinyPNG API.
Adds configuration option for WebP quality settings.

Closes #123
```

```
fix(queue): prevent duplicate file processing

Fixes an issue where files could be added to the
compression queue multiple times if clicked rapidly.
```

```
docs: update README with new features

- Add queue system documentation
- Update configuration examples
- Fix broken links
```

**Bad commit messages:**
```
updated stuff
fix bug
WIP
minor changes
```

## Code Style

- Use TypeScript strict mode
- Follow existing code formatting (enforced by ESLint)
- Run `npm run lint` before committing
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Test the extension manually in VS Code
- Test with various image formats (PNG, JPEG, WebP)

## Pull Request Process

1. **Update your branch** with the latest develop branch:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Ensure all checks pass:**
   - Tests pass: `npm test`
   - Linting passes: `npm run lint`
   - Build succeeds: `npm run compile`

3. **Create a pull request:**
   - Use a descriptive title following conventional commit format
   - Reference any related issues
   - Provide a clear description of changes
   - Include screenshots for UI changes

4. **Address review feedback:**
   - Make requested changes
   - Push updates to your branch
   - Respond to comments

5. **Squash commits** (if requested):
   - Combine related commits for a cleaner history
   - Maintain conventional commit format

## Project Structure

```
vscode-tinypng/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── commands/              # VS Code command handlers
│   │   ├── compressFile.ts
│   │   ├── compressFolder.ts
│   │   ├── compressGitStage.ts
│   │   └── getCompressionCount.ts
│   ├── services/              # Business logic services
│   │   ├── compressionService.ts
│   │   ├── configService.ts
│   │   └── queueService.ts
│   ├── utils/                 # Utility functions
│   │   ├── errorHandler.ts
│   │   └── fileUtils.ts
│   └── types/                 # TypeScript type definitions
├── test/                      # Tests
├── .github/
│   └── workflows/             # GitHub Actions workflows
├── package.json               # Extension manifest
└── tsconfig.json             # TypeScript configuration
```

## Adding New Features

1. **Check for existing issues** - Avoid duplicate work
2. **Discuss major changes** - Open an issue first for significant features
3. **Follow the architecture** - Use existing patterns (services, commands, utils)
4. **Update documentation** - README, JSDoc comments, and this guide
5. **Add tests** - Cover new functionality
6. **Update CHANGELOG** - Not needed! It's auto-generated from commits

## Reporting Bugs

Use GitHub Issues with the following information:
- VS Code version
- Extension version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages or logs

## Feature Requests

Open a GitHub Issue with:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach
- Willingness to contribute

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Questions?

- Open an issue for general questions
- Check existing issues and documentation first
- Be specific and provide context

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🎉
