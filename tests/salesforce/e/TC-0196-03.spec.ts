import { test, expect } from '@playwright/test';

const testData = [
  {
    description: 'out-of-area ZIP code shows error message and blocks enrollment',
    invalidZip: '99999',
    expectedErrorMessage: /service area|not available|outside|out of area/i,
    validZip: '85001',
    validCounty: 'Maricopa',
    validPlanYear: '2026'
  }
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('TC-0196-03: Verify error message content for out-of-area ZIP', () => {
  testData.forEach(({ description, invalidZip, expectedErrorMessage, validZip, validCounty, validPlanYear }) => {
    test(description, async ({ page }) => {
      await page.goto(BASE_URL);

      await expect(page.getByRole('heading', { name: /Let's get started/i })).toBeVisible();

      await page.getByLabel('ZIP code').fill(invalidZip);
      await page.getByRole('button', { name: 'Search' }).click();

      await expect(page.getByText(expectedErrorMessage)).toBeVisible();

      const continueButton = page.getByRole('button', { name: 'Continue' });
      await expect(continueButton).toBeDisabled();

      const countyDropdown = page.getByLabel('County');
      await expect(countyDropdown).toBeDisabled();

      const planYearDropdown = page.getByLabel('Plan year');
      await expect(planYearDropdown).toBeDisabled();

      await page.getByLabel('ZIP code').clear();
      await page.getByLabel('ZIP code').fill(validZip);
      await page.getByRole('button', { name: 'Search' }).click();

      await expect(page.getByText(expectedErrorMessage)).not.toBeVisible();

      await page.getByLabel('County').selectOption(validCounty);
      await page.getByLabel('Plan year').selectOption(validPlanYear);

      await expect(continueButton).toBeEnabled();

      await continueButton.click();

      await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();
    });
  });
});