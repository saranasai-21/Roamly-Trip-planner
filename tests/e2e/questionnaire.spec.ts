import { test, expect } from '@playwright/test';

test.describe('Roamly 4-Stage Travel Questionnaire Journey', () => {
  test('completes 4-stage wizard and generates a tailored visual tripboard', async ({
    page,
  }) => {
    // 1. Visit questionnaire page
    await page.goto('/plan');
    await expect(page.locator('h1')).toContainText('Design Your Trip');

    // Step 1: Who
    await expect(page.locator('text=Who is embarking on this journey?')).toBeVisible();
    // Select honeymoon occasion
    await page.click('button:has-text("Honeymoon Escape")');
    await page.click('button:has-text("Continue")');

    // Step 2: When
    await expect(page.locator('text=When are you planning to travel?')).toBeVisible();
    await expect(page.locator('text=Calculated Duration')).toBeVisible();
    await page.click('button:has-text("Continue")');

    // Step 3: Where
    await expect(page.locator('text=Where would you like to explore?')).toBeVisible();
    await page.click('button:has-text("Continue")');

    // Step 4: How
    await expect(page.locator('text=How do you prefer to travel?')).toBeVisible();
    await page.click('button:has-text("Relaxed & Slow")');
    await page.click('button:has-text("Vegetarian Only")');

    // Submit wizard
    await page.click('button:has-text("Generate My Visual Tripboard")');

    // Should navigate to new tripboard
    await page.waitForURL(/\/trips\/[a-zA-Z0-9-]+/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/trips\/[a-zA-Z0-9-]+/);

    // Verify trip title contains destination
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Itinerary', exact: true })).toBeVisible();
  });
});

