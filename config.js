
class Config {
  static async getApiKey() {
    const result = await chrome.storage.sync.get(['openaiApiKey']);
    return result.openaiApiKey;
  }

  static async setApiKey(apiKey) {
    await chrome.storage.sync.set({ openaiApiKey: apiKey });
  }

  static async validateApiKey(apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Test" }],
          max_tokens: 5
        })
      });

      return response.status === 200;
    } catch (error) {
      console.error('API Key validation error:', error);
      return false;
    }
  }
}

export default Config;
