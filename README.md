# pubm Changeset Check

A GitHub Action that validates PRs include properly formatted [pubm](https://github.com/syi0808/pubm) changeset files.

## Usage

```yaml
name: Changeset Check

on:
  pull_request:
    types: [opened, synchronize, reopened, labeled, unlabeled]

permissions:
  contents: read
  pull-requests: write

jobs:
  changeset-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: syi0808/pubm-actions@v1
        with:
          skip-label: no-changeset
```

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `skip-label` | PR label name that bypasses the changeset requirement | `no-changeset` |
| `comment` | Whether to post/update a PR comment with the result | `true` |
| `token` | GitHub token for posting comments | `${{ github.token }}` |
| `working-directory` | Root of the project (if not repo root) | `.` |

## Outputs

| Output | Description |
|--------|-------------|
| `status` | Result: `success`, `missing`, `invalid`, or `skipped` |
| `changeset-files` | Newline-separated list of detected changeset files |
| `errors` | JSON array of validation error strings |

## What it does

1. **Detects** new/modified changeset files in `.pubm/changesets/` via git diff against the base branch
2. **Validates** each changeset file:
   - Proper YAML frontmatter format
   - Valid bump types (`patch`, `minor`, `major`)
   - Non-empty summary
   - Package paths exist in the repo
3. **Comments** on the PR with the result (can be disabled with `comment: false`)
4. **Fails** the check if no changeset is found or validation errors exist
5. **Skips** the check if the configured skip label is present on the PR

## License

Apache-2.0
