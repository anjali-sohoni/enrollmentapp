import { test, expect } from '@playwright/test';

const testData = [
  {
    description: 'Verify pharmacy name field is not empty for all results',
    step1: {
      zip: '85001',
      county: 'Maricopa County',
      planYear: '2026'
    },
    step2: {
      zip: '85001',
      pharmacyName: '',
      distance: '10'
    }
  }
];

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('TC-0027-07: Validate pharmacy name field not empty', () => {
  testData.forEach((data) => {
    test(data.description, async ({ page }) => {
      await page.goto(baseURL);

      await expect(page.getByRole('heading', { name: /Let\'s get started/i })).toBeVisible();

      await page.getByLabel('ZIP code').fill(data.step1.zip);
      await page.getByRole('button', { name: 'Search' }).click();

      await page.waitForTimeout(500);

      await page.getByLabel('County').selectOption(data.step1.county);
      await page.getByLabel('Plan year').selectOption(data.step1.planYear);

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();

      await page.getByLabel('ZIP code').fill(data.step2.zip);
      if (data.step2.pharmacyName) {
        await page.getByLabel('Pharmacy name (optional)').fill(data.step2.pharmacyName);
      }
      await page.getByLabel('Distance').selectOption(data.step2.distance);

      await page.getByRole('button', { name: 'Search pharmacies' }).click();

      await page.waitForTimeout(1000);

      const pharmacyResults = page.locator('button.ma-pharma');
      const resultCount = await pharmacyResults.count();

      expect(resultCount).toBeGreaterThan(0);

      for (let i = 0; i < resultCount; i++) {
        const pharmacyItem = pharmacyResults.nth(i);
        const pharmacyNameElement = pharmacyItem.locator('.ma-pharma-name');
        
        await expect(pharmacyNameElement).toBeVisible();
        
        const pharmacyNameText = await pharmacyNameElement.textContent();
        expect(pharmacyNameText).toBeTruthy();
        expect(pharmacyNameText?.trim()).not.toBe('');
        expect(pharmacyNameText?.trim().length).toBeGreaterThan(0);
      }

      const firstPharmacyName = await pharmacyResults.first().locator('.ma-pharma-name').textContent();
      expect(firstPharmacyName).toBeTruthy();
      expect(firstPharmacyName?.trim()).not.toBe('');
    });
  });
});