# Publishing StyleUI to NPM

This guide explains how to publish StyleUI to NPM and make it available via unpkg CDN.

## Prerequisites

1. NPM account (create at https://www.npmjs.com/signup)
2. Verify package name availability: https://www.npmjs.com/package/styleui-components
3. Git repository properly set up

## Steps to Publish

### 1. First-time Setup
```bash
# Login to NPM
npm login

# Verify you're logged in
npm whoami
```

### 2. Final Checks
```bash
# Test the package locally
npm pack
# This creates styleui-components-0.1.0.tgz

# Check what files will be included
npm pack --dry-run

# Verify dist files exist
ls -la dist/
```

### 3. Publish to NPM
```bash
# For first release
npm publish

# For updates (after changing version in package.json)
npm version patch  # or minor/major
npm publish
```

### 4. Verify Publication
- Check NPM: https://www.npmjs.com/package/styleui-components
- Test unpkg CDN (available immediately):
  - https://unpkg.com/styleui-components/dist/styleui.min.js
  - https://unpkg.com/styleui-components/dist/styleui.css

## Using the Published Package

### Via NPM
```bash
npm install styleui-components
```

### Via CDN
```html
<!-- Latest version -->
<link rel="stylesheet" href="https://unpkg.com/styleui-components/dist/styleui.css">
<script src="https://unpkg.com/styleui-components/dist/styleui.min.js"></script>

<!-- Specific version -->
<link rel="stylesheet" href="https://unpkg.com/styleui-components@0.1.0/dist/styleui.css">
<script src="https://unpkg.com/styleui-components@0.1.0/dist/styleui.min.js"></script>
```

## Version Management

- Use semantic versioning (semver)
- Update version before each publish:
  - `npm version patch` - Bug fixes (0.1.0 → 0.1.1)
  - `npm version minor` - New features (0.1.0 → 0.2.0)
  - `npm version major` - Breaking changes (0.1.0 → 1.0.0)

## Notes

- The package name is `styleui-components` (not just `styleui` which may be taken)
- unpkg automatically serves from NPM - no additional setup needed
- The `files` field in package.json controls what gets published
- The `.npmignore` file excludes demo/development files