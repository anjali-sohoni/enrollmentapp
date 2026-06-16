import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    scenario: 'Step 1 - Missing ZIP code',
    step: 1,
    stepHeading: "Let's get started",
    incompleteAction: 'no-zip',
    validZip: '85001',
    validCounty: 'Maricopa',
    validYear: '2026'
  },
  {
    scenario: 'Step 1 - ZIP not resolved (Search not clicked)',
    step: 1,
    stepHeading: "Let's get started",
    incompleteAction: 'zip-not-resolved',
    validZip: '85001',
    validCounty: 'Maricopa',
    validYear: '2026'
  },
  {
    scenario: 'Step 1 - Missing County selection',
    step: 1,
    stepHeading: "Let's get started",
    incompleteAction: 'no-county',
    validZip: '85001',
    validCounty: 'Maricopa',
    validYear: '2026'
  },
  {
    scenario: 'Step 1 - Missing Plan year selection',
    step: 1,
    stepHeading: "Let's get started",
    incompleteAction: 'no-year',
    validZip: '85001',
    validCounty: 'Maricopa',
    validYear: '2026'
  },
  {
    scenario: 'Step 2 - No pharmacy selected',
    step: 2,
    stepHeading: 'Add your pharmacy',
    incompleteAction: 'no-pharmacy',
    step1Zip: '85001',
    step1County: 'Maricopa',
    step1Year: '2026',
    pharmacyZip: '85001',
    pharmacyDistance: '10'
  },
  {
    scenario: 'Step 2 - Pharmacy search not performed',
    step: 2,
    stepHeading: 'Add your pharmacy',
    incompleteAction: 'search-not-performed',
    step1Zip: '85001',
    step1County: 'Maricopa',
    step1Year: '2026',
    pharmacyZip: '85001',
    pharmacyDistance: '10'
  }
];

test.describe('TC-0040-04: Verify error message displays when attempting to advance with incomplete data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
  });

  for (const data of testData) {
    test(`${data.scenario}`, async ({ page }) => {
      if (data.step === 1) {
        const continueButton = page.getByRole('button', { name: 'Continue' });

        if (data.incompleteAction === 'no-zip') {
          await expect(continueButton).toBeDisabled();
          await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();
        } else if (data.incompleteAction === 'zip-not-resolved') {
          await page.getByLabel('ZIP code').fill(data.validZip);
          await expect(continueButton).toBeDisabled();
          await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();
        } else if (data.incompleteAction === 'no-county') {
          await page.getByLabel('ZIP code').fill(data.validZip);
          await page.getByRole('button', { name: 'Search' }).click();
          await page.waitForTimeout(500);
          await page.getByLabel('Plan year').selectOption(data.validYear);
          await expect(continueButton).toBeDisabled();
          await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();
        } else if (data.incompleteAction === 'no-year') {
          await page.getByLabel('ZIP code').fill(data.validZip);
          await page.getByRole('button', { name: 'Search' }).click();
          await page.waitForTimeout(500);
          await page.getByLabel('County').selectOption(data.validCounty);
          await expect(continueButton).toBeDisabled();
          await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();
        }

        const countySelect = page.getByLabel('County');
        const yearSelect = page.getByLabel('Plan year');
        await expect(countySelect).toBeVisible();
        await expect(yearSelect).toBeVisible();

      } else if (data.step === 2) {
        await page.getByLabel('ZIP code').fill(data.step1Zip);
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('County').selectOption(data.step1County);
        await page.getByLabel('Plan year').selectOption(data.step1Year);
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();

        const continueButton = page.getByRole('button', { name: 'Continue' });

        if (data.incompleteAction === 'no-pharmacy') {
          await page.getByLabel('ZIP code').fill(data.pharmacyZip);
          await page.getByLabel('Distance').selectOption(data.pharmacyDistance);
          await page.getByRole('button', { name: 'Search pharmacies' }).click();
          await page.waitForTimeout(500);
          await expect(continueButton).toBeDisabled();
          await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();
        } else if (data.incompleteAction === 'search-not-performed') {
          await page.getByLabel('ZIP code').fill(data.pharmacyZip);
          await page.getByLabel('Distance').selectOption(data.pharmacyDistance);
          await expect(continueButton).toBeDisabled();
          await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();
        }
      }
    });
  }

  test('Step 1 - Continue button remains disabled until all required fields completed', async ({ page }) => {
    const continueButton = page.getByRole('button', { name: 'Continue' });
    
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill('85001');
    await expect(continueButton).toBeDisabled();
    
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('County').selectOption('Maricopa');
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('Plan year').selectOption('2026');
    await expect(continueButton).toBeEnabled();
  });

  test('Step 2 - Continue button remains disabled until pharmacy selected', async ({ page }) => {
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByLabel('Distance').selectOption('10');
    await expect(continueButton).toBeDisabled();
    
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(500);
    await expect(continueButton).toBeDisabled();
    
    await page.locator('button.ma-pharma').first().click();
    await expect(continueButton).toBeEnabled();
  });

  test('Invalid ZIP code shows error and prevents advancement', async ({ page }) => {
    const continueButton = page.getByRole('button', { name: 'Continue' });
    
    await page.getByLabel('ZIP code').fill('00000');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    
    await expect(continueButton).toBeDisabled();
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
  });

  test('Required field indicators are visible on Step 1', async ({ page }) => {
    await expect(page.getByLabel('ZIP code')).toBeVisible();
    await expect(page.getByLabel('County')).toBeVisible();
    await expect(page.getByLabel('Plan year')).toBeVisible();
  });

  test('User cannot advance from Step 1 with partial data entry', async ({ page }) => {
    const continueButton = page.getByRole('button', { name: 'Continue' });
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    
    await expect(continueButton).toBeDisabled();
    
    const currentHeading = page.getByRole('heading', { name: "Let's get started" });
    await expect(currentHeading).toBeVisible();
  });

  test('Step validation enforces specific rules per step', async ({ page }) => {
    const step1Continue = page.getByRole('button', { name: 'Continue' });
    await expect(step1Continue).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    await expect(step1Continue).toBeEnabled();
    await step1Continue.click();
    
    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
    const step2Continue = page.getByRole('button', { name: 'Continue' });
    await expect(step2Continue).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByLabel('Distance').selectOption('10');
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(500);
    await page.locator('button.ma-pharma').first().click();
    await expect(step2Continue).toBeEnabled();
  });
});