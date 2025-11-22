# Automated Release Workflow

This document explains the automated release workflow for the VS Code TinyPNG extension.

## Overview

The release workflow automates the entire release process:
1. Analyzes commits using conventional commit standards
2. Determines the appropriate semantic version bump (major, minor, patch)
3. Updates `package.json` with the new version
4. Generates/updates `CHANGELOG.md` automatically
5. Creates a Git tag for the release
6. Publishes the extension to the VS Code Marketplace
7. Creates a GitHub Release with release notes

## Setup Requirements

### 1. VS Code Marketplace Token (VSCE_PAT)

To enable automatic publishing to the VS Code Marketplace, you need to set up a Personal Access Token:

1. **Create a Personal Access Token:**
   - Go to https://dev.azure.com/
   - Navigate to User Settings > Personal Access Tokens
   - Click "New Token"
   - Name: `vscode-tinypng-release`
   - Organization: `All accessible organizations`
   - Scopes: Select `Marketplace` > `Manage`
   - Click "Create"

2. **Add the token to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `VSCE_PAT`
   - Value: Paste your Azure DevOps Personal Access Token
   - Click "Add secret"

### 2. GitHub Token

The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub Actions. No additional setup required.

## Conventional Commits

The workflow uses conventional commits to automatically determine the version bump type:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Version Bump Rules

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | **minor** (0.x.0) | `feat: add WebP compression support` |
| `fix:` | **patch** (0.0.x) | `fix: resolve file encoding issue` |
| `BREAKING CHANGE:` or `!` | **major** (x.0.0) | `feat!: remove deprecated API` |
| `chore:`, `docs:`, `refactor:` | **patch** (0.0.x) | `chore: update dependencies` |

### Examples

**Minor version bump (new feature):**
```
feat: add queue system for batch compression

Implements a concurrent queue system that processes
multiple images efficiently with configurable concurrency.
```

**Patch version bump (bug fix):**
```
fix: prevent duplicate compressions in queue

Fixes an issue where the same file could be added
to the compression queue multiple times.
```

**Major version bump (breaking change):**
```
feat!: redesign compression API

BREAKING CHANGE: The compression service now requires
async/await syntax instead of callbacks.
```

## Usage

### Triggering a Release

1. **Navigate to GitHub Actions:**
   - Go to your repository on GitHub
   - Click on the "Actions" tab
   - Select "Release" workflow from the left sidebar

2. **Run the workflow:**
   - Click "Run workflow" button
   - Configure options:
     - **Branch:** Select the branch to release from (usually `develop` or `main`)
     - **Version bump type:** Leave empty for auto-detection or manually select major/minor/patch
     - **Dry run:** Check this to test the workflow without actually publishing
   - Click "Run workflow"

### Workflow Options

#### Version Type (Optional)
- **Empty (default):** Automatically detect version bump from commits
- **major:** Force a major version bump (e.g., 1.0.0 → 2.0.0)
- **minor:** Force a minor version bump (e.g., 1.0.0 → 1.1.0)
- **patch:** Force a patch version bump (e.g., 1.0.0 → 1.0.1)

#### Dry Run
- **false (default):** Execute full release including publishing
- **true:** Test the workflow without publishing or pushing changes

## Workflow Steps

The workflow performs the following steps:

1. **Checkout & Setup**
   - Checks out the repository with full history
   - Sets up Node.js 22 with npm caching

2. **Build & Test**
   - Installs dependencies
   - Compiles TypeScript
   - Runs the test suite

3. **Version Analysis**
   - Retrieves current version from `package.json`
   - Gets the latest Git tag
   - Analyzes commits since last tag
   - Determines version bump type (unless manually specified)
   - Calculates new version number

4. **Update Files**
   - Updates `package.json` with new version
   - Updates `package-lock.json`
   - Generates/updates `CHANGELOG.md` using conventional changelog format

5. **Commit & Tag**
   - Commits version bump and changelog changes
   - Creates a Git tag (e.g., `v1.4.0`)
   - Pushes changes and tags to GitHub

6. **Package & Publish**
   - Packages the extension as `.vsix` file
   - Publishes to VS Code Marketplace (if `VSCE_PAT` is configured)

7. **GitHub Release**
   - Extracts relevant changelog section
   - Creates a GitHub Release with release notes
   - Attaches `.vsix` file to the release

## Best Practices

### 1. Use Conventional Commits
Always use conventional commit messages for your commits. This ensures accurate version bumping.

```bash
# Good
git commit -m "feat: add new compression algorithm"
git commit -m "fix: resolve memory leak in queue service"

# Bad
git commit -m "updated stuff"
git commit -m "bug fixes"
```

### 2. Test with Dry Run First
Before doing an actual release, run the workflow with dry run enabled to verify:
- Version bump is correct
- CHANGELOG looks good
- No errors in the process

### 3. Release from Develop Branch
Maintain a stable `develop` branch and trigger releases from it. This ensures:
- All tests pass
- Code is reviewed
- Features are complete

### 4. Review Generated Changelog
After the workflow completes, review the generated CHANGELOG.md to ensure:
- All important changes are documented
- Formatting is correct
- No sensitive information is exposed

## Troubleshooting

### Publication Fails

**Error:** `VSCE_PAT secret not set`
- **Solution:** Add `VSCE_PAT` secret to repository settings (see Setup Requirements)

**Error:** `Authentication failed`
- **Solution:** Verify your Personal Access Token is valid and has Marketplace permissions

### Version Not Bumped

**Issue:** Workflow runs but version stays the same
- **Cause:** No conventional commits found since last tag
- **Solution:** Ensure commits follow conventional commit format, or manually specify version type

### Tests Fail

**Issue:** Workflow fails at test step
- **Cause:** Breaking changes or failing tests in the codebase
- **Solution:** Fix tests before releasing, or skip tests (not recommended)

### Push Rejected

**Error:** `failed to push some refs`
- **Cause:** Protected branch or outdated local branch
- **Solution:** Ensure branch protection rules allow GitHub Actions to push

## Manual Release (Fallback)

If the automated workflow fails, you can still release manually:

```bash
# 1. Update version
npm version patch|minor|major

# 2. Update CHANGELOG
conventional-changelog -p angular -i CHANGELOG.md -s

# 3. Commit and tag
git add .
git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z

# 4. Push
git push origin develop
git push origin --tags

# 5. Publish
vsce login
vsce publish

# 6. Create GitHub release manually
```

## Monitoring

### Workflow Status
Monitor workflow runs in the Actions tab:
- Green checkmark: Successful release
- Red X: Failed release (check logs)
- Yellow dot: In progress

### View Logs
Click on a workflow run to see detailed logs for each step.

### Notifications
Configure GitHub notifications to receive alerts when workflows complete or fail.

## Security

- Never commit `VSCE_PAT` or other secrets to the repository
- Use GitHub Secrets for sensitive tokens
- Review workflow permissions regularly
- Audit published versions for security issues

## Support

If you encounter issues with the release workflow:
1. Check the workflow logs in GitHub Actions
2. Review this documentation
3. Check conventional-changelog and vsce documentation
4. Open an issue in the repository
