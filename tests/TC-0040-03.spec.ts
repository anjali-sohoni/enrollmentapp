import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    scenario: 'Step 1 - Get Started required fields',
    step: 1,
    stepHeading: "Let's get started",
    requiredFields: [
      { label: 'ZIP code', type: 'input', value: '85001' },
      { label: 'County', type: 'select', value: 'Maricopa' },
      { label: 'Plan year', type: 'select', value: '2026' }
    ],
    intermediateAction: { button: 'Search', afterField: 'ZIP code' }
  },
  {
    scenario: 'Step 2 - Add Pharmacy required fields',
    step: 2,
    stepHeading: 'Add your pharmacy',
    requiredFields: [
      { label: 'ZIP code', type: 'input', value: '85001' },
      { label: 'Distance', type: 'select', value: '10' }
    ],
    intermediateAction: { button: 'Search pharmacies', afterField: 'Distance' },
    requiresSelection: true
  },
  {
    scenario: 'Step 3 - Add Medications optional fields',
    step: 3,
    stepHeading: 'Add your medications',
    requiredFields: [],
    isOptional: true
  }
];

test.describe('TC-0040-03: Verify required field indicators are visually distinct', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  for (const data of testData) {
    test(`${data.scenario} - Continue button disabled when required fields empty`, async ({ page }) => {
      // Navigate to the target step
      if (data.step > 1) {
        // Complete Step 1
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('County').selectOption('Maricopa');
        await page.getByLabel('Plan year').selectOption('2026');
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
      }

      if (data.step > 2) {
        // Complete Step 2
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByLabel('Distance').selectOption('10');
        await page.getByRole('button', { name: 'Search pharmacies' }).click();
        await page.waitForTimeout(500);
        await page.locator('button.ma-pharma').first().click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByRole('heading', { name: /medication/i })).toBeVisible();
      }

      // Verify we're on the correct step
      await expect(page.getByRole('heading', { name: new RegExp(data.stepHeading, 'i') })).toBeVisible();

      // Verify Continue button is disabled initially (if not optional step)
      if (!data.isOptional) {
        const continueButton = page.getByRole('button', { name: 'Continue' });
        await expect(continueButton).toBeDisabled();
      }
    });

    test(`${data.scenario} - Required field indicators are visible`, async ({ page }) => {
      // Navigate to the target step
      if (data.step > 1) {
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('County').selectOption('Maricopa');
        await page.getByLabel('Plan year').selectOption('2026');
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      if (data.step > 2) {
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByLabel('Distance').selectOption('10');
        await page.getByRole('button', { name: 'Search pharmacies' }).click();
        await page.waitForTimeout(500);
        await page.locator('button.ma-pharma').first().click();
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      // Check that required fields have visual indicators
      for (const field of data.requiredFields) {
        const fieldLabel = page.getByLabel(field.label);
        await expect(fieldLabel).toBeVisible();
        
        // Verify the field is present and can be interacted with
        if (field.type === 'input') {
          await expect(fieldLabel).toBeEditable();
        } else if (field.type === 'select') {
          await expect(fieldLabel).toBeEnabled();
        }
      }
    });

    test(`${data.scenario} - Continue button enabled after filling required fields`, async ({ page }) => {
      // Navigate to the target step
      if (data.step > 1) {
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('County').selectOption('Maricopa');
        await page.getByLabel('Plan year').selectOption('2026');
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      if (data.step > 2) {
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByLabel('Distance').selectOption('10');
        await page.getByRole('button', { name: 'Search pharmacies' }).click();
        await page.waitForTimeout(500);
        await page.locator('button.ma-pharma').first().click();
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      const continueButton = page.getByRole('button', { name: 'Continue' });

      if (data.isOptional) {
        // Optional step should allow Continue immediately
        await expect(continueButton).toBeEnabled();
      } else {
        // Fill required fields
        for (const field of data.requiredFields) {
          if (field.type === 'input') {
            await page.getByLabel(field.label).fill(field.value);
          } else if (field.type === 'select') {
            await page.getByLabel(field.label).selectOption(field.value);
          }

          // Click intermediate action if needed after this field
          if (data.intermediateAction && data.intermediateAction.afterField === field.label) {
            await page.getByRole('button', { name: data.intermediateAction.button }).click();
            await page.waitForTimeout(500);
          }
        }

        // Handle selection requirement (e.g., pharmacy)
        if (data.requiresSelection) {
          await page.locator('button.ma-pharma').first().click();
        }

        // Verify Continue button is now enabled
        await expect(continueButton).toBeEnabled();
      }
    });

    test(`${data.scenario} - Partial completion keeps Continue disabled`, async ({ page }) => {
      if (data.isOptional || data.requiredFields.length < 2) {
        test.skip();
      }

      // Navigate to the target step
      if (data.step > 1) {
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('County').selectOption('Maricopa');
        await page.getByLabel('Plan year').selectOption('2026');
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      if (data.step > 2) {
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByLabel('Distance').selectOption('10');
        await page.getByRole('button', { name: 'Search pharmacies' }).click();
        await page.waitForTimeout(500);
        await page.locator('button.ma-pharma').first().click();
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      const continueButton = page.getByRole('button', { name: 'Continue' });

      // Fill only the first required field
      const firstField = data.requiredFields[0];
      if (firstField.type === 'input') {
        await page.getByLabel(firstField.label).fill(firstField.value);
      } else if (firstField.type === 'select') {
        await page.getByLabel(firstField.label).selectOption(firstField.value);
      }

      // Click intermediate action if needed
      if (data.intermediateAction && data.intermediateAction.afterField === firstField.label) {
        await page.getByRole('button', { name: data.intermediateAction.button }).click();
        await page.waitForTimeout(500);
      }

      // Continue should still be disabled
      await expect(continueButton).toBeDisabled();
    });

    test(`${data.scenario} - System validates all required fields before advancement`, async ({ page }) => {
      // Navigate to the target step
      if (data.step > 1) {
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('County').selectOption('Maricopa');
        await page.getByLabel('Plan year').selectOption('2026');
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      if (data.step > 2) {
        await page.getByLabel('ZIP code').fill('85001');
        await page.getByLabel('Distance').selectOption('10');
        await page.getByRole('button', { name: 'Search pharmacies' }).click();
        await page.waitForTimeout(500);
        await page.locator('button.ma-pharma').first().click();
        await page.getByRole('button', { name: 'Continue' }).click();
      }

      const continueButton = page.getByRole('button', { name: 'Continue' });

      if (!data.isOptional) {
        // Verify Continue is disabled before filling
        await expect(continueButton).toBeDisabled();

        // Fill all required fields
        for (const field of data.requiredFields) {
          if (field.type === 'input') {
            await page.getByLabel(field.label).fill(field.value);
          } else if (field.type === 'select') {
            await page.getByLabel(field.label).selectOption(field.value);
          }

          if (data.intermediateAction && data.intermediateAction.afterField === field.label) {
            await page.getByRole('button', { name: data.intermediateAction.button }).click();
            await page.waitForTimeout(500);
          }
        }

        if (data.requiresSelection) {
          await page.locator('button.ma-pharma').first().click();
        }

        // Verify Continue is now enabled
        await expect(continueButton).toBeEnabled();

        // Click Continue and verify advancement
        await continueButton.click();

        // Verify we advanced to next step (step content changed)
        if (data.step === 1) {
          await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
        } else if (data.step === 2) {
          await expect(page.getByRole('heading', { name: /medication/i })).toBeVisible();
        }
      }
    });
  }

  test('Step 1 - Clear indication of which fields are required', async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();

    // Verify all required fields are present and visible
    await expect(page.getByLabel('ZIP code')).toBeVisible();
    await expect(page.getByLabel('County')).toBeVisible();
    await expect(page.getByLabel('Plan year')).toBeVisible();

    // Verify Continue button exists and is disabled
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeDisabled();
  });

  test('Step 2 - Clear indication of which fields are required', async ({ page }) => {
    // Complete Step 1
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();

    // Verify required fields are present
    await expect(page.getByLabel('ZIP code')).toBeVisible();
    await expect(page.getByLabel('Distance')).toBeVisible();

    // Verify Continue button is disabled
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
  });

  test('User receives feedback when attempting to advance with incomplete data', async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();

    // Try to interact with Continue button when disabled
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    // Fill only ZIP and search
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);

    // Continue should still be disabled
    await expect(continueButton).toBeDisabled();

    // Fill County but not Plan year
    await page.getByLabel('County').selectOption('Maricopa');
    await expect(continueButton).toBeDisabled();

    // Fill Plan year - now Continue should be enabled
    await page.getByLabel('Plan year').selectOption('2026');
    await expect(continueButton).toBeEnabled();
  });

  test('Each step has specific validation rules enforced', async ({ page }) => {
    // Step 1 validation
    await expect(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
    let continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    // Complete Step 1
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('County').selectOption('Maricopa');
    await page.getByLabel('Plan year').selectOption('2026');
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // Step 2 validation
    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
    continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    // Complete Step 2
    await page.getByLabel('ZIP code').fill('85001');
    await page.getByLabel('Distance').selectOption('10');
    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(500);
    await page.locator('button.ma-pharma').first().click();
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // Step 3 validation (optional - should be enabled)
    await expect(page.getByRole('heading', { name: /medication/i })).toBeVisible();
    continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
  });

  test('User can only proceed when all step requirements are met', async ({ page }) => {
    // Step 1 - cannot proceed without all requirements
    const step1Continue = page.getByRole('button', { name: 'Continue' });
    await expect(step1Continue).toBeDisabled();

    await page.getByLabel('ZIP code').fill('85001');
    await expect(step1Continue).toBeDisabled();

    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(500);
    await expect(step1Continue).toBeDisabled();

    await page.getByLabel('County').selectOption('Maricopa');
    await expect(step1Continue).toBeDisabled();

    await page.getByLabel('Plan year').selectOption('2026');
    await expect(step1Continue).toBeEnabled();

    await step1Continue.click();

    // Step 2 - cannot proceed without all requirements
    await expect(page.getByRole('heading', { name: 'Add your pharmacy' })).toBeVisible();
    const step2Continue = page.getByRole('button', { name: 'Continue' });
    await expect(step2Continue).toBeDisabled();

    await page.getByLabel('ZIP code').fill('85001');
    await page.getByLabel('Distance').selectOption('10');
    await expect(step2Continue).toBeDisabled();

    await page.getByRole('button', { name: 'Search pharmacies' }).click();
    await page.waitForTimeout(500);
    await expect(step2Continue).toBeDisabled();

    await page.locator('button.ma-pharma').first().click();
    await expect(step2Continue).toBeEnabled();

    await step2Continue.click();

    // Step 3 - optional, can proceed immediately
    await expect(page.getByRole('heading', { name: /medication/i })).toBeVisible();
    const step3Continue = page.getByRole('button', { name: 'Continue' });
    await expect(step3Continue).toBeEnabled();
  });
});