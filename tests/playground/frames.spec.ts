import { test, expect } from '@fixtures/test';

test.describe('UI Testing Playground — Scenario 6: buttons inside nested frames', () => {
  test('clicks every button in the outer and inner frame and verifies the "Button pressed" text each time', async ({
    framesPage,
  }) => {
    for (const { name, frame } of framesPage.frames) {
      const result = framesPage.resultIn(frame);
      await expect(result, `${name}: result area starts empty`).toHaveText('');

      for (const { label, locator } of framesPage.buttonsIn(frame)) {
        await test.step(`${name} → click "${label}"`, async () => {
          await locator.click();
          await expect(result).toHaveText(`Button pressed: ${label}`);
        });
      }
    }

    // Frames are isolated: the outer result must still show its *own* last click,
    // untouched by anything that happened in the inner frame.
    await expect(framesPage.resultIn(framesPage.outerFrame)).toHaveText('Button pressed: Primary');
    await expect(framesPage.resultIn(framesPage.innerFrame)).toHaveText('Button pressed: Primary');
  });
});
