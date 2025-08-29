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
    this.selectedSeatsFloatingButton = page.locator('[role="button"][aria-label*="seats selected, tap to view details"]');
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
    // Look for available seat elements (not disabled and not already selected)
    const availableSeats = this.page.locator('use[role="button"]:not([aria-disabled="true"])[aria-pressed="false"]');
    const firstSeat = availableSeats.first();
    
    // Get the aria-label to identify this specific seat later
    const seatLabel = await firstSeat.getAttribute('aria-label');
    
    await expect(firstSeat).toBeVisible();
    await firstSeat.click();
    
    // Wait for this specific seat to be visually selected
    const selectedSeat = this.page.locator(`use[aria-label="${seatLabel}"]`);
    await expect(selectedSeat).toHaveAttribute('aria-pressed', 'true');
  }

  async selectMultipleSeats(count: number) {
    for (let i = 0; i < count; i++) {
      // Re-query available seats each time since the list changes after each selection
      const availableSeats = this.page.locator('use[role="button"]:not([aria-disabled="true"])[aria-pressed="false"]');
      const seat = availableSeats.first();
      
      // Get the aria-label to identify this specific seat later
      const seatLabel = await seat.getAttribute('aria-label');
      
      await expect(seat).toBeVisible();
      await seat.click();
      
      // Wait for this specific seat to be visually selected
      const selectedSeat = this.page.locator(`use[aria-label="${seatLabel}"]`);
      await expect(selectedSeat).toHaveAttribute('aria-pressed', 'true');
    }
  }

  async getSelectedSeatCount(): Promise<number> {
    // Check if summary is visible first - if not, return 0
    if (!(await this.selectedSeatsSummary.isVisible())) {
      return 0;
    }
    
    // Extract number from text like "Selected Seats (3/8)"
    const countText = await this.seatCountDisplay.textContent();
    const match = countText?.match(/\((\d+)\/\d+\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getTotalPrice(): Promise<number> {
    // Extract number from text like "Total: $450"
    const priceText = await this.totalPriceText.textContent();
    const match = priceText?.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async isSeatSelected(sectionId: string, row: number, seatCol: number): Promise<boolean> {
    const seat = this.page.locator(`use[aria-label="Seat ${seatCol} in row ${row} of section ${sectionId}"]`);
    const isPressed = await seat.getAttribute('aria-pressed');
    return isPressed === 'true';
  }

  async waitForSeatSelection(expectedCount: number) {
    if (expectedCount === 0) {
      // When no seats selected, the summary component should not be visible on any device
      await expect(this.selectedSeatsSummary).not.toBeVisible();
    } else {
      // First, wait for seats to be selected and UI to update
      await this.page.waitForTimeout(500);
      
      // Check if we're on mobile by checking viewport width 
      const viewportSize = this.page.viewportSize();
      const isMobile = viewportSize && viewportSize.width < 600;
      
      if (isMobile) {
        // On mobile, look for the floating button using aria-label
        const floatingButton = this.page.locator(`button[aria-label="${expectedCount} seats selected, tap to view details"]`);
        await expect(floatingButton).toBeVisible();
      } else {
        // On desktop, expect summary to be visible with correct count
        await expect(this.selectedSeatsSummary).toBeVisible();
        await expect(this.seatCountDisplay).toContainText(`(${expectedCount}/8)`);
      }
    }
  }

  async clearAllSelections() {
    // Check if we're on mobile by checking viewport width 
    const viewportSize = this.page.viewportSize();
    const isMobile = viewportSize && viewportSize.width < 600;
    
    if (isMobile) {
      // On mobile, need to open the modal first
      const floatingButton = this.page.locator('button[aria-label*="seats selected, tap to view details"]');
      await floatingButton.click();
      
      // Wait for modal to open and find Clear All button inside
      await expect(this.selectedSeatsModal).toBeVisible();
      const modalClearButton = this.selectedSeatsModal.locator('button', { hasText: 'Clear All' });
      await modalClearButton.click();
      
      // Wait for modal to close
      await expect(this.selectedSeatsModal).not.toBeVisible();
    } else {
      // On desktop, clear button is directly accessible
      await this.clearAllButton.click();
    }
    
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
