import { test, expect } from '@playwright/test';

const testData = [
  {
    scenario: 'Valid ZIP code proceeds to location resolution',
    zipCode: '85001',
    expectedCity: 'Phoenix',
    expectedCounty: 'Maricopa',
    shouldResolve: true,
    errorExpected: false
  },
  {
    scenario: 'Valid ZIP code 85003 resolves correctly',
    zipCode: '85003',
    expectedCity: 'Phoenix',
    expectedCounty: 'Maricopa',
    shouldResolve: true,
    errorExpected: false
  },
  {
    scenario: 'Valid ZIP code 85251 resolves correctly',
    zipCode: '85251',
    expectedCity: 'Scottsdale',
    expectedCounty: 'Maricopa',
    shouldResolve: true,
    errorExpected: false
  },
  {
    scenario: 'Valid ZIP code 89101 resolves correctly',
    zipCode: '89101',
    expectedCity: 'Las Vegas',
    expectedCounty: 'Clark',
    shouldResolve: true,
    errorExpected: false
  },
  {
    scenario: 'Invalid ZIP code format - less than 5 digits',
    zipCode: '1234',
    shouldResolve: false,
    errorExpected: true
  },
  {
    scenario: 'Invalid ZIP code format - more than 5 digits',
    zipCode: '123456',
    shouldResolve: false,
    errorExpected: true
  },
  {
    scenario: 'Invalid ZIP code format - non-numeric characters',
    zipCode: 'ABCDE',
    shouldResolve: false,
    errorExpected: true
  },
  {
    scenario: 'Unknown ZIP code not in service area',
    zipCode: '00000',
    shouldResolve: false,
    errorExpected: true
  }
];

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('TC-0001-01: Enter valid five-digit ZIP code and proceed to location resolution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await expect(page.getByText("Let's get started")).toBeVisible();
  });

  for (const data of testData) {
    test(data.scenario, async ({ page }) => {
      const zipCodeInput = page.getByLabel('ZIP code');
      await expect(zipCodeInput).toBeVisible();

      await zipCodeInput.fill(data.zipCode);

      await expect(zipCodeInput).toHaveValue(data.zipCode);

      const searchButton = page.getByRole('button', { name: 'Search' });
      await expect(searchButton).toBeVisible();
      await searchButton.click();

      if (data.errorExpected) {
        await expect(page.locator('text=/error|invalid|not found/i')).toBeVisible({ timeout: 5000 });
        
        const countyDropdown = page.locator('#county');
        const continueButton = page.getByRole('button', { name: 'Continue' });
        
        if (await countyDropdown.isVisible()) {
          await expect(continueButton).toBeDisabled();
        }
      } else if (data.shouldResolve) {
        const countyDropdown = page.locator('#county');
        await expect(countyDropdown).toBeVisible({ timeout: 5000 });
        
        if (data.expectedCounty) {
          await expect(page.getByText(data.expectedCounty)).toBeVisible();
        }
        
        await countyDropdown.selectOption({ label: data.expectedCounty });
        
        const planYearDropdown = page.locator('#year');
        await expect(planYearDropdown).toBeVisible();
        await planYearDropdown.selectOption({ index: 1 });
        
        const continueButton = page.getByRole('button', { name: 'Continue' });
        await expect(continueButton).toBeEnabled();
        
        await continueButton.click();
        
        await expect(page.getByText('Add your pharmacy')).toBeVisible({ timeout: 5000 });
      }
    });
  }

  test('User can enter exactly five numeric digits in the ZIP code field', async ({ page }) => {
    const zipCodeInput = page.getByLabel('ZIP code');
    
    await zipCodeInput.fill('85001');
    await expect(zipCodeInput).toHaveValue('85001');
    
    await zipCodeInput.fill('12345');
    await expect(zipCodeInput).toHaveValue('12345');
    
    await zipCodeInput.fill('99999');
    await expect(zipCodeInput).toHaveValue('99999');
  });

  test('Search button triggers ZIP code validation', async ({ page }) => {
    const zipCodeInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });
    
    await zipCodeInput.fill('85001');
    
    await expect(searchButton).toBeEnabled();
    
    await searchButton.click();
    
    await expect(page.locator('#county')).toBeVisible({ timeout: 5000 });
  });

  test('Invalid ZIP formats display an error message', async ({ page }) => {
    const zipCodeInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });
    
    const invalidZips = ['123', '12', 'ABCDE', '12-45', ''];
    
    for (const invalidZip of invalidZips) {
      await zipCodeInput.fill(invalidZip);
      
      if (invalidZip !== '') {
        await searchButton.click();
        await expect(page.locator('text=/error|invalid|not found/i')).toBeVisible({ timeout: 3000 });
      }
      
      await zipCodeInput.clear();
    }
  });

  test('Valid ZIP codes proceed to location resolution', async ({ page }) => {
    const validZips = [
      { zip: '85001', county: 'Maricopa' },
      { zip: '85003', county: 'Maricopa' },
      { zip: '85251', county: 'Maricopa' },
      { zip: '89101', county: 'Clark' }
    ];
    
    for (const { zip, county } of validZips) {
      await page.goto(baseURL);
      
      const zipCodeInput = page.getByLabel('ZIP code');
      await zipCodeInput.fill(zip);
      
      const searchButton = page.getByRole('button', { name: 'Search' });
      await searchButton.click();
      
      const countyDropdown = page.locator('#county');
      await expect(countyDropdown).toBeVisible({ timeout: 5000 });
      
      await expect(page.getByText(county)).toBeVisible();
      
      await countyDropdown.selectOption({ label: county });
      
      const selectedCounty = await countyDropdown.inputValue();
      expect(selectedCounty).toBeTruthy();
      
      const planYearDropdown = page.locator('#year');
      await planYearDropdown.selectOption({ index: 1 });
      
      const continueButton = page.getByRole('button', { name: 'Continue' });
      await expect(continueButton).toBeEnabled();
    }
  });

  test('Complete flow from ZIP entry to next step', async ({ page }) => {
    const zipCodeInput = page.getByLabel('ZIP code');
    await zipCodeInput.fill('85001');
    
    const searchButton = page.getByRole('button', { name: 'Search' });
    await searchButton.click();
    
    const countyDropdown = page.locator('#county');
    await expect(countyDropdown).toBeVisible({ timeout: 5000 });
    await countyDropdown.selectOption({ label: 'Maricopa' });
    
    const planYearDropdown = page.locator('#year');
    await expect(planYearDropdown).toBeVisible();
    await planYearDropdown.selectOption({ index: 1 });
    
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    
    await expect(page.getByText('Add your pharmacy')).toBeVisible({ timeout: 5000 });
  });
});