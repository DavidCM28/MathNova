// MathNova client-side API service

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SyncPayload {
  queue: any[];
  studentName: string;
}

export const apiService = {
  /**
   * Check connection status of the backend API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Sync offline logs to backend PostgreSQL database
   */
  async syncOfflineData(payload: SyncPayload): Promise<{ success: boolean; syncedCount: number }> {
    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Sync request failed');
    }

    return response.json();
  },

  /**
   * Fetch current lessons from the server
   */
  async getLessons(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/lessons`);
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    return response.json();
  }
};

export default apiService;
