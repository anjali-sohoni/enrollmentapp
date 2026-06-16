import { test, expect } from '@playwright/test';

const testData = [
  {
    description: 'Valid phone number format (123) 456-7890',
    step1: {
      zip: '85001',
      county: 'Maricopa',
      planYear: '2026'
    },
    step2: {
      zip: '85001',
      pharmacyName: '',
      distance: '10',
      expectedPharmacyName: 'CVS Pharmacy'
    },
    expectedPhoneFormat: /^\(\d{3}\) \d{3}-\d{4}$/
  },
  {
    description: 'Valid phone number format with different pharmacy',
    step1: {
      zip: '85003',
      county: 'Maricopa',
      planYear: '2026'
    },
    step2: {
      zip: '85003',
      pharmacyName: '',
      distance: '5',
      expectedPharmacyName: 'Walgreens'
    },
    expectedPhoneFormat: /^\(\d{3}\) \d{3}-\d{4}$/
  },
  {
    description: 'Phone number format for multiple results',
    step1: {
      zip: '85251',
      county: 'Maricopa',
      planYear: '2027'
    },
    step2: {
      zip: '85251',
      pharmacyName: '',
      distance: '15',
      expectedPharmacyName: ''
    },
    expectedPhoneFormat: /^\(\d{3}\) \d{3}-\d{4}$/,
    validateMultiple: true
  }
];

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('TC-0027-09: Validate phone number format', () => {
  testData.forEach((data) => {
    test(data.description, async ({ page }) => {
      await page.goto(baseURL);

      await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();

      await page.getByLabel('ZIP code').fill(data.step1.zip);
      await page.getByRole('button', { name: 'Search' }).click();

      await page.waitForTimeout(500);

      await page.getByLabel('County').selectOption(data.step1.county);
      await page.getByLabel('Plan year').selectOption(data.step1.planYear);

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();

      await page.getByLabel('ZIP code').fill(data.step2.zip);

      if (data.step2.pharmacyName) {
        await page.getByLabel('Pharmacy name (optional)').fill(data.step2.pharmacyName);
      }

      await page.getByLabel('Distance').selectOption(data.step2.distance);

      await page.getByRole('button', { name: 'Search pharmacies' }).click();

      await page.waitForTimeout(1000);

      const pharmacyResults = page.locator('button.ma-pharma');
      await expect(pharmacyResults.first()).toBeVisible();

      if (data.validateMultiple) {
        const resultCount = await pharmacyResults.count();
        expect(resultCount).toBeGreaterThan(0);

        for (let i = 0; i < Math.min(resultCount, 5); i++) {
          const pharmacyCard = pharmacyResults.nth(i);
          await expect(pharmacyCard).toBeVisible();

          const cardText = await pharmacyCard.textContent();
          expect(cardText).toBeTruthy();

          const phoneMatches = cardText!.match(/\(\d{3}\) \d{3}-\d{4}/g);
          expect(phoneMatches).toBeTruthy();
          expect(phoneMatches!.length).toBeGreaterThanOrEqual(1);

          phoneMatches!.forEach(phone => {
            expect(phone).toMatch(data.expectedPhoneFormat);
          });
        }
      } else {
        let targetPharmacy;
        if (data.step2.expectedPharmacyName) {
          targetPharmacy = page.getByRole('button').filter({ hasText: data.step2.expectedPharmacyName }).first();
        } else {
          targetPharmacy = pharmacyResults.first();
        }

        await expect(targetPharmacy).toBeVisible();

        const pharmacyText = await targetPharmacy.textContent();
        expect(pharmacyText).toBeTruthy();

        const phoneMatches = pharmacyText!.match(/\(\d{3}\) \d{3}-\d{4}/g);
        expect(phoneMatches).toBeTruthy();
        expect(phoneMatches!.length).toBeGreaterThanOrEqual(1);

        const phoneNumber = phoneMatches![0];
        expect(phoneNumber).toMatch(data.expectedPhoneFormat);

        const areaCode = phoneNumber.substring(1, 4);
        expect(areaCode).toMatch(/^\d{3}$/);

        const exchange = phoneNumber.substring(6, 9);
        expect(exchange).toMatch(/^\d{3}$/);

        const lineNumber = phoneNumber.substring(10, 14);
        expect(lineNumber).toMatch(/^\d{4}$/);

        expect(phoneNumber.charAt(0)).toBe('(');
        expect(phoneNumber.charAt(4)).toBe(')');
        expect(phoneNumber.charAt(5)).toBe(' ');
        expect(phoneNumber.charAt(9)).toBe('-');
      }
    });
  });

  test('All pharmacy results display phone numbers in correct format', async ({ page }) => {
    await page.goto(baseURL);

    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();

    await page.getByLabel('ZIP code').fill('89101');
    await page.getByRole('button', { name: 'Search' }).click();

    await page.waitForTimeout(500);

    await page.getByLabel('County').selectOption('Clark');
    await page.getByLabel('Plan year').selectOption('2026');

    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();

    await page.getByLabel('ZIP code').fill('89101');
    await page.getByLabel('Distance').selectOption('25');

    await page.getByRole('button', { name: 'Search pharmacies' }).click();

    await page.waitForTimeout(1000);

    const pharmacyResults = page.locator('button.ma-pharma');
    const resultCount = await pharmacyResults.count();
    expect(resultCount).toBeGreaterThan(0);

    for (let i = 0; i < resultCount; i++) {
      const pharmacyCard = pharmacyResults.nth(i);
      await expect(pharmacyCard).toBeVisible();

      const cardText = await pharmacyCard.textContent();
      expect(cardText).toBeTruthy();

      const phoneMatches = cardText!.match(/\(\d{3}\) \d{3}-\d{4}/g);
      expect(phoneMatches).toBeTruthy();
      expect(phoneMatches!.length).toBeGreaterThanOrEqual(1);

      phoneMatches!.forEach(phone => {
        expect(phone).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/);
        expect(phone.length).toBe(14);
      });
    }
  });
});