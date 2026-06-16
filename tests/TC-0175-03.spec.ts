import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    scenario: 'Out-of-area ZIP code shows clear ineligibility message',
    zipCode: '10001',
    expectedErrorMessage: 'This ZIP code is not in our service area',
    shouldAllowContinue: false
  },
  {
    scenario: 'In-area ZIP code allows progression',
    zipCode: '85001',
    county: 'Maricopa',
    planYear: '2026',
    shouldAllowContinue: true
  },
  {
    scenario: 'User can modify ZIP code and retry validation',
    initialZipCode: '10001',
    retryZipCode: '85003',
    county: 'Maricopa',
    planYear: '2026',
    shouldAllowContinue: true
  }
];

test.describe('TC-0175-03: Error message explains ineligibility reason', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
  });

  test('Out-of-area ZIP code displays clear ineligibility message and disables Continue', async ({ page }) => {
    const data = testData[0];

    await page.getByLabel('ZIP code').fill(data.zipCode);
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText(data.expectedErrorMessage)).toBeVisible();

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
  });

  test('Error message explains why user cannot proceed for out-of-area ZIP', async ({ page }) => {
    const data = testData[0];

    await page.getByLabel('ZIP code').fill(data.zipCode);
    await page.getByRole('button', { name: 'Search' }).click();

    const errorMessage = page.getByText(/not in our service area/i);
    await expect(errorMessage).toBeVisible();

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  test('In-area ZIP code allows progression to next step', async ({ page }) => {
    const data = testData[1];

    await page.getByLabel('ZIP code').fill(data.zipCode);
    await page.getByRole('button', { name: 'Search' }).click();

    await page.waitForTimeout(500);

    await page.getByLabel('County').selectOption(data.county);
    await page.getByLabel('Plan year').selectOption(data.planYear);

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();

    await continueButton.click();

    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
  });

  test('User can modify ZIP code and retry validation after initial error', async ({ page }) => {
    const data = testData[2];

    await page.getByLabel('ZIP code').fill(data.initialZipCode);
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText(/not in our service area/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();

    const zipInput = page.getByLabel('ZIP code');
    await zipInput.clear();
    await zipInput.fill(data.retryZipCode);
    await page.getByRole('button', { name: 'Search' }).click();

    await page.waitForTimeout(500);

    await page.getByLabel('County').selectOption(data.county);
    await page.getByLabel('Plan year').selectOption(data.planYear);

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();

    await continueButton.click();

    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
  });

  test('System validates ZIP code against service area boundaries', async ({ page }) => {
    const outOfAreaZip = '10001';
    const inAreaZip = '85251';

    await page.getByLabel('ZIP code').fill(outOfAreaZip);
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText(/not in our service area/i)).toBeVisible();

    const zipInput = page.getByLabel('ZIP code');
    await zipInput.clear();
    await zipInput.fill(inAreaZip);
    await page.getByRole('button', { name: 'Search' }).click();

    await page.waitForTimeout(500);

    await expect(page.getByText(/not in our service area/i)).not.toBeVisible();

    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');

    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  test('Continue button remains disabled for out-of-area ZIP codes even after Search', async ({ page }) => {
    const data = testData[0];

    await page.getByLabel('ZIP code').fill(data.zipCode);
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText(/not in our service area/i)).toBeVisible();

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    await page.waitForTimeout(1000);

    await expect(continueButton).toBeDisabled();
  });

  test('Out-of-area ZIP codes display clear ineligibility message with explanation', async ({ page }) => {
    await page.getByLabel('ZIP code').fill('90210');
    await page.getByRole('button', { name: 'Search' }).click();

    const errorMessage = page.locator('text=/not in our service area|outside.*service area|ineligible/i');
    await expect(errorMessage).toBeVisible();

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });
});