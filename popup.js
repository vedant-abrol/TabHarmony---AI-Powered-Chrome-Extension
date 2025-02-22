import Config from './config.js';

class TabHarmonyUI {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchButton = document.getElementById('searchButton');
    this.organizeButton = document.getElementById('organizeButton');
    this.tabGroups = document.getElementById('tabGroups');
    this.loadingSpinner = this.organizeButton.querySelector('.loading-spinner');
    this.buttonText = this.organizeButton.querySelector('.button-text');
    
    this.setupEventListeners();
  }

  async setupEventListeners() {
    this.organizeButton.addEventListener('click', () => this.organizeTabs());
    this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.searchButton.addEventListener('click', () => this.handleSearch(this.searchInput.value));
    document.getElementById('ungroupAllButton').addEventListener('click', () => this.ungroupAllTabs());
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
      id: tab.id,
      title: tab.title,
      url: tab.url
    }));

    const systemPrompt = `You are a tab organization expert. Analyze these tabs thoroughly using:
1. Content context and relationships
2. User intent patterns
3. Topic hierarchies

Group tabs into intuitive categories like:
- AI/ML (ChatGPT, Claude, Bard, ML papers, AI documentation)
- Development (GitHub, Stack Overflow, docs, tutorials)
- Knowledge/Learning (courses, documentation, tutorials)
- Shopping/E-commerce (any shopping sites)
- Entertainment (videos, music, streaming)
- Work/Productivity (docs, sheets, work platforms)
- Research (papers, studies, academic sites)
- Social (social media, communication platforms)
- News/Media (news sites, blogs, media outlets)

For each tab, analyze:
- Page title
- URL content
- Site purpose
- Related topics
- Common usage patterns

Return structured groups that emphasize:
- Topical relationships (e.g., all AI tools together)
- User workflow patterns
- Content similarity
- Purpose alignment

Only return a JSON object with this exact structure:
{
  "groups": [
    {
      "name": "Category Name",
      "color": "blue|red|yellow|green|pink|purple|cyan|orange",
      "tabs": [tab_indices],
      "description": "Brief category description"
    }
  ]
}

Guidelines for categorization:
1. Group AI-related sites together (ChatGPT, Claude, Bard, etc.)
2. Recognize when different domain tabs serve similar purposes
3. Create logical groups based on user workflows
4. Consider tab titles and content for context
5. Handle multi-purpose sites based on actual usage context
6. Use clear, specific category names
7. Don't create "Other" or "Miscellaneous" groups`;

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
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze and group these tabs with context-aware categorization: ${JSON.stringify(tabData)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    return this.parseAIResponse(data.choices[0].message.content, tabs);
  }

  parseAIResponse(response, tabs) {
    try {
      const parsed = JSON.parse(response);
      const result = {};
      
      parsed.groups.forEach(group => {
        result[group.name] = {
          tabs: group.tabs.map(index => tabs[index]),
          color: group.color,
          description: group.description
        };
      });
      
      return result;
    } catch (error) {
      console.error('AI grouping failed, falling back to domain-based grouping:', error);
      
      const groups = new Map();
      
      const categorize = (tab) => {
        const url = new URL(tab.url);
        const domain = url.hostname.replace('www.', '');
        const title = tab.title.toLowerCase();
        
        if (domain.includes('chat.openai') || domain.includes('claude') || title.includes('gpt') || title.includes('ai')) {
          return { category: 'AI Tools', color: 'purple' };
        } else if (domain.includes('github') || domain.includes('stackoverflow') || title.includes('docs')) {
          return { category: 'Development', color: 'blue' };
        } else if (domain.includes('google') && (title.includes('doc') || title.includes('sheet'))) {
          return { category: 'Work', color: 'green' };
        } else if (domain.includes('youtube') || domain.includes('netflix')) {
          return { category: 'Entertainment', color: 'red' };
        } else if (domain.includes('amazon') || domain.includes('shop') || title.includes('cart')) {
          return { category: 'Shopping', color: 'yellow' };
        } else if (domain.includes('mail') || domain.includes('outlook')) {
          return { category: 'Communication', color: 'cyan' };
        } else {
          const category = domain.split('.')[0];
          return { 
            category: category.charAt(0).toUpperCase() + category.slice(1),
            color: 'gray'
          };
        }
      };

      tabs.forEach(tab => {
        try {
          const { category, color } = categorize(tab);
          if (!groups.has(category)) {
            groups.set(category, { tabs: [], color });
          }
          groups.get(category).tabs.push(tab);
        } catch (e) {
          console.error('Error categorizing tab:', e);
          if (!groups.has('Uncategorized')) {
            groups.set('Uncategorized', { tabs: [], color: 'gray' });
          }
          groups.get('Uncategorized').tabs.push(tab);
        }
      });
      
      return Object.fromEntries(groups);
    }
  }

  async createChromeTabGroups(groups) {
    for (const [category, { tabs, color }] of Object.entries(groups)) {
      if (tabs.length === 0) continue;

      const tabIds = tabs.map(tab => tab.id);
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: category,
        color: color
      });
    }
  }

  async displayTabGroups(groups) {
    this.tabGroups.innerHTML = '';

    for (const [category, { tabs }] of Object.entries(groups)) {
      if (tabs.length === 0) continue;

      const groupElement = document.createElement('div');
      groupElement.className = 'tab-group';
      
      const header = document.createElement('div');
      header.className = 'tab-group-header';
      
      const titleContainer = document.createElement('div');
      titleContainer.className = 'title-container';
      titleContainer.innerHTML = `
        <h3 class="tab-group-title">${category}</h3>
        <span class="tab-count">${tabs.length} tabs</span>
      `;

      const ungroupButton = document.createElement('button');
      ungroupButton.className = 'ungroup-button';
      ungroupButton.setAttribute('title', 'Ungroup these tabs');
      ungroupButton.innerHTML = '×';
      ungroupButton.addEventListener('click', async () => {
        const tabIds = tabs.map(tab => tab.id);
        await chrome.tabs.ungroup(tabIds);
        groupElement.remove();
      });

      header.appendChild(titleContainer);
      header.appendChild(ungroupButton);

      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'button-group';

      const openNewWindowButton = document.createElement('button');
      openNewWindowButton.className = 'success-button';
      openNewWindowButton.textContent = 'Open in New Window';
      openNewWindowButton.addEventListener('click', async () => {
        const tabIds = tabs.map(tab => tab.id);
        const newWindow = await chrome.windows.create({ tabId: tabIds[0] });
        if (tabIds.length > 1) {
          await chrome.tabs.move(tabIds.slice(1), { windowId: newWindow.id, index: -1 });
        }
      });

      const closeAllButton = document.createElement('button');
      closeAllButton.className = 'danger-button';
      closeAllButton.textContent = 'Close All';
      closeAllButton.addEventListener('click', async () => {
        const tabIds = tabs.map(tab => tab.id);
        await chrome.tabs.remove(tabIds);
        groupElement.remove();
      });

      const groupTabsButton = document.createElement('button');
      groupTabsButton.className = 'secondary-button';
      groupTabsButton.textContent = 'Group Tabs';
      groupTabsButton.addEventListener('click', async () => {
        const tabIds = tabs.map(tab => tab.id);
        const groupId = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(groupId, { title: category });
      });

      buttonGroup.appendChild(openNewWindowButton);
      buttonGroup.appendChild(closeAllButton);
      buttonGroup.appendChild(groupTabsButton);

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
      groupElement.appendChild(buttonGroup);
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
        relevantIndices = JSON.parse(data.choices[0].message.content);
      } catch (e) {
        relevantIndices = tabs.map((tab, index) => ({
          index,
          score: (tab.title.toLowerCase().includes(query.toLowerCase()) || 
                 tab.url.toLowerCase().includes(query.toLowerCase())) ? 1 : 0
        }))
        .filter(item => item.score > 0)
        .map(item => item.index);
      }

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

  async ungroupAllTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabIds = tabs.map(tab => tab.id);
    await chrome.tabs.ungroup(tabIds);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TabHarmonyUI();
});
