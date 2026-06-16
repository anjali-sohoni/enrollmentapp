import { test, expect } from '@playwright/test';

const testData = [
  {
    description: 'Validate address field contains all required components for pharmacy results',
    step1: {
      zip: '85001',
      county: 'Maricopa',
      planYear: '2026'
    },
    step2: {
      zip: '85001',
      distance: '10'
    }
  }
];

test.describe('TC-0027-08: Validate address field contains all required components', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  testData.forEach((data) => {
    test(data.description, async ({ page }) => {
      await page.goto(baseURL);

      await expect(page.getByRole('heading', { name: /Let's get started/i })).toBeVisible();

      await page.getByLabel('ZIP code').fill(data.step1.zip);
      await page.getByRole('button', { name: 'Search' }).click();

      await page.getByLabel('County').selectOption(data.step1.county);
      await page.getByLabel('Plan year').selectOption(data.step1.planYear);

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();

      await page.getByLabel('ZIP code').fill(data.step2.zip);
      await page.getByLabel('Distance').selectOption(data.step2.distance);
      await page.getByRole('button', { name: 'Search pharmacies' }).click();

      await page.waitForSelector('button.ma-pharma', { timeout: 10000 });

      const pharmacyResults = page.locator('button.ma-pharma');
      const resultCount = await pharmacyResults.count();
      expect(resultCount).toBeGreaterThan(0);

      for (let i = 0; i < resultCount; i++) {
        const pharmacyCard = pharmacyResults.nth(i);

        const pharmacyName = pharmacyCard.locator('.ma-pharma-name');
        await expect(pharmacyName).toBeVisible();
        const nameText = await pharmacyName.textContent();
        expect(nameText).toBeTruthy();
        expect(nameText?.trim().length).toBeGreaterThan(0);

        const addressLine1 = pharmacyCard.locator('.ma-pharma-address-line1');
        await expect(addressLine1).toBeVisible();
        const address1Text = await addressLine1.textContent();
        expect(address1Text).toBeTruthy();
        expect(address1Text?.trim().length).toBeGreaterThan(0);

        const addressLine2 = pharmacyCard.locator('.ma-pharma-address-line2');
        await expect(addressLine2).toBeVisible();
        const address2Text = await addressLine2.textContent();
        expect(address2Text).toBeTruthy();
        expect(address2Text?.trim().length).toBeGreaterThan(0);

        const addressLine2Pattern = /^[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/;
        expect(address2Text?.trim()).toMatch(addressLine2Pattern);

        const phoneNumber = pharmacyCard.locator('.ma-pharma-phone');
        await expect(phoneNumber).toBeVisible();
        const phoneText = await phoneNumber.textContent();
        expect(phoneText).toBeTruthy();
        expect(phoneText?.trim().length).toBeGreaterThan(0);

        const phonePattern = /\(\d{3}\)\s*\d{3}-\d{4}/;
        expect(phoneText?.trim()).toMatch(phonePattern);

        const distance = pharmacyCard.locator('.ma-pharma-distance');
        await expect(distance).toBeVisible();
        const distanceText = await distance.textContent();
        expect(distanceText).toBeTruthy();
        expect(distanceText?.trim()).toMatch(/\d+(\.\d+)?\s*(mi|miles)/i);
      }

      const distances: number[] = [];
      for (let i = 0; i < resultCount; i++) {
        const pharmacyCard = pharmacyResults.nth(i);
        const distanceElement = pharmacyCard.locator('.ma-pharma-distance');
        const distanceText = await distanceElement.textContent();
        const distanceMatch = distanceText?.match(/(\d+(\.\d+)?)/);
        if (distanceMatch) {
          distances.push(parseFloat(distanceMatch[1]));
        }
      }

      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }

      const maxDistance = parseFloat(data.step2.distance);
      for (const distance of distances) {
        expect(distance).toBeLessThanOrEqual(maxDistance);
      }
    });
  });
});