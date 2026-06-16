import { test, expect } from '@playwright/test';

const testData = [
  {
    description: 'Switch plan year selection from 2027 to 2026',
    zipCode: '85001',
    county: 'Maricopa',
    initialPlanYear: '2027',
    switchedPlanYear: '2026'
  }
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('TC-0045-08: Switch plan year selection from 2027 to 2026', () => {
  testData.forEach((data) => {
    test(data.description, async ({ page }) => {
      await page.goto(BASE_URL);

      await expect(page.getByRole('heading', { name: /Let's get started/i })).toBeVisible();

      await page.getByLabel('ZIP code').fill(data.zipCode);
      await page.getByRole('button', { name: 'Search' }).click();

      await expect(page.getByLabel('County')).toBeVisible();
      await page.getByLabel('County').selectOption(data.county);

      await page.getByLabel('Plan year').selectOption(data.initialPlanYear);

      const planYearSelect = page.getByLabel('Plan year');
      await expect(planYearSelect).toHaveValue(data.initialPlanYear);

      await page.getByLabel('Plan year').selectOption(data.switchedPlanYear);

      await expect(planYearSelect).toHaveValue(data.switchedPlanYear);

      const continueButton = page.getByRole('button', { name: 'Continue' });
      await expect(continueButton).toBeEnabled();

      await continueButton.click();

      await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();

      await page.getByRole('button', { name: 'Back' }).click();

      await expect(page.getByRole('heading', { name: /Let's get started/i })).toBeVisible();

      await expect(page.getByLabel('County')).toHaveValue(data.county);
      await expect(page.getByLabel('Plan year')).toHaveValue(data.switchedPlanYear);
    });
  });
});