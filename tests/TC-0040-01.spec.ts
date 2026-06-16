import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    scenario: 'Step 1 - Continue disabled when ZIP not entered',
    step: 1,
    stepHeading: "Let's get started",
    fieldsToFill: {},
    expectedDisabled: true,
    description: 'Continue button should be disabled when no ZIP is entered'
  },
  {
    scenario: 'Step 1 - Continue disabled when ZIP not resolved',
    step: 1,
    stepHeading: "Let's get started",
    fieldsToFill: {
      zip: '85001'
    },
    skipSearch: false,
    expectedDisabled: true,
    description: 'Continue button should be disabled when ZIP is entered but Search not clicked'
  },
  {
    scenario: 'Step 1 - Continue disabled when county not selected',
    step: 1,
    stepHeading: "Let's get started",
    fieldsToFill: {
      zip: '85001'
    },
    skipSearch: false,
    clickSearch: true,
    expectedDisabled: true,
    description: 'Continue button should be disabled when ZIP is resolved but county not selected'
  },
  {
    scenario: 'Step 1 - Continue disabled when plan year not selected',
    step: 1,
    stepHeading: "Let's get started",
    fieldsToFill: {
      zip: '85001',
      county: 'Maricopa'
    },
    skipSearch: false,
    clickSearch: true,
    expectedDisabled: true,
    description: 'Continue button should be disabled when county selected but plan year not selected'
  },
  {
    scenario: 'Step 2 - Continue disabled when no pharmacy selected',
    step: 2,
    stepHeading: 'Add your pharmacy',
    fieldsToFill: {
      zip: '85001'
    },
    expectedDisabled: true,
    description: 'Continue button should be disabled when no pharmacy is selected'
  },
  {
    scenario: 'Step 2 - Continue disabled after pharmacy search but no selection',
    step: 2,
    stepHeading: 'Add your pharmacy',
    fieldsToFill: {
      zip: '85001',
      distance: '10'
    },
    clickPharmacySearch: true,
    expectedDisabled: true,
    description: 'Continue button should be disabled when pharmacy search is done but no pharmacy selected'
  }
];

test.describe('TC-0040-01: Verify Continue button is disabled when required fields are empty', () => {
  
  testData.forEach((data) => {
    test(data.scenario, async ({ page }) => {
      await page.goto(BASE_URL);

      if (data.step === 1) {
        await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();

        if (data.fieldsToFill.zip) {
          await page.getByLabel('ZIP code').fill(data.fieldsToFill.zip);
        }

        if (data.clickSearch) {
          await page.getByRole('button', { name: 'Search' }).click();
          await page.waitForTimeout(500);
        }

        if (data.fieldsToFill.county) {
          await page.getByLabel('County').selectOption(data.fieldsToFill.county);
        }

        if (data.fieldsToFill.planYear) {
          await page.getByLabel('Plan year').selectOption(data.fieldsToFill.planYear);
        }

        const continueButton = page.getByRole('button', { name: 'Continue' });
        
        if (data.expectedDisabled) {
          await expect(continueButton).toBeDisabled();
        } else {
          await expect(continueButton).toBeEnabled();
        }

        await expect(page.getByLabel('ZIP code')).toBeVisible();
        await expect(page.getByLabel('County')).toBeVisible();
        await expect(page.getByLabel('Plan year')).toBeVisible();

      } else if (data.step === 2) {
        await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
        
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('County').selectOption('Maricopa');
        await page.getByLabel('Plan year').selectOption('2026');
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.getByRole('heading', { name: data.stepHeading })).toBeVisible();

        if (data.fieldsToFill.zip) {
          await page.getByLabel('ZIP code').fill(data.fieldsToFill.zip);
        }

        if (data.fieldsToFill.distance) {
          await page.getByLabel('Distance').selectOption(data.fieldsToFill.distance);
        }

        if (data.clickPharmacySearch) {
          await page.getByRole('button', { name: 'Search pharmacies' }).click();
          await page.waitForTimeout(1000);
        }

        const continueButton = page.getByRole('button', { name: 'Continue' });
        
        if (data.expectedDisabled) {
          await expect(continueButton).toBeDisabled();
        } else {
          await expect(continueButton).toBeEnabled();
        }

        await expect(page.getByLabel('ZIP code')).toBeVisible();
        await expect(page.getByLabel('Distance')).toBeVisible();
      }
    });
  });

  test('Step 1 - Required field indicators are visible', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
    
    await expect(page.getByLabel('ZIP code')).toBeVisible();
    await expect(page.getByLabel('County')).toBeVisible();
    await expect(page.getByLabel('Plan year')).toBeVisible();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
  });

  test('Step 1 - Continue enabled only when all required fields are filled', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
    
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

  test('Step 2 - Continue enabled only when pharmacy is selected', async ({ page }) => {
    await page.goto(BASE_URL);
    
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
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(1000);
    
    await expect(continueButton).toBeDisabled();
    
    await page.locator('button.ma-pharma').first().click();
    await expect(continueButton).toBeEnabled();
  });

  test('Step 3 - Continue enabled without medications (optional step)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByLabel('Distance').selectOption('10');
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(1000);
    await page.locator('button.ma-pharma').first().click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
  });

  test('Validation prevents advancement with incomplete data across all steps', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
    let continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    
    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
    continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByLabel('Distance').selectOption('10');
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(1000);
    await page.locator('button.ma-pharma').first().click();
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    
    continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    
    const submitButton = page.getByRole('button', { name: 'Submit enrollment' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });
});