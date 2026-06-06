import { test, expect } from '@playwright/test';

test.describe('back navigation', () => {
  test('round trip from root: view-a → view-b → back to view-a', async ({
    page,
  }) => {
    await page.goto('/p/demo');
    await expect(page).toHaveURL(/\/p\/demo\/view-a$/);

    await page.getByRole('button', { name: 'Go to view-b' }).click();
    await expect(page).toHaveURL(/\/p\/demo\/view-b$/);

    const backBtn = page.getByRole('button', { name: 'Back to view-a' });
    await expect(backBtn).toBeVisible();

    await backBtn.click();
    await expect(page).toHaveURL(/\/p\/demo\/view-a$/);

    await expect(page.getByRole('button', { name: /^Back to/ })).toHaveCount(0);
  });

  test('deep-link to view-b: back button works on fresh load', async ({
    page,
  }) => {
    await page.goto('/p/demo/view-b');
    const backBtn = page.getByRole('button', { name: 'Back to view-a' });
    await expect(backBtn).toBeVisible();

    await backBtn.click();
    await expect(page).toHaveURL(/\/p\/demo\/view-a$/);
  });
});
