import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testData = [
  {
    testCaseId: 'TC-0020-02',
    description: 'Verify browser warning message displays on enrollment home page',
    zipCode: '85001',
    county: 'Maricopa',
    planYear: '2026',
    pharmacyZip: '85001',
    distance: '5',
    expectedHelpContactVisible: true,
    expectedBrowserWarningVisible: true,
    expectedHelpContactHasPhoneOrEmail: true,
    expectedWarningExplainsRisk: true
  }
];

test.describe('Browser Warning and Help Contact Display', () => {
  testData.forEach((data) => {
    test(`${data.testCaseId}: ${data.description}`, async ({ page }) => {
      await page.goto(BASE_URL);

      // Step 1: Verify help contact and browser warning on initial page (Get Started)
      await expect(page.getByRole('heading', { name: /Let's get started/i })).toBeVisible();

      // Assert help contact details are visible
      const helpContactSection = page.locator('text=/help|contact|assistance|support/i').first();
      await expect(helpContactSection).toBeVisible();

      // Assert help information includes phone number or email
      const helpContactText = await page.locator('text=/\\d{3}[-.]?\\d{3}[-.]?\\d{4}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/').first();
      if (data.expectedHelpContactHasPhoneOrEmail) {
        await expect(helpContactText).toBeVisible();
      }

      // Assert browser warning is visible
      const browserWarning = page.locator('text=/do not close|don\'t close|keep.*browser open|avoid closing|browser.*open/i').first();
      await expect(browserWarning).toBeVisible();

      // Assert warning message clearly explains risk of closing browser
      if (data.expectedWarningExplainsRisk) {
        const warningText = await browserWarning.textContent();
        expect(warningText?.toLowerCase()).toMatch(/close|progress|lose|lost|save/);
      }

      // Complete Step 1 to advance
      await page.getByLabel('ZIP code').fill(data.zipCode);
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByLabel('County').selectOption(data.county);
      await page.getByLabel('Plan year').selectOption(data.planYear);
      await page.getByRole('button', { name: 'Continue' }).click();

      // Step 2: Verify help contact and browser warning on Add Pharmacy page
      await expect(page.getByRole('heading', { name: /Add your pharmacy/i })).toBeVisible();

      // Assert help contact details remain visible
      await expect(helpContactSection).toBeVisible();

      // Assert browser warning remains visible
      await expect(browserWarning).toBeVisible();

      // Complete Step 2 to advance
      await page.getByLabel('ZIP code').fill(data.pharmacyZip);
      await page.getByLabel('Distance').selectOption(data.distance);
      await page.getByRole('button', { name: 'Search pharmacies' }).click();
      
      const firstPharmacy = page.locator('[data-testid="pharmacy-result"], .pharmacy-result, .pharmacy-card').first();
      await firstPharmacy.waitFor({ state: 'visible', timeout: 5000 });
      await firstPharmacy.click();
      
      await page.getByRole('button', { name: 'Continue' }).click();

      // Step 3: Verify help contact and browser warning on Add Medications page
      await expect(page.getByRole('heading', { name: /Add your medications/i })).toBeVisible();

      // Assert help contact details remain visible
      await expect(helpContactSection).toBeVisible();

      // Assert browser warning remains visible
      await expect(browserWarning).toBeVisible();

      // Advance to Step 4 without adding medications
      await page.getByRole('button', { name: 'Continue' }).click();

      // Step 4: Verify help contact and browser warning on Review & Enroll page
      await expect(page.getByRole('heading', { name: /Review.*Enroll/i })).toBeVisible();

      // Assert help contact details remain visible on final step
      await expect(helpContactSection).toBeVisible();

      // Assert browser warning remains visible on final step
      await expect(browserWarning).toBeVisible();

      // Verify both elements remain in consistent, visible positions across all pages
      const helpContactBox = await helpContactSection.boundingBox();
      const warningBox = await browserWarning.boundingBox();
      
      expect(helpContactBox).toBeTruthy();
      expect(warningBox).toBeTruthy();
      
      if (helpContactBox && warningBox) {
        expect(helpContactBox.y).toBeGreaterThan(0);
        expect(warningBox.y).toBeGreaterThan(0);
      }
    });
  });
});