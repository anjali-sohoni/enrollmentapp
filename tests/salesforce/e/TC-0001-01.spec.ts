import { test, expect } from '@playwright/test';

const testData = [
  {
    testId: 'TC-0001-01-valid-zip',
    description: 'Valid five-digit ZIP code triggers location resolution',
    zipCode: '85001',
    expectedCity: 'Phoenix',
    expectedState: 'AZ',
    shouldResolve: true,
    shouldEnableSearch: true
  },
  {
    testId: 'TC-0001-01-valid-zip-alternate',
    description: 'Valid alternate ZIP code triggers location resolution',
    zipCode: '85251',
    expectedCity: 'Scottsdale',
    expectedState: 'AZ',
    shouldResolve: true,
    shouldEnableSearch: true
  },
  {
    testId: 'TC-0001-01-invalid-format-short',
    description: 'Four-digit ZIP code does not enable search',
    zipCode: '8500',
    shouldResolve: false,
    shouldEnableSearch: false
  },
  {
    testId: 'TC-0001-01-invalid-format-long',
    description: 'Six-digit ZIP code does not enable search',
    zipCode: '850011',
    shouldResolve: false,
    shouldEnableSearch: false
  },
  {
    testId: 'TC-0001-01-invalid-format-alpha',
    description: 'ZIP code with letters does not enable search',
    zipCode: '8500A',
    shouldResolve: false,
    shouldEnableSearch: false
  },
  {
    testId: 'TC-0001-01-unknown-zip',
    description: 'Unknown valid-format ZIP code shows error',
    zipCode: '00000',
    shouldResolve: false,
    shouldEnableSearch: true,
    expectError: true
  }
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('TC-0001-01: Enter valid five-digit ZIP code and trigger location resolution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
  });

  for (const data of testData) {
    test(`${data.testId}: ${data.description}`, async ({ page }) => {
      const zipInput = page.getByLabel('ZIP code');
      const searchButton = page.getByRole('button', { name: 'Search' });

      await zipInput.fill(data.zipCode);

      if (data.shouldEnableSearch && data.zipCode.length === 5 && /^\d{5}$/.test(data.zipCode)) {
        await expect(searchButton).toBeEnabled();
      } else {
        if (data.zipCode.length !== 5 || !/^\d{5}$/.test(data.zipCode)) {
          await expect(searchButton).toBeDisabled();
        }
      }

      if (data.shouldResolve) {
        await searchButton.click();

        await expect(page.locator('text=' + data.expectedCity)).toBeVisible();
        await expect(page.locator('text=' + data.expectedState)).toBeVisible();

        const countyDropdown = page.getByLabel('County');
        await expect(countyDropdown).toBeVisible();
        await expect(countyDropdown).toBeEnabled();

        const planYearDropdown = page.getByLabel('Plan year');
        await expect(planYearDropdown).toBeVisible();
        await expect(planYearDropdown).toBeEnabled();
      } else if (data.expectError) {
        await searchButton.click();

        await expect(page.locator('text=/error|invalid|not found/i')).toBeVisible();

        const countyDropdown = page.getByLabel('County');
        await expect(countyDropdown).toBeDisabled();
      }
    });
  }

  test('TC-0001-01-complete-flow: Complete ZIP resolution and advance to next step', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });

    await zipInput.fill('85001');
    await expect(searchButton).toBeEnabled();

    await searchButton.click();

    await expect(page.locator('text=Phoenix')).toBeVisible();
    await expect(page.locator('text=AZ')).toBeVisible();

    const countyDropdown = page.getByLabel('County');
    await expect(countyDropdown).toBeEnabled();
    await countyDropdown.selectOption({ index: 1 });

    const planYearDropdown = page.getByLabel('Plan year');
    await expect(planYearDropdown).toBeEnabled();
    await planYearDropdown.selectOption({ index: 1 });

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
  });

  test('TC-0001-01-search-disabled-initially: Search button disabled before five digits entered', async ({ page }) => {
    const searchButton = page.getByRole('button', { name: 'Search' });
    await expect(searchButton).toBeDisabled();

    const zipInput = page.getByLabel('ZIP code');
    
    await zipInput.fill('8');
    await expect(searchButton).toBeDisabled();

    await zipInput.fill('85');
    await expect(searchButton).toBeDisabled();

    await zipInput.fill('850');
    await expect(searchButton).toBeDisabled();

    await zipInput.fill('8500');
    await expect(searchButton).toBeDisabled();

    await zipInput.fill('85001');
    await expect(searchButton).toBeEnabled();
  });

  test('TC-0001-01-continue-disabled-without-resolution: Continue button disabled until ZIP resolved and selections made', async ({ page }) => {
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    const zipInput = page.getByLabel('ZIP code');
    await zipInput.fill('85001');
    await expect(continueButton).toBeDisabled();

    const searchButton = page.getByRole('button', { name: 'Search' });
    await searchButton.click();

    await expect(page.locator('text=Phoenix')).toBeVisible();
    await expect(continueButton).toBeDisabled();

    const countyDropdown = page.getByLabel('County');
    await countyDropdown.selectOption({ index: 1 });
    await expect(continueButton).toBeDisabled();

    const planYearDropdown = page.getByLabel('Plan year');
    await planYearDropdown.selectOption({ index: 1 });
    await expect(continueButton).toBeEnabled();
  });

  test('TC-0001-01-format-validation: System validates ZIP code format before processing', async ({ page }) => {
    const zipInput = page.getByLabel('ZIP code');
    const searchButton = page.getByRole('button', { name: 'Search' });

    await zipInput.fill('ABCDE');
    await expect(searchButton).toBeDisabled();

    await zipInput.clear();
    await zipInput.fill('123');
    await expect(searchButton).toBeDisabled();

    await zipInput.clear();
    await zipInput.fill('12345678');
    await expect(searchButton).toBeDisabled();

    await zipInput.clear();
    await zipInput.fill('12-345');
    await expect(searchButton).toBeDisabled();

    await zipInput.clear();
    await zipInput.fill('85001');
    await expect(searchButton).toBeEnabled();
  });
});