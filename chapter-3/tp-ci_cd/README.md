# tp-ci_cd

## 🚀 Release Process

This project follows a strict versioning and release workflow to ensure traceability and reproducibility.

### 🔁 Continuous Integration (on push to `master`)

Every push to `master` triggers the `ci-main` workflow:

- Runs the test suite with Vitest
- If tests pass: builds the Docker image and pushes two tags to Docker Hub:
  - `latest` — points to the most recent build on master
  - `<git-sha>` — immutable reference tied to the exact commit

The build step is skipped entirely if tests fail, so `master` stays deployable at all times.

### 🏷 Creating a Release (Versioned Product)

To cut a release:

1. Make sure `master` is in the desired state (all features merged, CI green)
2. Create and push a Git tag:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```
3. The `release` workflow triggers automatically and pushes `notes-app:v1.2.3` to Docker Hub

No manual build needed — the tag push is the trigger.

### 📌 Versioning Rules

We follow [Semantic Versioning](https://semver.org/):

- `vMAJOR.MINOR.PATCH`
- **MAJOR**: breaking change
- **MINOR**: new feature, backwards-compatible
- **PATCH**: bug fix

A version tag is **never rebuilt**. Once `v1.2.3` is pushed, that image is frozen. If a fix is needed, a new tag (`v1.2.4`) is created.

### 🔎 Traceability

Every Docker image pushed from CI carries a `<git-sha>` tag. This allows to:

- Identify exactly which commit produced an image running in any environment
- Cross-reference with the GitHub PR and test run that validated the code
- Reproduce the exact same build at any point in time

`latest` is never used in production deployments — always pin to a `vX.Y.Z` or `<sha>` tag.
