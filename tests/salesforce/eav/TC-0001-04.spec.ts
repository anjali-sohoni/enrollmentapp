import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    description: 'ZIP code with alphabetic characters',
    zipCode: 'ABCDE',
    expectedError: true
  },
  {
    description: 'ZIP code with alphanumeric mix',
    zipCode: '850AB',
    expectedError: true
  },
  {
    description: 'ZIP code with special characters',
    zipCode: '85@01',
    expectedError: true
  },
  {
    description: 'ZIP code with spaces',
    zipCode: '850 01',
    expectedError: true
  },
  {
    description: 'ZIP code with hyphens',
    zipCode: '850-01',
    expectedError: true
  }
];

test.describe('TC-0001-04: Reject ZIP code containing non-numeric characters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
  });

  for (const data of testData) {
    test(`should reject ${data.description}`, async ({ page }) => {
      await page.getByLabel('ZIP code').fill(data.zipCode);
      await page.getByRole('button', { name: 'Search' }).click();

      await expect(page.locator('text=/error|invalid|not found/i')).toBeVisible();
      
      const countyDropdown = page.getByLabel('County');
      await expect(countyDropdown).toBeDisabled();
      
      const continueButton = page.getByRole('button', { name: 'Continue' });
      await expect(continueButton).toBeDisabled();
    });
  }

  test('should allow valid numeric ZIP code after rejecting non-numeric', async ({ page }) => {
    await page.getByLabel('ZIP code').fill('ABCDE');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('text=/error|invalid|not found/i')).toBeVisible();

    await page.getByLabel('ZIP code').clear();
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator('text=/error|invalid|not found/i')).not.toBeVisible();
    
    const countyDropdown = page.getByLabel('County');
    await expect(countyDropdown).toBeEnabled();
    
    await countyDropdown.selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
  });
});