/**
 * Local storage adapter for seat selection persistence
 * Provides a clean interface for seat selection storage operations
 */

interface StorageAdapter {
  save: (venueId: string, seatIds: string[]) => Promise<void>;
  load: (venueId: string) => Promise<string[]>;
  remove: (venueId: string) => Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  private getKey(venueId: string): string {
    return `venue-seats-${venueId}`;
  }

  async save(venueId: string, seatIds: string[]): Promise<void> {
    try {
      const key = this.getKey(venueId);
      if (seatIds.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(seatIds));
      }
    } catch (error) {
      console.warn('Failed to save seats to localStorage:', error);
      throw new Error('Storage operation failed');
    }
  }

  async load(venueId: string): Promise<string[]> {
    try {
      const key = this.getKey(venueId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load seats from localStorage:', error);
      // Clear corrupted data
      await this.remove(venueId);
      return [];
    }
  }

  async remove(venueId: string): Promise<void> {
    try {
      const key = this.getKey(venueId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove seats from localStorage:', error);
    }
  }
}

// Export singleton instance
export const storageAdapter = new LocalStorageAdapter();

// For testing or custom implementations
export { LocalStorageAdapter };
export type { StorageAdapter };