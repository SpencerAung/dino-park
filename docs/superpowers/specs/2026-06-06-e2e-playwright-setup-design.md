# E2E test setup with Playwright — design

**Date:** 2026-06-06
**Status:** Approved (pending user spec review)
**Scope:** Install Playwright, add a small back-navigation e2e suite, wire a GitHub Actions workflow that runs the suite on every push to `main`.

## Purpose

Establish a CI-gated quality bar for the viewer. The first slice is intentionally narrow: enough infrastructure and tests to catch regressions in the recently-shipped back-navigation feature (PR #4), with room to grow without restructuring.

Unit tests are deferred to a future spec; this slice is e2e only.

## Decisions

| Question | Decision | Rationale |
|---|---|---|
| Primary goal | CI-gated quality bar | User-chosen — infra matters as much as test depth here. |
| Test scope | Happy path + deep-link refresh | Two tests covering the round-trip and the SSR reverse-lookup contract. |
| Browsers | Chromium only | Fastest CI, sufficient for catching React/Next.js regressions. |
| Server in tests | `next build && next start` via Playwright `webServer` | Production parity — catches RSC/bundling issues that dev mode masks. |
| Test layout | `e2e/<journey>.e2e.test.ts` | Organized by user journey, not by page. Cross-page flows are first-class. |
| Unit-test colocation | `xx.test.ts` next to source (future) | User preference recorded for when unit tests land. |
| CI trigger | Push to `main` only | Unit tests will gate PRs in a future spec; e2e is the post-merge canary. |
| Selectors | `getByRole` with existing `aria-label`s | Both `Hotspot` and `BackButton` already have stable accessible names. |
| Visual regression | Out of scope | Adds flake without proportional value at this stage. |
| Network mocking | Out of scope | Real video playback (~1s placeholder) is the actual behavior we want to verify. |

## Architecture

### Dependencies

Add to `devDependencies`:

- `@playwright/test` — latest stable 1.x

Browser binary is installed via `npx playwright install chromium`. Not committed; cached in CI.

### New files

- `playwright.config.ts` — Playwright runner configuration.
- `tsconfig.e2e.json` — separate TypeScript context for tests.
- `e2e/back-navigation.e2e.test.ts` — the two-test suite.
- `.github/workflows/e2e.yml` — GitHub Actions workflow.

### Modified files

- `package.json` — three new scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:install`. Add `@playwright/test` to devDependencies.
- `tsconfig.json` — exclude `e2e/` and `playwright.config.ts` from app type-check.
- `.gitignore` — ignore `playwright-report/`, `test-results/`, `playwright/.cache/`.

### File contents

#### `playwright.config.ts`

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.test.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

#### `tsconfig.e2e.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "types": ["@playwright/test", "node"] },
  "include": ["e2e/**/*", "playwright.config.ts"],
  "exclude": ["node_modules", ".next", "src"]
}
```

#### `tsconfig.json` — modification

Add to the existing config:

```json
"exclude": ["node_modules", "e2e", "playwright.config.ts"]
```

If an `exclude` already exists, merge these entries in.

#### `package.json` — modifications

In `scripts`:

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:install": "playwright install chromium"
```

In `devDependencies`:

```json
"@playwright/test": "^1"
```

(Use the actual installed version, not the caret literal.)

#### `.gitignore` — append

```
/playwright-report
/test-results
/playwright/.cache
```

#### `e2e/back-navigation.e2e.test.ts`

```ts
import { test, expect } from '@playwright/test'

test.describe('back navigation', () => {
  test('round trip from root: view-a → view-b → back to view-a', async ({ page }) => {
    await page.goto('/p/demo')
    await expect(page).toHaveURL(/\/p\/demo\/view-a$/)

    await page.getByRole('button', { name: 'Go to view-b' }).click()
    await expect(page).toHaveURL(/\/p\/demo\/view-b$/)

    const backBtn = page.getByRole('button', { name: 'Back to view-a' })
    await expect(backBtn).toBeVisible()

    await backBtn.click()
    await expect(page).toHaveURL(/\/p\/demo\/view-a$/)

    await expect(page.getByRole('button', { name: /^Back to/ })).toHaveCount(0)
  })

  test('deep-link to view-b: back button works on fresh load', async ({ page }) => {
    await page.goto('/p/demo/view-b')
    const backBtn = page.getByRole('button', { name: 'Back to view-a' })
    await expect(backBtn).toBeVisible()

    await backBtn.click()
    await expect(page).toHaveURL(/\/p\/demo\/view-a$/)
  })
})
```

#### `.github/workflows/e2e.yml`

