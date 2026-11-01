import path from 'node:path';
import { test, expect } from '@fixtures/test';

// Resolved from the project root so the test works regardless of cwd or runner.
const UPLOAD_DIR = path.resolve(__dirname, '../../test-data/upload');
const FILES = ['sample-1.txt', 'sample-2.txt'].map((name) => path.join(UPLOAD_DIR, name));

test.describe('UI Testing Playground — Scenario 4: file upload', () => {
  test('uploads two files through the iframe and shows "2 file(s) selected"', async ({ uploadPage }) => {
    await expect(uploadPage.browseButton).toBeVisible();

    await uploadPage.uploadFiles(FILES);

    await expect(uploadPage.successMessage).toHaveText(`${FILES.length} file(s) selected`);
    await expect(uploadPage.fileItems).toHaveCount(FILES.length);

    // The widget lists what it received — the names must be ours.
    const listed = await uploadPage.getUploadedFileNames();
    expect(listed.sort()).toEqual(FILES.map((f) => path.basename(f)).sort());
  });
});
