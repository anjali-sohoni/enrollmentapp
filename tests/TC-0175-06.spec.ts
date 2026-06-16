import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    scenario: 'Empty ZIP code field shows validation error',
    zipCode: '',
    expectedError: 'ZIP code is required',
    shouldShowError: true,
    shouldEnableContinue: false
  },
  {
    scenario: 'Out-of-area ZIP code shows ineligibility message',
    zipCode: '10001',
    expectedError: 'not available in your area',
    shouldShowError: true,
    shouldEnableContinue: false
  },
  {
    scenario: 'Invalid ZIP code format shows validation error',
    zipCode: 'ABCDE',
    expectedError: 'valid ZIP code',
    shouldShowError: true,
    shouldEnableContinue: false
  },
  {
    scenario: 'Valid in-area ZIP code allows progression',
    zipCode: '85001',
    county: 'Maricopa',
    planYear: '2026',
    shouldShowError: false,
    shouldEnableContinue: true
  }
];

test.describe('TC-0175-06: Reject empty ZIP code field', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
  });

  for (const data of testData) {
    test(data.scenario, async ({ page }) => {
      const zipInput = page.getByLabel('ZIP code');
      const searchButton = page.getByRole('button', { name: 'Search' });
      const continueButton = page.getByRole('button', { name: 'Continue' });

      if (data.zipCode === '') {
        await zipInput.fill(data.zipCode);
        await searchButton.click();
        
        await expect(page.getByText(/ZIP code is required/i)).toBeVisible();
        await expect(continueButton).toBeDisabled();
      } else if (data.shouldShowError) {
        await zipInput.fill(data.zipCode);
        await searchButton.click();
        
        await expect(page.locator('text=/not available in your area|valid ZIP code/i')).toBeVisible();
        await expect(continueButton).toBeDisabled();
        
        await zipInput.clear();
        await zipInput.fill('85001');
        await searchButton.click();
        
        await page.waitForTimeout(500);
        
        await page.getByLabel('County').selectOption('Maricopa');
        await page.getByLabel('Plan year').selectOption('2026');
        
        await expect(continueButton).toBeEnabled();
      } else if (data.shouldEnableContinue) {
        await zipInput.fill(data.zipCode);
        await searchButton.click();
        
        await page.waitForTimeout(500);
        
        await page.getByLabel('County').selectOption(data.county);
        await page.getByLabel('Plan year').selectOption(data.planYear);
        
        await expect(continueButton).toBeEnabled();
        
        await continueButton.click();
        
        await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
      }
    });
  }

  test('System validates ZIP code against service area boundaries', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });
    const continueButton = page.getByRole('button', { name: 'Continue' });

    await zipInput.fill('10001');
    await searchButton.click();

    await expect(page.locator('text=/not available in your area/i')).toBeVisible();
    await expect(continueButton).toBeDisabled();
  });

  test('Out-of-area ZIP codes display clear ineligibility message', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });

    await zipInput.fill('90210');
    await searchButton.click();

    const errorMessage = page.locator('text=/not available in your area|cannot proceed|ineligible/i');
    await expect(errorMessage).toBeVisible();
  });

  test('Error message explains why user cannot proceed', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });

    await zipInput.fill('33101');
    await searchButton.click();

    const errorMessage = page.locator('text=/not available|cannot proceed|outside.*service area/i');
    await expect(errorMessage).toBeVisible();
  });

  test('Continue button remains disabled for out-of-area ZIP codes', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });
    const continueButton = page.getByRole('button', { name: 'Continue' });

    await zipInput.fill('60601');
    await searchButton.click();

    await page.waitForTimeout(500);

    await expect(continueButton).toBeDisabled();
  });

  test('User can modify ZIP code and retry validation', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });
    const continueButton = page.getByRole('button', { name: 'Continue' });

    await zipInput.fill('10001');
    await searchButton.click();

    await expect(page.locator('text=/not available in your area/i')).toBeVisible();
    await expect(continueButton).toBeDisabled();

    await zipInput.clear();
    await zipInput.fill('85001');
    await searchButton.click();

    await page.waitForTimeout(500);

    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');

    await expect(continueButton).toBeEnabled();
  });

  test('In-area ZIP codes allow progression to next step', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });
    const continueButton = page.getByRole('button', { name: 'Continue' });

    await zipInput.fill('85251');
    await searchButton.click();

    await page.waitForTimeout(500);

    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');

    await expect(continueButton).toBeEnabled();

    await continueButton.click();

    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
  });

  test('Multiple invalid ZIP codes maintain disabled state', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });
    const continueButton = page.getByRole('button', { name: 'Continue' });

    const invalidZips = ['10001', '90210', '33101', '60601'];

    for (const zip of invalidZips) {
      await zipInput.clear();
      await zipInput.fill(zip);
      await searchButton.click();

      await page.waitForTimeout(300);

      await expect(continueButton).toBeDisabled();
    }
  });

  test('Valid ZIP code after multiple invalid attempts', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });
    const continueButton = page.getByRole('button', { name: 'Continue' });

    await zipInput.fill('10001');
    await searchButton.click();
    await page.waitForTimeout(300);
    await expect(continueButton).toBeDisabled();

    await zipInput.clear();
    await zipInput.fill('90210');
    await searchButton.click();
    await page.waitForTimeout(300);
    await expect(continueButton).toBeDisabled();

    await zipInput.clear();
    await zipInput.fill('89101');
    await searchButton.click();
    await page.waitForTimeout(500);

    await page.getByLabel('County').selectOption('Clark');
    await page.getByLabel('Plan year').selectOption('2026');

    await expect(continueButton).toBeEnabled();
  });
});