```yaml
name: e2e

on:
  push:
    branches: [main]

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Cache Playwright browsers
        id: pw-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: pw-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

      - name: Install Chromium
        if: steps.pw-cache.outputs.cache-hit != 'true'
        run: npx playwright install chromium --with-deps

      - name: Install Chromium system deps (cached binaries)
        if: steps.pw-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps chromium

      - run: npm run test:e2e

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Upload traces
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: test-results/
          retention-days: 14
```

## Selector strategy

Use Playwright's user-facing locators in this priority order:

1. `getByRole('button', { name: '...' })` — preferred. Both `Hotspot` and `BackButton` already expose stable `aria-label`s (`"Go to view-b"`, `"Back to view-a"`).
2. `getByText`, `getByLabel` — for non-interactive text.
3. CSS / XPath — last resort, with a comment explaining why role-based wasn't viable.

No `data-testid` is added in this slice. Every queried element already has an accessible name; adding test-ids would couple production markup to tests without benefit.

URL assertions (`toHaveURL`) are preferred over DOM assertions when proving the outcome of a navigation — they auto-wait, are less flaky, and verify user-visible behavior.

## Design rationale

### Why two tsconfigs

App and e2e have different globals and `types`. Keeping them separate prevents Playwright's `test`/`expect` from leaking into the app's type-check and prevents Next.js types from polluting the test context.

### Why no overlay-phase assertions

The transition mechanism (`idle → playing → fading → router.push`) is internal state. The user-observable outcome is the URL change, which Playwright's `toHaveURL` auto-waits for. Asserting on overlay phases would couple tests to internal state and break harmlessly when the mechanism is refactored.

### Why production build in CI

`next build && next start` exercises the same path Vercel deploys: RSC bundling, route prefetch, static optimization. Dev mode (`next dev`) masks issues that only surface in production output. Cost is ~30s extra startup, paid once per CI run.

### Why push-to-main trigger

Per the agreed CI strategy: unit tests will gate PRs in a future spec (fast feedback, narrow scope); e2e is the post-merge canary that catches integration breakage. Running e2e on every PR for two tests is acceptable but unnecessary — the unit-test gate, once it exists, will catch what e2e can't.

### Why single test file for two entry points

Both tests exercise the back-navigation journey; they differ only in entry point (root vs deep link). Splitting into separate files would fragment what is conceptually one feature's coverage. If the suite grows to include forward-only or transition-internals tests, those become new files.

### Why negative assertion for absent back button

`toHaveCount(0)` on view-a validates the SSR reverse-lookup correctly returns `null` for root views. Without it, a regression that always shows the back button would pass test 1's positive assertions silently.

## Acceptance criteria

The slice is done when all of these are true:

1. `npm run test:e2e` passes locally (Chromium installed via `npm run test:e2e:install`).
2. `npm run test:e2e:ui` opens the Playwright UI runner.
3. `npx tsc --noEmit -p tsconfig.e2e.json` passes — e2e files type-check in isolation.
4. `npx tsc --noEmit` (root config) passes — `e2e/` is excluded from app type-check.
5. `npm run build` still succeeds — Playwright deps don't leak into the Next.js bundle.
6. `npm run lint` passes on the new files.
7. A push to `main` triggers `.github/workflows/e2e.yml` and the job goes green end-to-end (verified by watching the post-merge run).
8. Forcing a failure (e.g., temporarily renaming an `aria-label` in a follow-up branch) produces an HTML report + trace artifact uploaded to the failed run.
9. `playwright-report/`, `test-results/`, `playwright/.cache/` are gitignored — no test artifacts ever committed.

## Known gaps / explicitly deferred

- **Unit-test framework + PR gate** — separate spec when the first unit test is needed. Convention recorded: `xx.test.ts` colocated with source.
- **Visual regression / screenshot snapshots** — not now; high flake surface across CI environments.
- **Cross-browser coverage** — Chromium only. Add WebKit/Firefox projects when a real bug surfaces in one of them.
- **Prefetch network assertions** — internal mechanism, not user-observable.
- **`notFound` paths for invalid scene/viewId** — framework-level concern, not our integration risk.
- **Test-data isolation / fixtures** — single demo scene; no fixtures until a second scene exists.
- **Status badge in README, Slack/email notifications, scheduled runs** — easy to add later if the gate proves useful.

## Next.js version note

Per `AGENTS.md`: this repo is on Next.js 16, which has breaking changes from earlier versions. The relevant convention here — `params` is a Promise in route components — does not affect Playwright tests (which interact with the running server, not the source). No special handling needed for e2e.
