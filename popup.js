import Config from './config.js';

class TabHarmonyUI {
  constructor() {
    this.apiKeySetup = document.getElementById('apiKeySetup');
    this.mainApp = document.getElementById('mainApp');
    this.apiKeyInput = document.getElementById('apiKeyInput');
    this.saveApiKeyButton = document.getElementById('saveApiKeyButton');
    this.apiKeyError = document.getElementById('apiKeyError');
    this.apiKeySuccess = document.getElementById('apiKeySuccess');
    this.setupTitle = document.getElementById('setupTitle');
    this.setupSubtitle = document.getElementById('setupSubtitle');
    
    this.searchInput = document.getElementById('searchInput');
    this.searchButton = document.getElementById('searchButton');
    this.settingsButton = document.getElementById('settingsButton');
    this.organizeButton = document.getElementById('organizeButton');
    this.tabGroups = document.getElementById('tabGroups');
    this.loadingSpinner = this.organizeButton.querySelector('.loading-spinner');
    this.buttonText = this.organizeButton.querySelector('.button-text');
    
    // Flags to prevent adding listeners multiple times
    this.apiKeyListenersAdded = false;
    this.mainListenersAdded = false;
    
    this.init();
  }

  async init() {
    // Check if API key exists
    const apiKey = await Config.getApiKey();
    
    if (!apiKey) {
      // Show API key setup screen
      this.showApiKeySetup();
    } else {
      // Show main app
      this.showMainApp();
    }
  }

  showApiKeySetup(isChangingKey = false) {
    this.apiKeySetup.classList.remove('hidden');
    this.mainApp.classList.add('hidden');
    
    // Update text based on context
    if (isChangingKey) {
      this.setupTitle.textContent = 'Change API Key';
      this.setupSubtitle.textContent = 'Enter your new Groq API key below';
    } else {
      this.setupTitle.textContent = 'Welcome to TabHarmony';
      this.setupSubtitle.textContent = 'To get started, please enter your Groq API key';
    }
    
    // Reset the form state
    this.saveApiKeyButton.disabled = false;
    this.saveApiKeyButton.textContent = isChangingKey ? 'Update API Key' : 'Save API Key';
    this.apiKeyInput.value = '';
    this.hideError();
    this.hideSuccess();
    
    this.setupApiKeyListeners();
  }

  showMainApp() {
    this.apiKeySetup.classList.add('hidden');
    this.mainApp.classList.remove('hidden');
    
    // Reset save button state (in case we're coming from API key setup)
    this.saveApiKeyButton.disabled = false;
    this.saveApiKeyButton.textContent = 'Save API Key';
    
    this.setupEventListeners();
    // Load existing tab groups when popup opens
    this.loadExistingGroups();
  }

