# Agent Guidelines & Skills

This repository is configured for autonomous engineering agents, code generation, and CI/CD pipelines.

## Agent skills

### Issue tracker
GitHub Issues on repository `rizkyaryendigumilang/Recuiter-Industrial`. See `docs/agents/issue-tracker.md`.

### Domain docs
Single-context layout (`GLOSSARY.md` at repository root + `docs/adr/`). See `docs/agents/domain.md`.

---

## Architecture Overview
- **Root**: Capacitor Mobile Build Shell (Android APK Gradle & iOS Xcode Archive packaging).
- **Frontend** (`frontend/`): Next.js 16 (Turbopack) with React 19, Tailwind CSS 4, and `@base-ui/react`.
- **Backend** (`backend/`): PocketBase migrations, automated DB backups, and OAuth configuration.
- **Tests** (`test/`): Node.js native test runner (`node --test`).
