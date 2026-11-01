import { test, expect } from '@fixtures/test';

test.describe('UI Testing Playground — Scenario 3: scroll to click', () => {
  test('clicks all four buttons (page scroll, container, nested, hover-reveal) and sees the final message', async ({
    scrollToClickPage,
  }) => {
    await expect(scrollToClickPage.progressText).toHaveText('Buttons clicked: 0 / 4');

    await scrollToClickPage.clickAllButtons();

    // Each button flips to "Clicked!" with a success class — proves each individual click landed.
    for (const button of scrollToClickPage.allTargetButtons) {
      await expect(button).toHaveText('Clicked!');
      await expect(button).toHaveClass(/btn-success/);
    }

    await expect(scrollToClickPage.progressText).toHaveText('All buttons clicked!');
  });
});
