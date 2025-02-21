
import Config from './config.js';

class TabHarmonyUI {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchButton = document.getElementById('searchButton');
    this.settingsButton = document.getElementById('settingsButton');
    this.organizeButton = document.getElementById('organizeButton');
    this.tabGroups = document.getElementById('tabGroups');
    this.settingsModal = document.getElementById('settingsModal');
    this.apiKeyInput = document.getElementById('apiKey');
    this.saveSettings = document.getElementById('saveSettings');
    this.closeSettings = document.getElementById('closeSettings');
    this.loadingSpinner = document.querySelector('.loading-spinner');
    this.buttonText = document.querySelector('.button-text');

    this.setupEventListeners();
    this.checkApiKey();
  }

  async setupEventListeners() {
    this.settingsButton.addEventListener('click', () => this.toggleSettings());
    this.closeSettings.addEventListener('click', () => this.toggleSettings());
    this.saveSettings.addEventListener('click', () => this.saveApiKey());
    this.organizeButton.addEventListener('click', () => this.organizeTabs());
    this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.searchButton.addEventListener('click', () => this.handleSearch(this.searchInput.value));
  }

  async checkApiKey() {
    const apiKey = await Config.getApiKey();
    if (!apiKey) {
      this.toggleSettings();
    }
  }

  toggleSettings() {
    this.settingsModal.classList.toggle('hidden');
  }

  async saveApiKey() {
    const apiKey = this.apiKeyInput.value.trim();
    if (!apiKey) {
      alert('Please enter an API key');
      return;
    }

    const isValid = await Config.validateApiKey(apiKey);
    if (!isValid) {
      alert('Invalid API key. Please check and try again.');
      return;
    }

    await Config.setApiKey(apiKey);
    this.toggleSettings();
  }

  setLoading(loading) {
    if (loading) {
      this.loadingSpinner.classList.remove('hidden');
      this.buttonText.textContent = 'Organizing...';
      this.organizeButton.disabled = true;
    } else {
      this.loadingSpinner.classList.add('hidden');
      this.buttonText.textContent = 'Organize Tabs';
      this.organizeButton.disabled = false;
    }
  }

  async organizeTabs() {
    try {
      this.setLoading(true);
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const groupedTabs = await this.analyzeAndGroupTabs(tabs);
      await this.displayTabGroups(groupedTabs);
    } catch (error) {
      console.error('Error organizing tabs:', error);
      alert('Error organizing tabs. Please check your API key and try again.');
    } finally {
      this.setLoading(false);
    }
  }

  async analyzeAndGroupTabs(tabs) {
    const apiKey = await Config.getApiKey();
    if (!apiKey) {
      throw new Error('API key not found');
    }

    const tabData = tabs.map(tab => ({
      title: tab.title,
      url: tab.url
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a tab organization assistant. Given a list of browser tabs, group them into logical categories."
          },
          {
            role: "user",
            content: `Please analyze and group these tabs into categories: ${JSON.stringify(tabData)}`
          }
        ]
      })
    });

    const data = await response.json();
    return this.parseAIResponse(data.choices[0].message.content, tabs);
  }

  parseAIResponse(response, tabs) {
    // This is a simplified implementation. In practice, you'd want to parse the AI's
    // response more robustly based on its actual format
    const groups = {
      'Work': [],
      'Social': [],
      'Shopping': [],
      'News': [],
      'Other': []
    };

    tabs.forEach(tab => {
      const url = tab.url.toLowerCase();
      if (url.includes('github.com') || url.includes('docs.')) {
        groups['Work'].push(tab);
      } else if (url.includes('facebook.com') || url.includes('twitter.com')) {
        groups['Social'].push(tab);
      } else if (url.includes('amazon.com') || url.includes('shop')) {
        groups['Shopping'].push(tab);
      } else if (url.includes('news')) {
        groups['News'].push(tab);
      } else {
        groups['Other'].push(tab);
      }
    });

    return groups;
  }

  async displayTabGroups(groups) {
    this.tabGroups.innerHTML = '';

    for (const [category, tabs] of Object.entries(groups)) {
      if (tabs.length === 0) continue;

      const groupElement = document.createElement('div');
      groupElement.className = 'tab-group';
      
      const header = document.createElement('div');
      header.className = 'tab-group-header';
      header.innerHTML = `
        <h3 class="tab-group-title">${category}</h3>
        <span class="tab-count">${tabs.length} tabs</span>
      `;

      const tabList = document.createElement('div');
      tabList.className = 'tab-list';

      tabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab-item';
        tabElement.innerHTML = `
          <img src="${tab.favIconUrl || 'icon.png'}" class="tab-favicon" alt="favicon">
          <span class="tab-title">${tab.title}</span>
        `;
        tabElement.addEventListener('click', () => chrome.tabs.update(tab.id, { active: true }));
        tabList.appendChild(tabElement);
      });

      groupElement.appendChild(header);
      groupElement.appendChild(tabList);
      this.tabGroups.appendChild(groupElement);
    }
  }

  async handleSearch(query) {
    if (!query.trim()) {
      return;
    }

    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const apiKey = await Config.getApiKey();

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a tab search assistant. Help find relevant tabs based on the user's query."
            },
            {
              role: "user",
              content: `Find tabs relevant to this query: "${query}". Tabs: ${JSON.stringify(tabs.map(t => ({ title: t.title, url: t.url })))}`
            }
          ]
        })
      });

      const data = await response.json();
      // Implementation of search results display would go here
    } catch (error) {
      console.error('Search error:', error);
      alert('Error performing search. Please try again.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TabHarmonyUI();
});
