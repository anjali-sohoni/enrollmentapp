import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    scenario: 'Step 1 - Continue button enables when ZIP resolved, county and plan year selected',
    step: 1,
    zipCode: '85001',
    county: 'Maricopa',
    planYear: '2026',
    expectedHeading: "Let's get started"
  },
  {
    scenario: 'Step 2 - Continue button enables when pharmacy is selected',
    step: 2,
    step1ZipCode: '85001',
    step1County: 'Maricopa',
    step1PlanYear: '2026',
    step2ZipCode: '85001',
    distance: '10',
    expectedHeading: 'Add your pharmacy'
  },
  {
    scenario: 'Step 3 - Continue button is enabled (medications optional)',
    step: 3,
    step1ZipCode: '85001',
    step1County: 'Maricopa',
    step1PlanYear: '2026',
    step2ZipCode: '85001',
    distance: '10'
  }
];

test.describe('TC-0040-02: Verify Continue button enables when all required fields are populated', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Step 1 - Continue button disabled initially and enables when all required fields populated', async ({ page }) => {
    const data = testData[0];
    
    await expect(page.getByRole('heading', { name: data.expectedHeading })).toBeVisible();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill(data.zipCode);
    await expect(continueButton).toBeDisabled();
    
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('County').selectOption(data.county);
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('Plan year').selectOption(data.planYear);
    
    await expect(continueButton).toBeEnabled();
    
    const countySelect = page.getByLabel('County');
    await expect(countySelect).toHaveValue(data.county);
    const planYearSelect = page.getByLabel('Plan year');
    await expect(planYearSelect).toHaveValue(data.planYear);
  });

  test('Step 1 - Continue button remains disabled when only ZIP is entered without search', async ({ page }) => {
    const data = testData[0];
    
    await expect(page.getByRole('heading', { name: data.expectedHeading })).toBeVisible();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill(data.zipCode);
    
    await expect(continueButton).toBeDisabled();
  });

  test('Step 1 - Continue button remains disabled when ZIP resolved but county not selected', async ({ page }) => {
    const data = testData[0];
    
    await expect(page.getByRole('heading', { name: data.expectedHeading })).toBeVisible();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    
    await page.getByLabel('ZIP code').fill(data.zipCode);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('Plan year').selectOption(data.planYear);
    
    await expect(continueButton).toBeDisabled();
  });

  test('Step 1 - Continue button remains disabled when ZIP resolved and county selected but plan year not selected', async ({ page }) => {
    const data = testData[0];
    
    await expect(page.getByRole('heading', { name: data.expectedHeading })).toBeVisible();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    
    await page.getByLabel('ZIP code').fill(data.zipCode);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    
    await page.getByLabel('County').selectOption(data.county);
    
    await expect(continueButton).toBeDisabled();
  });

  test('Step 2 - Continue button disabled initially and enables when pharmacy is selected', async ({ page }) => {
    const data = testData[1];
    
    await page.getByLabel('ZIP code').fill(data.step1ZipCode);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption(data.step1County);
    await page.getByLabel('Plan year').selectOption(data.step1PlanYear);
    await page.getByRole('button', { name: 'Continue' }).click();
    
    await expect(page.getByRole('heading', { name: data.expectedHeading })).toBeVisible();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('ZIP code').fill(data.step2ZipCode);
    await expect(continueButton).toBeDisabled();
    
    await page.getByLabel('Distance').selectOption(data.distance);
    await expect(continueButton).toBeDisabled();
    
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(500);
    
    await expect(continueButton).toBeDisabled();
    
    const firstPharmacy = page.locator('button.ma-pharma').first();
    await expect(firstPharmacy).toBeVisible();
    await firstPharmacy.click();
    
    await expect(continueButton).toBeEnabled();
  });

  test('Step 2 - Continue button remains disabled when pharmacy search performed but no pharmacy selected', async ({ page }) => {
    const data = testData[1];
    
    await page.getByLabel('ZIP code').fill(data.step1ZipCode);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption(data.step1County);
    await page.getByLabel('Plan year').selectOption(data.step1PlanYear);
    await page.getByRole('button', { name: 'Continue' }).click();
    
    await expect(page.getByRole('heading', { name: data.expectedHeading })).toBeVisible();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    
    await page.getByLabel('ZIP code').fill(data.step2ZipCode);
    await page.getByLabel('Distance').selectOption(data.distance);
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(500);
    
    await expect(continueButton).toBeDisabled();
  });

  test('Step 3 - Continue button is enabled without adding medications (optional step)', async ({ page }) => {
    const data = testData[2];
    
    await page.getByLabel('ZIP code').fill(data.step1ZipCode);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption(data.step1County);
    await page.getByLabel('Plan year').selectOption(data.step1PlanYear);
    await page.getByRole('button', { name: 'Continue' }).click();
    
    await page.getByLabel('ZIP code').fill(data.step2ZipCode);
    await page.getByLabel('Distance').selectOption(data.distance);
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(500);
    const firstPharmacy = page.locator('button.ma-pharma').first();
    await firstPharmacy.click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
  });

  test('All steps - Verify required field indicators are present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
    
    await expect(page.getByLabel('ZIP code')).toBeVisible();
    await expect(page.getByLabel('County')).toBeVisible();
    await expect(page.getByLabel('Plan year')).toBeVisible();
    
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
    await expect(page.getByLabel('ZIP code')).toBeVisible();
    await expect(page.getByLabel('Distance')).toBeVisible();
  });

  test('Step validation - User cannot advance with incomplete data', async ({ page }) => {
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

});