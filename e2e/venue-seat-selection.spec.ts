import { test, expect } from '@playwright/test';
import { VenuePage } from './pages/VenuePage';

test.describe('Venue Seat Selection - E2E Core Flows', () => {
  let venuePage: VenuePage;

  test.beforeEach(async ({ page }) => {
    venuePage = new VenuePage(page);
    await venuePage.goto();
    await venuePage.waitForVenueLoad();
  });

  test.describe('Scenario 1: Basic Seat Selection', () => {
    test('should load venue successfully with seating chart', async () => {
      // Verify venue loads properly
      await expect(venuePage.seatingChart).toBeVisible();
      await expect(venuePage.venueHeader).toBeVisible();
      
      // Verify initial state - no seats selected
      await expect(venuePage.selectedSeatsSummary).not.toBeVisible();
    });

    test('should select and deselect seats correctly', async () => {
      // Select first available seat
      await venuePage.selectFirstAvailableSeat();
      
      // Verify seat count updated
      await venuePage.waitForSeatSelection(1);
      
      // Select another seat
      await venuePage.selectFirstAvailableSeat();
      await venuePage.waitForSeatSelection(2);
      
      // Clear all selections
      await venuePage.clearAllSelections();
      
      // Verify no seats selected
      await expect(venuePage.selectedSeatsSummary).not.toBeVisible();
    });

    test('should show selected seats summary on desktop', async ({ page }) => {
      // Skip on mobile
      await page.setViewportSize({ width: 1024, height: 768 });
      
      // Select seats
      await venuePage.selectMultipleSeats(3);
      await venuePage.waitForSeatSelection(3);
      
      // Verify desktop summary is visible
      await venuePage.verifyDesktopSummaryVisible();
      await expect(venuePage.seatCountDisplay).toContainText('(3/8)');
      await expect(venuePage.clearAllButton).toBeVisible();
      await expect(venuePage.checkoutButton).toBeVisible();
    });
  });

  test.describe('Scenario 2: Seat Selection Limits', () => {
    test('should prevent selecting more than 8 seats', async () => {
      // Select maximum seats (8)
      await venuePage.selectMultipleSeats(8);
      await venuePage.waitForSeatSelection(8);
      
      // Verify at limit state
      await venuePage.verifyAtSelectionLimit();
      
      // Try to select one more seat - should be prevented
      const availableSeats = venuePage.page.locator('use[role="button"]:not([aria-disabled="true"])[aria-pressed="false"]');
      const ninthSeat = availableSeats.first();
      
      if (await ninthSeat.isVisible()) {
        await ninthSeat.click();
        // Should still be at 8 seats
        await expect(venuePage.seatCountDisplay).toContainText('(8/8)');
      }
    });

    test('should allow new selection after deselecting when at limit', async () => {
      // Select maximum seats
      await venuePage.selectMultipleSeats(8);
      await venuePage.waitForSeatSelection(8);
      
      // Find a selected seat and deselect it
      const selectedSeat = venuePage.page.locator('use[role="button"][aria-pressed="true"]').first();
      await selectedSeat.click();
      await venuePage.waitForSeatSelection(7);
      
      // Now should be able to select a new seat
      await venuePage.selectFirstAvailableSeat();
      await venuePage.waitForSeatSelection(8);
    });
  });

  test.describe('Scenario 3: Seat Status Validation', () => {
    test('should only allow selection of available seats', async () => {
      // Get counts of different seat types using data attributes
      const availableSeats = venuePage.page.locator('use[data-seat-status="available"]:not([aria-pressed="true"])');
      const reservedSeats = venuePage.page.locator('use[data-seat-status="reserved"]');
      const soldSeats = venuePage.page.locator('use[data-seat-status="sold"]');
      
      const availableCount = await availableSeats.count();
      const reservedCount = await reservedSeats.count();
      const soldCount = await soldSeats.count();
      
      console.log(`Available seats: ${availableCount}, Reserved seats: ${reservedCount}, Sold seats: ${soldCount}`);
      
      // Verify that reserved seats are properly disabled
      if (reservedCount > 0) {
        const firstReservedSeat = reservedSeats.first();
        await expect(firstReservedSeat).toHaveAttribute('aria-disabled', 'true');
        await expect(firstReservedSeat).toHaveAttribute('tabindex', '-1');
        await expect(firstReservedSeat).toHaveAttribute('aria-label', /reserved/);
      }
      
      // Verify that sold seats are properly disabled
      if (soldCount > 0) {
        const firstSoldSeat = soldSeats.first();
        await expect(firstSoldSeat).toHaveAttribute('aria-disabled', 'true');
        await expect(firstSoldSeat).toHaveAttribute('tabindex', '-1');
        await expect(firstSoldSeat).toHaveAttribute('aria-label', /sold/);
      }
      
      // Should be able to select available seats
      if (availableCount > 0) {
        await venuePage.selectFirstAvailableSeat();
        await venuePage.waitForSeatSelection(1);
        
        // Verify selected seat has correct attributes
        const selectedSeats = venuePage.page.locator('use[aria-pressed="true"]');
        const firstSelected = selectedSeats.first();
        await expect(firstSelected).toHaveAttribute('data-seat-status', 'available');
        await expect(firstSelected).toHaveAttribute('aria-disabled', 'false');
      }
      
      // Verify that we can select multiple available seats
      if (availableCount > 1) {
        await venuePage.selectFirstAvailableSeat();
        await venuePage.waitForSeatSelection(2);
      }
      
      // Final verification: ensure only available seats can be selected
      const finalSelectedSeats = venuePage.page.locator('use[aria-pressed="true"]');
      const finalSelectedCount = await finalSelectedSeats.count();
      
      // All selected seats should have status "available"
      for (let i = 0; i < finalSelectedCount; i++) {
        await expect(finalSelectedSeats.nth(i)).toHaveAttribute('data-seat-status', 'available');
      }
    });
  });

  test.describe('Scenario 6: Desktop Experience', () => {
    test('should show desktop summary with correct information', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Select multiple seats
      await venuePage.selectMultipleSeats(4);
      await venuePage.waitForSeatSelection(4);
      
      // Verify summary is visible and contains correct info
      await venuePage.verifyDesktopSummaryVisible();
      await expect(venuePage.seatCountDisplay).toContainText('(4/8)');
      
      // Verify action buttons are present
      await expect(venuePage.clearAllButton).toBeVisible();
      await expect(venuePage.checkoutButton).toBeVisible();
      
      // Verify total price is displayed
      await expect(venuePage.totalPriceText).toBeVisible();
      
      // Test clear functionality
      await venuePage.clearAllButton.click();
      await venuePage.waitForSeatSelection(0);
      await expect(venuePage.selectedSeatsSummary).not.toBeVisible();
    });
  });

  test.describe('Scenario 7: Mobile Experience', () => {
    test('should show floating button and modal on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      
      // Initially, floating button should not be visible (no selections)
      await expect(venuePage.selectedSeatsFloatingButton).not.toBeVisible();
      
      // Select seats
      await venuePage.selectMultipleSeats(3);
      await venuePage.waitForSeatSelection(3);
      
      // Floating button should now be visible
      await venuePage.verifyMobileFloatingButtonVisible();
      
      // Click floating button to open modal
      await venuePage.openMobileModal();
      
      // Verify modal content
      await expect(venuePage.selectedSeatsModal).toBeVisible();
      await expect(venuePage.page.locator('text=Selected Seats')).toBeVisible();
      await expect(venuePage.page.locator('text=3/8')).toBeVisible();
      
      // Verify checkout button in modal
      await expect(venuePage.checkoutButton).toBeVisible();
      
      // Close modal
      await venuePage.closeMobileModal();
    });
  });

  test.describe('Scenario 10: Price Tier Verification', () => {
    test('should display correct pricing for selected seats', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Select a few seats
      await venuePage.selectMultipleSeats(2);
      await venuePage.waitForSeatSelection(2);
      
      // Verify total price is displayed and reasonable
      const totalPrice = await venuePage.getTotalPrice();
      expect(totalPrice).toBeGreaterThan(0);
      expect(totalPrice).toBeLessThanOrEqual(1200); // Max would be 8 seats * $150
      
      // Add more seats and verify price increases
      await venuePage.selectMultipleSeats(2);
      await venuePage.waitForSeatSelection(4);
      
      const newTotalPrice = await venuePage.getTotalPrice();
      expect(newTotalPrice).toBeGreaterThan(totalPrice);
    });
  });

  test.describe('Scenario 17: Complete User Journey', () => {
    test('should complete full user workflow', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // 1. Load venue
      await expect(venuePage.seatingChart).toBeVisible();
      
      // 2. Select multiple seats
      await venuePage.selectMultipleSeats(3);
      await venuePage.waitForSeatSelection(3);
      
      // 3. Verify selection in summary
      await venuePage.verifyDesktopSummaryVisible();
      await expect(venuePage.seatCountDisplay).toContainText('(3/8)');
      
      // 4. Add more seats
      await venuePage.selectMultipleSeats(2);
      await venuePage.waitForSeatSelection(5);
      
      // 5. Clear all selections
      await venuePage.clearAllSelections();
      
      // 6. Reselect different seats
      await venuePage.selectMultipleSeats(4);
      await venuePage.waitForSeatSelection(4);
      
      // 7. Verify final state
      await expect(venuePage.seatCountDisplay).toContainText('(4/8)');
      await expect(venuePage.checkoutButton).toBeVisible();
      
      // 8. Verify can proceed to checkout (button is clickable)
      await expect(venuePage.checkoutButton).toBeEnabled();
    });
  });
});
