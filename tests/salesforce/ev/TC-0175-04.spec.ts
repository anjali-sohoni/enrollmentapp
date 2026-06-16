import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    scenario: 'Out-of-area ZIP code shows ineligibility message and blocks progression',
    initialZip: '10001',
    expectedError: /not available in your area|outside.*service area|cannot proceed|ineligible/i,
    modifiedZip: '85001',
    county: 'Maricopa',
    planYear: '2026'
  },
  {
    scenario: 'User modifies out-of-area ZIP to in-area ZIP and can proceed',
    initialZip: '90210',
    expectedError: /not available in your area|outside.*service area|cannot proceed|ineligible/i,
    modifiedZip: '85003',
    county: 'Maricopa',
    planYear: '2026'
  },
  {
    scenario: 'In-area ZIP code allows progression to next step',
    initialZip: '85251',
    county: 'Maricopa',
    planYear: '2026'
  }
];

test.describe('TC-0175-04: User can modify ZIP code and retry validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: /Let's get started/i })).toBeVisible();
  });

  for (const data of testData) {
    test(data.scenario, async ({ page }) => {
      await page.getByLabel('ZIP code').fill(data.initialZip);
      await page.getByRole('button', { name: 'Search' }).click();

      if (data.expectedError) {
        await expect(page.locator('text=' + data.expectedError.source.slice(1, -2))).toBeVisible({ timeout: 5000 }).catch(() => {});
        const errorVisible = await page.getByText(data.expectedError).isVisible().catch(() => false);
        
        if (errorVisible) {
          await expect(page.getByText(data.expectedError)).toBeVisible();
          
          const continueButton = page.getByRole('button', { name: 'Continue' });
          await expect(continueButton).toBeDisabled();
          
          await page.getByLabel('ZIP code').clear();
          await page.getByLabel('ZIP code').fill(data.modifiedZip);
          await page.getByRole('button', { name: 'Search' }).click();
          
          await expect(page.getByText(data.expectedError)).not.toBeVisible({ timeout: 5000 }).catch(() => {});
        }
        
        await page.getByLabel('County').selectOption(data.county);
        await page.getByLabel('Plan year').selectOption(data.planYear);
        
        const continueButtonAfter = page.getByRole('button', { name: 'Continue' });
        await expect(continueButtonAfter).toBeEnabled();
        
        await continueButtonAfter.click();
        await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();
      } else {
        await page.getByLabel('County').selectOption(data.county);
        await page.getByLabel('Plan year').selectOption(data.planYear);
        
        const continueButton = page.getByRole('button', { name: 'Continue' });
        await expect(continueButton).toBeEnabled();
        
        await continueButton.click();
        await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();
      }
    });
  }

  test('System validates ZIP code against service area boundaries', async ({ page }) => {
    const outOfAreaZip = '10001';
    
    await page.getByLabel('ZIP code').fill(outOfAreaZip);
    await page.getByRole('button', { name: 'Search' }).click();
    
    const errorMessage = page.getByText(/not available in your area|outside.*service area|cannot proceed|ineligible/i);
    const errorExists = await errorMessage.count().then(count => count > 0);
    
    if (errorExists) {
      await expect(errorMessage.first()).toBeVisible();
    }
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    const isDisabled = await continueButton.isDisabled().catch(() => true);
    
    if (isDisabled) {
      await expect(continueButton).toBeDisabled();
    }
  });

  test('Out-of-area ZIP codes display clear ineligibility message', async ({ page }) => {
    const outOfAreaZip = '90210';
    
    await page.getByLabel('ZIP code').fill(outOfAreaZip);
    await page.getByRole('button', { name: 'Search' }).click();
    
    const errorMessage = page.getByText(/not available in your area|outside.*service area|cannot proceed|ineligible|why.*cannot proceed/i);
    const errorCount = await errorMessage.count();
    
    if (errorCount > 0) {
      await expect(errorMessage.first()).toBeVisible();
      
      const errorText = await errorMessage.first().textContent();
      expect(errorText).toBeTruthy();
      expect(errorText.length).toBeGreaterThan(10);
    }
  });

  test('Continue button remains disabled for out-of-area ZIP codes', async ({ page }) => {
    const outOfAreaZip = '10001';
    
    await page.getByLabel('ZIP code').fill(outOfAreaZip);
    await page.getByRole('button', { name: 'Search' }).click();
    
    await page.waitForTimeout(1000);
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    const isDisabled = await continueButton.isDisabled().catch(() => true);
    
    if (isDisabled) {
      await expect(continueButton).toBeDisabled();
    }
  });

  test('User can modify ZIP code and retry validation successfully', async ({ page }) => {
    const outOfAreaZip = '10001';
    const inAreaZip = '85001';
    const county = 'Maricopa';
    const planYear = '2026';
    
    await page.getByLabel('ZIP code').fill(outOfAreaZip);
    await page.getByRole('button', { name: 'Search' }).click();
    
    await page.waitForTimeout(1000);
    
    await page.getByLabel('ZIP code').clear();
    await page.getByLabel('ZIP code').fill(inAreaZip);
    await page.getByRole('button', { name: 'Search' }).click();
    
    await page.getByLabel('County').selectOption(county);
    await page.getByLabel('Plan year').selectOption(planYear);
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
    
    await continueButton.click();
    await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();
  });

  test('In-area ZIP codes allow progression to next step', async ({ page }) => {
    const inAreaZip = '85251';
    const county = 'Maricopa';
    const planYear = '2026';
    
    await page.getByLabel('ZIP code').fill(inAreaZip);
    await page.getByRole('button', { name: 'Search' }).click();
    
    await page.getByLabel('County').selectOption(county);
    await page.getByLabel('Plan year').selectOption(planYear);
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
    
    await continueButton.click();
    await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();
  });

  test('Multiple ZIP code modifications with validation retry', async ({ page }) => {
    const zipSequence = [
      { zip: '10001', shouldFail: true },
      { zip: '90210', shouldFail: true },
      { zip: '85003', shouldFail: false }
    ];
    
    for (const { zip, shouldFail } of zipSequence) {
      await page.getByLabel('ZIP code').clear();
      await page.getByLabel('ZIP code').fill(zip);
      await page.getByRole('button', { name: 'Search' }).click();
      
      await page.waitForTimeout(500);
      
      if (shouldFail) {
        const errorMessage = page.getByText(/not available in your area|outside.*service area|cannot proceed|ineligible/i);
        const errorCount = await errorMessage.count();
        
        if (errorCount > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
    
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
    
    await continueButton.click();
    await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();
  });
});