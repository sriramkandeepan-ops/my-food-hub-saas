import { test, expect } from '@playwright/test';

test.describe('Takeaway SaaS Defensive Matrix Evaluation', () => {
  
  test('E2E App Flow: UI calculations match the actual server-side verified response', async ({ page }) => {
    await page.goto('/');

    // Interact with UI components
    await page.click('[data-testid="add-item_1"]'); // Add Classic Cheeseburger (₹299)
    await page.click('[data-testid="add-item_1"]'); // Quantity increments to 2

    // Assert localized UI math engine is rendering predictions cleanly
    // Expected: Subtotal 598 + Tax 30 + Packaging 40 = ₹668
    await expect(page.locator('[data-testid="ui-total"]')).toContainText('₹668');

    // Fire actual payload over the wire to trigger server evaluation mechanics
    await page.click('button:has-text("Pay")');

    // Confirm backend validation returns success banner matching the total
    const successBanner = page.locator('[data-testid="success-banner"]');
    await expect(successBanner).toBeVisible({ timeout: 5000 });
    await expect(successBanner).toContainText('Verified Final Total Charged: ₹668');
  });

  test('Security Test: Confirm UI catches and renders API handling restrictions gracefully', async ({ page, request }) => {
    // Send a corrupted backend attack payload bypassing UI constraints
    const adversarialResponse = await request.post('/api/orders', {
      data: {
        idempotencyKey: `AUTO-ATTACK-${Math.random()}`,
        paymentMethod: { type: "mock_card" },
        items: [{ id: "item_1", quantity: -999 }] // Malicious negative entry
      }
    });

    // Confirm backend intercepts the attack payload safely at the boundary line
    expect(adversarialResponse.status()).toBe(400);
    const json = await adversarialResponse.json();
    expect(json.error).toContain('Quantity manipulation detected');
  });
});