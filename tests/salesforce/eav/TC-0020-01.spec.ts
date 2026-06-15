import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    testId: 'TC-0020-01-01',
    description: 'Verify help contact information and browser warning on enrollment home page (step 1)',
    zipCode: '85001',
    county: 'Maricopa',
    planYear: '2026'
  },
  {
    testId: 'TC-0020-01-02',
    description: 'Verify help contact information and browser warning persist on step 2',
    zipCode: '85003',
    county: 'Maricopa',
    planYear: '2027',
    pharmacyZip: '85003',
    distance: '10'
  },
  {
    testId: 'TC-0020-01-03',
    description: 'Verify help contact information and browser warning persist on step 3',
    zipCode: '85251',
    county: 'Maricopa',
    planYear: '2026',
    pharmacyZip: '85251',
    distance: '5'
  },
  {
    testId: 'TC-0020-01-04',
    description: 'Verify help contact information and browser warning persist on step 4',
    zipCode: '89101',
    county: 'Clark',
    planYear: '2026',
    pharmacyZip: '89101',
    distance: '15'
  }
];

test.describe('TC-0020-01: Verify help contact information displays on enrollment home page', () => {
  
  testData.forEach((data) => {
    test(`${data.testId}: ${data.description}`, async ({ page }) => {
      await page.goto(BASE_URL);

      await expect(page.getByRole('heading', { name: /Let's get started/i })).toBeVisible();

      const helpContactRegex = /help|contact|assistance|support/i;
      const phoneRegex = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s?\d{3}[-.\s]?\d{4}|1-\d{3}-\d{3}-\d{4}/;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const browserWarningRegex = /do not close|don't close|keep.*open|avoid closing|browser.*open|lose.*progress|losing.*progress/i;

      const pageContent = await page.textContent('body');

      expect(pageContent).toMatch(helpContactRegex);
      const hasPhoneOrEmail = phoneRegex.test(pageContent) || emailRegex.test(pageContent);
      expect(hasPhoneOrEmail).toBeTruthy();

      expect(pageContent).toMatch(browserWarningRegex);

      const helpElement = page.locator('text=/help|contact|assistance|support/i').first();
      await expect(helpElement).toBeVisible();

      const warningElement = page.locator('text=/do not close|don\'t close|keep.*open|avoid closing|browser.*open|lose.*progress|losing.*progress/i').first();
      await expect(warningElement).toBeVisible();

      const helpBox = await helpElement.boundingBox();
      const warningBox = await warningElement.boundingBox();
      expect(helpBox).not.toBeNull();
      expect(warningBox).not.toBeNull();

      if (data.testId === 'TC-0020-01-01') {
        return;
      }

      await page.getByLabel('ZIP code').fill(data.zipCode);
      await page.getByRole('button', { name: 'Search' }).click();

      await page.waitForTimeout(500);

      await page.getByLabel('County').selectOption(data.county);
      await page.getByLabel('Plan year').selectOption(data.planYear);

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();

      const step2Content = await page.textContent('body');
      expect(step2Content).toMatch(helpContactRegex);
      const step2HasPhoneOrEmail = phoneRegex.test(step2Content) || emailRegex.test(step2Content);
      expect(step2HasPhoneOrEmail).toBeTruthy();
      expect(step2Content).toMatch(browserWarningRegex);

      await expect(helpElement).toBeVisible();
      await expect(warningElement).toBeVisible();

      const step2HelpBox = await helpElement.boundingBox();
      const step2WarningBox = await warningElement.boundingBox();
      expect(step2HelpBox).not.toBeNull();
      expect(step2WarningBox).not.toBeNull();

      if (data.testId === 'TC-0020-01-02') {
        return;
      }

      await page.getByLabel('ZIP code').fill(data.pharmacyZip);
      await page.getByLabel('Distance').selectOption(data.distance);
      await page.getByRole('button', { name: 'Search pharmacies' }).click();

      await page.waitForTimeout(1000);

      const firstPharmacy = page.locator('[class*="pharmacy"]').first();
      await firstPharmacy.click();

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.getByRole('heading', { name: /Add your medications/i })).toBeVisible();

      const step3Content = await page.textContent('body');
      expect(step3Content).toMatch(helpContactRegex);
      const step3HasPhoneOrEmail = phoneRegex.test(step3Content) || emailRegex.test(step3Content);
      expect(step3HasPhoneOrEmail).toBeTruthy();
      expect(step3Content).toMatch(browserWarningRegex);

      await expect(helpElement).toBeVisible();
      await expect(warningElement).toBeVisible();

      const step3HelpBox = await helpElement.boundingBox();
      const step3WarningBox = await warningElement.boundingBox();
      expect(step3HelpBox).not.toBeNull();
      expect(step3WarningBox).not.toBeNull();

      if (data.testId === 'TC-0020-01-03') {
        return;
      }

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(page.getByRole('heading', { name: /Review & Enroll/i })).toBeVisible();

      const step4Content = await page.textContent('body');
      expect(step4Content).toMatch(helpContactRegex);
      const step4HasPhoneOrEmail = phoneRegex.test(step4Content) || emailRegex.test(step4Content);
      expect(step4HasPhoneOrEmail).toBeTruthy();
      expect(step4Content).toMatch(browserWarningRegex);

      await expect(helpElement).toBeVisible();
      await expect(warningElement).toBeVisible();

      const step4HelpBox = await helpElement.boundingBox();
      const step4WarningBox = await warningElement.boundingBox();
      expect(step4HelpBox).not.toBeNull();
      expect(step4WarningBox).not.toBeNull();
    });
  });

  test('TC-0020-01-05: Verify help contact and browser warning remain in consistent positions across all steps', async ({ page }) => {
    await page.goto(BASE_URL);

    const helpElement = page.locator('text=/help|contact|assistance|support/i').first();
    const warningElement = page.locator('text=/do not close|don\'t close|keep.*open|avoid closing|browser.*open|lose.*progress|losing.*progress/i').first();

    await expect(helpElement).toBeVisible();
    await expect(warningElement).toBeVisible();

    const step1HelpBox = await helpElement.boundingBox();
    const step1WarningBox = await warningElement.boundingBox();

    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();

    const step2HelpBox = await helpElement.boundingBox();
    const step2WarningBox = await warningElement.boundingBox();

    expect(Math.abs(step1HelpBox.x - step2HelpBox.x)).toBeLessThan(10);
    expect(Math.abs(step1HelpBox.y - step2HelpBox.y)).toBeLessThan(10);
    expect(Math.abs(step1WarningBox.x - step2WarningBox.x)).toBeLessThan(10);
    expect(Math.abs(step1WarningBox.y - step2WarningBox.y)).toBeLessThan(10);

    await page.getByLabel('ZIP code').fill('85001');
    await page.getByLabel('Distance').selectOption('5');
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(1000);
    const firstPharmacy = page.locator('[class*="pharmacy"]').first();
    await firstPharmacy.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: /Add your medications/i })).toBeVisible();

    const step3HelpBox = await helpElement.boundingBox();
    const step3WarningBox = await warningElement.boundingBox();

    expect(Math.abs(step2HelpBox.x - step3HelpBox.x)).toBeLessThan(10);
    expect(Math.abs(step2HelpBox.y - step3HelpBox.y)).toBeLessThan(10);
    expect(Math.abs(step2WarningBox.x - step3WarningBox.x)).toBeLessThan(10);
    expect(Math.abs(step2WarningBox.y - step3WarningBox.y)).toBeLessThan(10);

    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: /Review & Enroll/i })).toBeVisible();

    const step4HelpBox = await helpElement.boundingBox();
    const step4WarningBox = await warningElement.boundingBox();

    expect(Math.abs(step3HelpBox.x - step4HelpBox.x)).toBeLessThan(10);
    expect(Math.abs(step3HelpBox.y - step4HelpBox.y)).toBeLessThan(10);
    expect(Math.abs(step3WarningBox.x - step4WarningBox.x)).toBeLessThan(10);
    expect(Math.abs(step3WarningBox.y - step4WarningBox.y)).toBeLessThan(10);
  });
});