import { test, expect } from '@fixtures/test';
import type { SelectionTargets } from '@pages/playground/SelectPage';

/**
 * Selected by option *value* (stable identifiers), asserted by the visible text the page
 * echoes in its summary. Keeping both side by side documents the mapping.
 */
const targets: SelectionTargets = {
  language: 'js', //       → JavaScript
  city: 'nyc', //          → New York  (option text contains a non-breaking space)
  product: 'v3.0-beta', // → Release 3.0 Beta (not "Release 3.0")
  colors: ['purple'], //   → Purple
  fruits: ['date'], //     → Date (replaces the pre-selected Apple, Cherry, Grape)
};

const EXPECTED_SUMMARY =
  'selectLanguage: JavaScript | selectCity: New York | selectProduct: Release 3.0 Beta | selectColors: Purple | selectFruits: Date';

test.describe('UI Testing Playground — Scenario 5: select controls', () => {
  test('after selecting every control the summary line matches exactly', async ({ selectPage }) => {
    await selectPage.applySelections(targets);

    // Each control reflects the chosen value(s)...
    await expect(selectPage.language).toHaveValue(targets.language);
    await expect(selectPage.city).toHaveValue(targets.city);
    await expect(selectPage.product).toHaveValue(targets.product);
    await expect(selectPage.colors).toHaveValues(targets.colors);
    await expect(selectPage.fruits).toHaveValues(targets.fruits);

    // ...and the page-level summary is the exact text from the task.
    // toHaveText() auto-retries and normalizes whitespace (NBSP included), so the
    // "New\u00A0York" the DOM actually contains matches the "New York" we expect.
    await expect(selectPage.summary).toHaveText(EXPECTED_SUMMARY);

    // Belt and braces: a plain string equality on the explicitly normalized text.
    expect(await selectPage.getSummaryText()).toBe(EXPECTED_SUMMARY);
  });
});
