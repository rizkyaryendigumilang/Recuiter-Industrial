# Plan 004: Establish Automated Characterization Test for i18n Translation Key Parity

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1ea7139..HEAD -- frontend/src/lib/translations.ts test/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: test-coverage / dx
- **Planned at**: commit `1ea7139`, 2026-11-18

## Why this matters

`frontend/src/lib/translations.ts` contains 830+ lines with hundreds of translated terms across 18 major domain categories (common, nav, hero, services, candidatePortal, employerDashboard, helpdesk, etc.). When developers or future agents add new UI features, keys are often added to `translations.id` but omitted in `translations.en`. In production, this causes missing labels, broken string interpolation, or empty badges when a user toggles the English language option. There is currently no automated test guarding key parity.

## Current state

In `frontend/src/lib/translations.ts`:
```typescript
export type Language = 'id' | 'en';
export const translations = {
  id: { ... },
  en: { ... }
};
```
No test in `test/` currently inspects `translations.ts`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Run test  | `node --test test/i18n-parity.test.mjs` | exit 0, pass |
| Full suite| `npm test`               | exit 0, all pass |

## Scope

**In scope**:
- `test/i18n-parity.test.mjs` (create)
- `frontend/src/lib/translations.ts` (only if key mismatches are identified)

**Out of scope**:
- Do not remove existing translation keys.
- Do not change the `LanguageContext` interface.

## Step-by-step implementation

### Step 1: Create `test/i18n-parity.test.mjs`

Write a Node.js native test suite:
1. Imports `translations` from `../frontend/src/lib/translations.ts`.
2. Recursively compares keys in `translations.id` and `translations.en`.
3. Verifies that every key in `id` exists in `en` and vice versa.
4. Asserts that the value types (string, object, array) match for every key.

### Step 2: Fix any discovered key mismatches

If the test finds any missing keys in `translations.en` compared to `translations.id`, backfill the English translations in `frontend/src/lib/translations.ts`.

### Step 3: Run verification

Run:
```bash
npm test
```
Confirm the new suite passes and total passing tests increases.

## STOP conditions

- If dynamic function values exist inside translation objects, assert their signature rather than strict equality.
