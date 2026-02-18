## Pull Request

### Summary

Brief description of the change and the problem it solves.

### Type of change

- [ ] Bug fix
- [ ] New feature
- [x] Chore / maintenance (CI, docs, tests)

### What I did

- Added GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- Added `vercel.json` for Vercel deployment
- Added `.env.example` and `OPTIMIZED_MASTER_PROMPT.md`
- Extended API endpoints and Jest integration tests
- Added ESLint config and enforced lint in CI
- Added `README_DEVOPS.md` with sprint docs and checklist

### How to test

1. Run CI locally or in GitHub Actions
2. Start a MongoDB instance and run `npm test` inside `app/`

### Notes

- CI expects a MongoDB service (workflow provides a container with credentials root/root)
- Do not commit secrets; use environment variables for production
