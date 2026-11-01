# Playwright Test Suite — Sauce Demo, UI Testing Playground, DummyJSON

End-to-end and API tests written in **Playwright + TypeScript**, structured around the Page Object Model.
Covers the seven scenarios of the assignment:

| # | Scenario | Target | Spec |
|---|----------|--------|------|
| 1 | Order the three most expensive products | [Sauce Demo](https://www.saucedemo.com/) | `tests/saucedemo/checkout-top3.spec.ts` |
| 2 | Sort products by price (asc / desc) | Sauce Demo | `tests/saucedemo/sort-by-price.spec.ts` |
| 3 | Scroll to click (4 buttons) | [Playground / scrolltoclick](https://uitestingplayground.com/scrolltoclick) | `tests/playground/scroll-to-click.spec.ts` |
| 4 | Upload two files | [Playground / upload](https://uitestingplayground.com/upload) | `tests/playground/upload.spec.ts` |
| 5 | Select controls | [Playground / select](https://uitestingplayground.com/select) | `tests/playground/select.spec.ts` |
| 6 | Buttons inside nested frames | [Playground / frames](https://uitestingplayground.com/frames) | `tests/playground/frames.spec.ts` |
| 7 | API login + JWT validation | [DummyJSON](https://dummyjson.com/) | `tests/api/auth.spec.ts` |

## Prerequisites

- **Node.js 20+** (developed on Node 22) and npm
- Internet access — all targets are public sites

## Installation

```bash
git clone <repo-url>
cd <repo-folder>
npm install          # installs deps + Chromium (postinstall hook)
```

On a fresh Linux box you may also need the browser's OS libraries:

```bash
npx playwright install-deps chromium
```

## Configuration

Everything runs out of the box with the public demo credentials. To override anything, copy the example env file and edit it:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `SAUCE_BASE_URL` | `https://www.saucedemo.com` | Sauce Demo host |
| `SAUCE_USERNAME` / `SAUCE_PASSWORD` | `standard_user` / `secret_sauce` | Sauce Demo login |
| `PLAYGROUND_BASE_URL` | `http://uitestingplayground.com` | UI Testing Playground host |
| `DUMMYJSON_BASE_URL` | `https://dummyjson.com` | API base URL (used as Playwright `baseURL`) |
| `DUMMYJSON_USERNAME` / `DUMMYJSON_PASSWORD` | `emilys` / `emilyspass` | API login |

`.env` is git-ignored; `.env.example` is the documented template.

## Running the tests

```bash
npm test                 # everything (UI + API), headless
npm run test:ui          # browser tests only
npm run test:api         # API tests only (no browser launched)
npm run test:headed      # UI tests with a visible browser
npm run test:debug       # Playwright Inspector
npm run report           # open the last HTML report
npm run typecheck        # tsc --noEmit
```

Run a single spec or filter by title:

```bash
npx playwright test tests/playground/frames.spec.ts
npx playwright test -g "sort products"
```

Traces, screenshots and video are kept **only on failure** (`test-results/`), and the HTML report is written to `playwright-report/`.

## Project structure

```
.
├── playwright.config.ts        # two projects: `ui` (Chromium) and `api` (request context only)
├── tsconfig.json               # strict TS + path aliases (@pages, @api, @utils, @data, @fixtures)
├── .env.example                # documented env overrides
├── .github/workflows/          # CI: typecheck + full run on push/PR, HTML report as artifact
├── src/
│   ├── pages/
│   │   ├── BasePage.ts         # goto() + URL ownership; pages expose locators + intent-level actions
│   │   ├── saucedemo/          # LoginPage, InventoryPage, CartPage, CheckoutPage
│   │   └── playground/         # ScrollToClickPage, UploadPage, SelectPage, FramesPage
│   ├── api/DummyJsonClient.ts  # typed wrapper over APIRequestContext
│   ├── fixtures/test.ts        # custom fixtures injecting page objects (and a logged-in inventory page)
│   ├── utils/
│   │   ├── price.ts            # "$12.34" parsing, cent-based sums, top-N, sort checks
│   │   └── jwt.ts              # base64url decode of header/payload, expiry check, masking
│   └── data/env.ts             # single source of config + checkout customer data
├── tests/
│   ├── saucedemo/              # scenarios 1–2
│   ├── playground/             # scenarios 3–6
│   └── api/                    # scenario 7
└── test-data/upload/           # the two files used by the upload scenario
```

### Design notes

- **Page objects hold locators and actions, specs hold assertions.** Locators are built once in the constructor; Playwright locators are lazy, so this costs nothing and keeps every selector in one place.
- **Fixtures instead of `beforeEach`.** A spec declares `{ inventoryPage }` and receives a page that is already logged in and loaded. Setup lives in `src/fixtures/test.ts`, not copy-pasted across specs.
- **`data-test` as the test-id attribute.** Sauce Demo tags every element with `data-test="…"`, so `testIdAttribute: 'data-test'` lets us use `getByTestId()` everywhere instead of CSS.
- **Nothing hardcoded about products.** Scenario 1 scrapes all cards, sorts by price (ties broken by name for determinism — two products share `$15.99`), and computes the expected `Item total` in **integer cents** to avoid floating-point drift.
- **Web-first assertions.** `expect(locator).toHaveText()` retries until the DOM settles; no `waitForTimeout`.
- **Frames via `frameLocator()`**, chained for the nested case, so identical markup in outer and inner frame never collides.
- **Upload via `setInputFiles()`** on the hidden `<input type="file">` inside the iframe — no native dialog involved.
- **Select by `value`**, not visible text: the city options contain non-breaking spaces and `Release 3.0` / `Release 3.0 Beta` differ only by suffix.

### Inspecting the JWT (scenario 7)

A JWT is `header.payload.signature`, each segment base64url-encoded. Header and payload are plain JSON and can be read by anyone holding the token; only the **signature** needs the server secret to verify. Ways to inspect it:

1. **In the suite** — `src/utils/jwt.ts` decodes it with `Buffer.from(segment, 'base64url')` and the test asserts on `alg`, `username`, `id`, `iat`/`exp`.
2. **Manually** — paste the token into [jwt.io](https://jwt.io), or in a shell:
   ```bash
   echo '<payload-segment>' | tr '_-' '/+' | base64 -d
   ```
3. **With a library** — `jsonwebtoken`'s `jwt.decode(token, { complete: true })` for decoding, `jwt.verify(token, secret)` to also validate the signature and expiry.

The test logs the full token as the task requires; in a real project only a masked form (`maskToken()`) would ever reach CI logs.
