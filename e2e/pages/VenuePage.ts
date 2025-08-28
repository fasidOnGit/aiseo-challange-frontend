import { Page, Locator, expect } from '@playwright/test';

export class VenuePage {
  readonly page: Page;
  readonly venueHeader: Locator;
  readonly seatingChart: Locator;
  readonly selectedSeatsSummary: Locator;
  readonly selectedSeatsFloatingButton: Locator;
  readonly selectedSeatsModal: Locator;
  readonly clearAllButton: Locator;
  readonly checkoutButton: Locator;
  readonly totalPriceText: Locator;
  readonly seatCountDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main components
    this.venueHeader = page.locator('[role="banner"]').first();
    this.seatingChart = page.locator('[role="img"][aria-label*="Interactive venue seating chart"]');
    this.selectedSeatsSummary = page.locator('[role="region"][aria-label="Selected seats summary"]');
    this.selectedSeatsFloatingButton = page.locator('[role="button"][aria-label*="seats selected"]');
    this.selectedSeatsModal = page.locator('[role="dialog"]');
    
    // Action buttons
    this.clearAllButton = page.locator('button', { hasText: 'Clear All' });
    this.checkoutButton = page.locator('button', { hasText: 'Continue to Checkout' });
    
    // Text displays
    this.totalPriceText = page.locator('text=/Total: \\$\\d+/');
    this.seatCountDisplay = page.locator('text=/Selected Seats \\(\\d+\\/8\\)/');
  }

  async goto() {
    await this.page.goto('/');
    // Wait for venue to load
    await expect(this.seatingChart).toBeVisible({ timeout: 10000 });
  }

  async selectSeatByAriaLabel(sectionId: string, row: number, seatCol: number) {
    // Find seat by aria-label since seats don't have data attributes
    const seatElement = this.page.locator(`use[aria-label="Seat ${seatCol} in row ${row} of section ${sectionId}"]`);
    await expect(seatElement).toBeVisible();
    await seatElement.click();
  }

  async selectFirstAvailableSeat() {
    // Look for available seats (not aria-disabled and aria-pressed false)
    const availableSeats = this.page.locator('use[role="button"]:not([aria-disabled="true"])[aria-pressed="false"]');
    await expect(availableSeats.first()).toBeVisible();
    await availableSeats.first().click();
  }

  async selectMultipleSeats(count: number) {
    const availableSeats = this.page.locator('use[role="button"]:not([aria-disabled="true"])[aria-pressed="false"]');
    
    for (let i = 0; i < count; i++) {
      const seat = availableSeats.nth(i);
      await expect(seat).toBeVisible();
      await seat.click();
      // Small delay to allow state updates
      await this.page.waitForTimeout(200);
    }
  }

  async getSelectedSeatCount(): Promise<number> {
    // Extract number from text like "Selected Seats (3/8)"
    const countText = await this.seatCountDisplay.textContent();
    const match = countText?.match(/\((\d+)\/\d+\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getTotalPrice(): Promise<number> {
    // Extract number from text like "Total: $450"
    const priceText = await this.totalPriceText.textContent();
    const match = priceText?.match(/\\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async isSeatSelected(sectionId: string, row: number, seatCol: number): Promise<boolean> {
    const seat = this.page.locator(`use[aria-label="Seat ${seatCol} in row ${row} of section ${sectionId}"]`);
    const isPressed = await seat.getAttribute('aria-pressed');
    return isPressed === 'true';
  }

  async waitForSeatSelection(expectedCount: number) {
    await expect(this.seatCountDisplay).toContainText(`(${expectedCount}/8)`);
  }

  async clearAllSelections() {
    await this.clearAllButton.click();
    await this.waitForSeatSelection(0);
  }

  async openMobileModal() {
    await expect(this.selectedSeatsFloatingButton).toBeVisible();
    await this.selectedSeatsFloatingButton.click();
    await expect(this.selectedSeatsModal).toBeVisible();
  }

  async closeMobileModal() {
    const closeButton = this.selectedSeatsModal.locator('button[aria-label*="Close"]');
    await closeButton.click();
    await expect(this.selectedSeatsModal).not.toBeVisible();
  }

  async verifyDesktopSummaryVisible() {
    await expect(this.selectedSeatsSummary).toBeVisible();
  }

  async verifyMobileFloatingButtonVisible() {
    await expect(this.selectedSeatsFloatingButton).toBeVisible();
  }

  async verifyAtSelectionLimit() {
    await expect(this.seatCountDisplay).toContainText('(8/8)');
    // Check for limit warning message
    await expect(this.page.locator('text=/Maximum 8 seats allowed/')).toBeVisible();
  }

  async verifySeatIsDisabled(sectionId: string, row: number, seatCol: number) {
    const seat = this.page.locator(`use[aria-label="Seat ${seatCol} in row ${row} of section ${sectionId}"]`);
    await expect(seat).toHaveAttribute('aria-disabled', 'true');
  }

  async verifySeatIsAvailable(sectionId: string, row: number, seatCol: number) {
    const seat = this.page.locator(`use[aria-label="Seat ${seatCol} in row ${row} of section ${sectionId}"]`);
    await expect(seat).not.toHaveAttribute('aria-disabled', 'true');
    await expect(seat).toHaveAttribute('aria-pressed', 'false');
  }

  async waitForVenueLoad() {
    // Wait for loading to complete
    await expect(this.page.locator('text=Loading Venue')).not.toBeVisible({ timeout: 15000 });
    await expect(this.seatingChart).toBeVisible();
  }
}
