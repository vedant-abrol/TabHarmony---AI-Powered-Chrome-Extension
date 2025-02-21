
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
      await this.createChromeTabGroups(groupedTabs);
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
            content: "You are a tab organization assistant. Analyze the provided tabs and group them into meaningful categories based on their content and purpose. Return the result as a JSON object where keys are category names and values are arrays of tab indices. Be specific with categories, don't use generic terms like 'Other'."
          },
          {
            role: "user",
            content: `Analyze and group these tabs into specific categories. Consider the content, domain, and purpose of each tab: ${JSON.stringify(tabData)}`
          }
        ]
      })
    });

    const data = await response.json();
    return this.parseAIResponse(data.choices[0].message.content, tabs);
  }

  parseAIResponse(response, tabs) {
    try {
      // Try to parse the AI response as JSON first
      const groupings = JSON.parse(response);
      const result = {};
      
      // Convert the AI's category assignments into our group format
      for (const [category, tabIndices] of Object.entries(groupings)) {
        result[category] = tabIndices.map(index => tabs[index]);
      }
      
      return result;
    } catch (error) {
      // Fallback categorization if JSON parsing fails
      const domains = new Map();
      
      // Group by domain first
      tabs.forEach(tab => {
        try {
          const url = new URL(tab.url);
          const domain = url.hostname.replace('www.', '');
          
          // Extract meaningful category names from domains
          let category = domain.split('.')[0];
          category = category.charAt(0).toUpperCase() + category.slice(1);
          
          if (!domains.has(category)) {
            domains.set(category, []);
          }
          domains.get(category).push(tab);
        } catch (e) {
          if (!domains.has('Uncategorized')) {
            domains.set('Uncategorized', []);
          }
          domains.get('Uncategorized').push(tab);
        }
      });
      
      return Object.fromEntries(domains);
    }
  }

  async createChromeTabGroups(groups) {
    for (const [category, tabs] of Object.entries(groups)) {
      if (tabs.length === 0) continue;

      const tabIds = tabs.map(tab => tab.id);
      
      // Create a new tab group
      const groupId = await chrome.tabs.group({ tabIds });
      
      // Generate a consistent color based on the category name
      const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
      const colorIndex = Math.abs(category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
      
      // Update the group with title and color
      await chrome.tabGroups.update(groupId, {
        title: category,
        color: colors[colorIndex]
      });
    }
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

      if (!apiKey) {
        throw new Error('API key not found');
      }

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
              content: "You are a tab search assistant. Given a list of tabs and a search query, return the indices of relevant tabs as a JSON array. Consider the content, purpose, and context of the search query."
            },
            {
              role: "user",
              content: `Find tabs relevant to this query: "${query}". Return only the array of matching tab indices. Tabs: ${JSON.stringify(tabs.map((t, i) => ({ index: i, title: t.title, url: t.url })))}`
            }
          ]
        })
      });

      const data = await response.json();
      let relevantIndices = [];
      
      try {
        // Try to parse the AI response as a JSON array of indices
        relevantIndices = JSON.parse(data.choices[0].message.content);
      } catch (e) {
        // Fallback to simple text search if AI response parsing fails
        relevantIndices = tabs.map((tab, index) => ({
          index,
          score: (tab.title.toLowerCase().includes(query.toLowerCase()) || 
                 tab.url.toLowerCase().includes(query.toLowerCase())) ? 1 : 0
        }))
        .filter(item => item.score > 0)
        .map(item => item.index);
      }

      // Clear existing groups and display search results
      this.tabGroups.innerHTML = '';
      
      const searchGroup = document.createElement('div');
      searchGroup.className = 'tab-group';
      
      const header = document.createElement('div');
      header.className = 'tab-group-header';
      header.innerHTML = `
        <h3 class="tab-group-title">Search Results</h3>
        <span class="tab-count">${relevantIndices.length} matches</span>
      `;

      const tabList = document.createElement('div');
      tabList.className = 'tab-list';

      relevantIndices.forEach(index => {
        const tab = tabs[index];
        const tabElement = document.createElement('div');
        tabElement.className = 'tab-item';
        tabElement.innerHTML = `
          <img src="${tab.favIconUrl || 'icon.png'}" class="tab-favicon" alt="favicon">
          <span class="tab-title">${tab.title}</span>
        `;
        tabElement.addEventListener('click', () => chrome.tabs.update(tab.id, { active: true }));
        tabList.appendChild(tabElement);
      });

      searchGroup.appendChild(header);
      searchGroup.appendChild(tabList);
      this.tabGroups.appendChild(searchGroup);

    } catch (error) {
      console.error('Search error:', error);
      alert('Error performing search. Please try again.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TabHarmonyUI();
});
