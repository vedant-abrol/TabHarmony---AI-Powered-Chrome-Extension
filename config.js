
class Config {
  static async getApiKey() {
    try {
      const result = await chrome.storage.sync.get(['apiKey']);
      return result.apiKey || null;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }

  static async setApiKey(apiKey) {
    try {
      await chrome.storage.sync.set({ apiKey });
      return true;
    } catch (error) {
      console.error('Error setting API key:', error);
      return false;
    }
  }
}

export default Config;