  setupApiKeyListeners() {
    if (this.apiKeyListenersAdded) return;
    this.apiKeyListenersAdded = true;
    
    this.saveApiKeyButton.addEventListener('click', () => this.saveApiKey());
    this.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveApiKey();
      }
    });
  }

  async saveApiKey() {
    const apiKey = this.apiKeyInput.value.trim();
    
    if (!apiKey) {
      this.showError('Please enter an API key');
      return;
    }

    // Basic validation - Groq API keys typically start with 'gsk_'
    if (!apiKey.startsWith('gsk_')) {
      this.showError('Invalid API key format. Groq API keys should start with "gsk_"');
      return;
    }

    try {
      this.saveApiKeyButton.disabled = true;
      this.saveApiKeyButton.textContent = 'Saving...';
      
      const success = await Config.setApiKey(apiKey);
      
      if (success) {
        // Hide error if any
        this.hideError();
        // Show success message
        this.showSuccess();
        // Reset button state
        this.saveApiKeyButton.disabled = false;
        this.saveApiKeyButton.textContent = 'Save API Key';
        // Transition to main app after a short delay so user sees the success message
        setTimeout(() => {
          this.showMainApp();
        }, 1000);
      } else {
        this.showError('Failed to save API key. Please try again.');
        this.saveApiKeyButton.disabled = false;
        this.saveApiKeyButton.textContent = 'Save API Key';
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      this.showError('An error occurred while saving the API key');
      this.saveApiKeyButton.disabled = false;
      this.saveApiKeyButton.textContent = 'Save API Key';
    }
  }

  showError(message) {
    this.hideSuccess();
    this.apiKeyError.textContent = message;
    this.apiKeyError.classList.remove('hidden');
  }

  hideError() {
    this.apiKeyError.classList.add('hidden');
    this.apiKeyError.textContent = '';
  }

  showSuccess() {
    this.hideError();
    this.apiKeySuccess.classList.remove('hidden');
  }

  hideSuccess() {
    this.apiKeySuccess.classList.add('hidden');
  }

  changeApiKey() {
    this.showApiKeySetup(true);
  }

  setupEventListeners() {
    if (this.mainListenersAdded) return;
    this.mainListenersAdded = true;
    
    this.organizeButton.addEventListener('click', () => this.organizeTabs());
    this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.searchButton.addEventListener('click', () => this.handleSearch(this.searchInput.value));
    this.settingsButton.addEventListener('click', () => this.changeApiKey());
    document.getElementById('ungroupAllButton').addEventListener('click', () => this.ungroupAllTabs());
  }

  // Load existing tab groups from the browser
  async loadExistingGroups() {
    try {
      // Get all tab groups in the current window
      const tabGroups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      
      if (tabGroups.length === 0) {
        console.log('No existing tab groups found');
        return;
      }

      console.log('Found existing tab groups:', tabGroups.length);

      // Get all tabs in the current window
      const allTabs = await chrome.tabs.query({ currentWindow: true });

      // Build groups object from existing Chrome tab groups
      const groups = {};
      
      for (const group of tabGroups) {
        // Find tabs that belong to this group
        const groupTabs = allTabs.filter(tab => tab.groupId === group.id);
        
        if (groupTabs.length > 0) {
          groups[group.title || 'Unnamed'] = {
            tabs: groupTabs,
            color: group.color || 'grey'
          };
        }
      }

      // Also check for ungrouped tabs (groupId is -1 or undefined for ungrouped)
      const ungroupedTabs = allTabs.filter(tab => !tab.groupId || tab.groupId === -1);
      if (ungroupedTabs.length > 0 && Object.keys(groups).length > 0) {
        // Only show ungrouped if there are some grouped tabs
        groups['Ungrouped'] = {
          tabs: ungroupedTabs,
          color: 'grey'
        };
      }

      // Display the groups
      if (Object.keys(groups).length > 0) {
        await this.displayTabGroups(groups);
      }
    } catch (error) {
      console.error('Error loading existing groups:', error);
    }
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
      console.log('Starting organization...');
      this.setLoading(true);
      const tabs = await chrome.tabs.query({ currentWindow: true });
      console.log('Found tabs:', tabs.length);
      
      // 1. Get Groups (Try AI -> Fail -> Use Backup)
      const groupedTabs = await this.analyzeAndGroupTabs(tabs);
      console.log('Grouped tabs:', groupedTabs);
      
      // 2. Create Chrome Groups (Visual tabs at top of browser)
      await this.createChromeTabGroups(groupedTabs);
      console.log('Chrome groups created');
      
      // 3. Display in Popup (So you can search them)
      await this.displayTabGroups(groupedTabs);
      console.log('Display complete');
      
    } catch (error) {
      console.error('Critical Failure:', error);
      // We only alert if even the BACKUP failed (very unlikely)
      alert(`Something went wrong: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async analyzeAndGroupTabs(tabs) {
    let apiKey = null;
    try {
        apiKey = await Config.getApiKey();
    } catch (e) {
        console.warn("Config error:", e);
    }

    // Prepare data for AI
    const tabData = tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url
    }));

    // If no key, skip straight to backup
    if (!apiKey) {
      console.log("No API Key found, using backup organization.");
      return this.fallbackGrouping(tabs);
    }

    try {
      console.log('Calling Groq API...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        cache: 'no-store',  // Prevent caching
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
                role: "system", 
                content: `You are an expert browser tab organizer. Analyze each tab's URL and title to intelligently group them.

CATEGORIZATION RULES:
1. **AI & ML Tools** (color: purple) - ChatGPT, Claude, Gemini, Copilot, Perplexity, Hugging Face, AI image generators, ML documentation
2. **Development** (color: blue) - GitHub, GitLab, Stack Overflow, coding docs, IDEs, localhost, API references, npm, PyPI
3. **Work & Productivity** (color: green) - Google Docs/Sheets/Slides, Notion, Trello, Asana, Slack, Microsoft 365, Zoom, company portals
4. **Job Search** (color: cyan) - LinkedIn Jobs, Indeed, Glassdoor, Wellfound, Lever, Greenhouse, job application portals, career pages
5. **Email & Communication** (color: yellow) - Gmail, Outlook, Yahoo Mail, Discord, WhatsApp Web, Telegram, Messenger
6. **Social Media** (color: pink) - Twitter/X, Facebook, Instagram, Reddit, TikTok, LinkedIn (non-job posts)
7. **Entertainment** (color: red) - YouTube, Netflix, Spotify, Twitch, gaming sites, streaming platforms
8. **Shopping** (color: orange) - Amazon, eBay, any e-commerce, product pages, carts, wishlists
9. **News & Reading** (color: grey) - News sites, blogs, Medium, Substack, Wikipedia, articles
10. **Finance** (color: green) - Banking, investments, crypto, payment services, financial dashboards
11. **Learning** (color: blue) - Coursera, Udemy, educational sites, tutorials, documentation for learning

INSTRUCTIONS:
- Analyze BOTH the URL domain AND the page title for context
- Group similar purposes together (e.g., all job sites in "Job Search")
- Use specific category names, not generic ones
- Each tab index (0-based) must appear in exactly ONE group
- Minimum 2 tabs per group when possible; single tabs can have their own group

OUTPUT FORMAT (strict JSON only, no extra text):
{"groups":[{"name":"Category Name","color":"blue","tabs":[0,1,2]}]}

Available colors: grey, blue, red, yellow, green, pink, purple, cyan, orange` 
            },
            { 
                role: "user", 
                content: `Analyze and group these ${tabData.length} browser tabs:\n${JSON.stringify(tabData, null, 2)}` 
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      });

      console.log('API Response status:', response.status);
      
      // If API says "Error" (like 401 Invalid Key), throw error to trigger backup
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      const aiContent = data.choices[0].message.content;
      console.log('AI Content:', aiContent);
      
      const parsed = this.parseAIResponse(aiContent, tabs);
      
      // If AI parsing returned empty, use fallback
      if (Object.keys(parsed).length === 0) {
        console.log('AI returned empty groups, using fallback');
        return this.fallbackGrouping(tabs);
      }
      
      return parsed;

    } catch (error) {
      console.warn('AI Failed (using backup):', error);
      // SAFETY SHIELD: If ANYTHING goes wrong above, run this backup function
      return this.fallbackGrouping(tabs); 
    }
  }

  // Backup: Groups by Website Name (e.g. "Google", "YouTube")
  fallbackGrouping(tabs) {
    console.log('Using fallback grouping for', tabs.length, 'tabs');
    const groups = {};
    const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
    let colorIndex = 0;
    
    tabs.forEach(tab => {
      try {
        const url = new URL(tab.url);
        // Extract "google" from "www.google.com"
        let domain = url.hostname.replace('www.', '').split('.')[0];
        // Capitalize it: "Google"
        domain = domain.charAt(0).toUpperCase() + domain.slice(1);
        
        if (!groups[domain]) {
          groups[domain] = { tabs: [], color: colors[colorIndex % colors.length] };
          colorIndex++;
        }
        groups[domain].tabs.push(tab);
      } catch (e) {
        if (!groups['Other']) {
          groups['Other'] = { tabs: [], color: 'grey' };
        }
        groups['Other'].tabs.push(tab);
      }
    });
    
    console.log('Fallback created groups:', Object.keys(groups));
    return groups;
  }

  parseAIResponse(content, tabs) {
    try {
      console.log('Parsing AI response...');
      // Clean up the response in case AI added extra text
      let cleanJson = content;
      const firstCurly = content.indexOf('{');
      const lastCurly = content.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1) {
        cleanJson = content.substring(firstCurly, lastCurly + 1);
      }
      console.log('Clean JSON:', cleanJson);

      const parsed = JSON.parse(cleanJson);
      console.log('Parsed object:', parsed);
      const result = {};
      
      if (!parsed.groups) throw new Error("Invalid JSON - no groups field");

      parsed.groups.forEach(group => {
        console.log('Processing group:', group.name, 'with tab indices:', group.tabs);
        // Match indices back to real tabs
        const groupTabs = group.tabs
          .map(index => tabs[index])
          .filter(t => t !== undefined);
        
        console.log('Matched tabs:', groupTabs.length);
        
        if (groupTabs.length > 0) {
          result[group.name] = {
            tabs: groupTabs,
            color: this.isValidColor(group.color) ? group.color : 'blue'
          };
        }
      });
      console.log('Final result:', result);
      return result;
    } catch (error) {
      console.error('Parse error:', error);
      throw error; // Let the catch block in analyzeAndGroupTabs handle it
    }
  }

  isValidColor(color) {
    return ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'].includes(color);
  }

  async createChromeTabGroups(groups) {
    console.log('Creating Chrome tab groups...');
    console.log('Groups to create:', Object.keys(groups));
    
    // Ungroup everything first to prevent messy merging
    await this.ungroupAllTabs();

    for (const [category, { tabs, color }] of Object.entries(groups)) {
      console.log(`Processing category: ${category}, tabs: ${tabs?.length || 0}`);
      if (!tabs || tabs.length === 0) continue;
      const tabIds = tabs.map(tab => tab.id);
      console.log(`Tab IDs for ${category}:`, tabIds);
      try {
        const groupId = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(groupId, {
          title: category,
          color: color
        });
        console.log(`Created group: ${category} with ID ${groupId}`);
      } catch (e) {
        console.error("Chrome grouping error:", e);
      }
    }
  }

  async displayTabGroups(groups) {
    this.tabGroups.innerHTML = ''; // Clear current list

    for (const [category, { tabs }] of Object.entries(groups)) {
      if (!tabs || tabs.length === 0) continue;

      const groupElement = document.createElement('div');
      groupElement.className = 'tab-group';
      
      groupElement.innerHTML = `
        <div class="tab-group-header">
            <div class="title-container">
                <h3 class="tab-group-title">${category}</h3>
                <span class="tab-count">${tabs.length} tabs</span>
            </div>
        </div>
        <div class="tab-list"></div>
      `;

      // Add close button functionality
      const ungroupBtn = document.createElement('button');
      ungroupBtn.className = 'ungroup-button';
      ungroupBtn.innerHTML = '×';
      ungroupBtn.onclick = async () => {
          const tabIds = tabs.map(t => t.id);
          await chrome.tabs.ungroup(tabIds);
          groupElement.remove();
      };
      groupElement.querySelector('.tab-group-header').appendChild(ungroupBtn);

      // Add tabs to the list
      const tabList = groupElement.querySelector('.tab-list');
      tabs.forEach(tab => {
        const item = document.createElement('div');
        item.className = 'tab-item';
        item.innerHTML = `
          <img src="${tab.favIconUrl || ''}" class="tab-favicon" onerror="this.style.display='none'">
          <span class="tab-title">${tab.title}</span>
        `;
        // Make tab clickable
        item.onclick = () => {
            chrome.tabs.update(tab.id, { active: true });
            chrome.windows.update(tab.windowId, { focused: true });
        };
        tabList.appendChild(item);
      });

      this.tabGroups.appendChild(groupElement);
    }
  }

  // Local Search (Fast & Reliable)
  async handleSearch(query) {
    if (!query.trim()) {
        // If search is cleared, show organized groups again
        this.organizeTabs(); 
        return;
    }

    const tabs = await chrome.tabs.query({ currentWindow: true });
    const searchTerm = query.toLowerCase();

    // Filter tabs locally (no API needed)
    const matches = tabs.filter(tab => 
        (tab.title && tab.title.toLowerCase().includes(searchTerm)) ||
        (tab.url && tab.url.toLowerCase().includes(searchTerm))
    );

    // Show results
    this.tabGroups.innerHTML = '';
    const groupElement = document.createElement('div');
    groupElement.className = 'tab-group';
    groupElement.innerHTML = `
        <div class="tab-group-header">
            <h3 class="tab-group-title">Search Results</h3>
            <span class="tab-count">${matches.length} matches</span>
        </div>
        <div class="tab-list"></div>
    `;

    const tabList = groupElement.querySelector('.tab-list');
    matches.forEach(tab => {
        const item = document.createElement('div');
        item.className = 'tab-item';
        item.innerHTML = `
          <img src="${tab.favIconUrl || ''}" class="tab-favicon" onerror="this.style.display='none'">
          <span class="tab-title">${tab.title}</span>
        `;
        item.onclick = () => chrome.tabs.update(tab.id, { active: true });
        tabList.appendChild(item);
    });

    this.tabGroups.appendChild(groupElement);
  }

  async ungroupAllTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabIds = tabs.map(tab => tab.id);
    await chrome.tabs.ungroup(tabIds);
    // Clear the display in the popup
    this.tabGroups.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TabHarmonyUI();
});
