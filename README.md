<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/Powered%20by-Groq%20AI-orange?style=for-the-badge&logo=lightning&logoColor=white" alt="Powered by Groq" />
  <img src="https://img.shields.io/badge/Model-Llama%203.3%2070B-purple?style=for-the-badge" alt="Llama 3.3" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

# 🎵 TabHarmony

**Your AI-powered browser tab organizer** — Transform tab chaos into organized harmony using Groq's blazing-fast Llama 3.3 70B model.

![Demo](https://github.com/user-attachments/assets/cd8aafdc-c0ae-4ab9-8c36-824ab611cfd0)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI-Powered Organization** | Uses Groq's Llama 3.3 70B model to intelligently categorize tabs based on content and purpose |
| 🏷️ **Smart Categories** | 11 intelligent categories: AI Tools, Development, Work, Job Search, Email, Social Media, Entertainment, Shopping, News, Finance, Learning |
| 🎨 **Visual Tab Groups** | Creates color-coded Chrome tab groups for easy visual navigation |
| 🔍 **Instant Search** | Filter through your tabs in real-time with local search |
| 🔄 **Graceful Fallback** | Domain-based grouping when AI is unavailable |
| 🔒 **Privacy First** | API key stored securely in Chrome's sync storage, no browsing data leaves your device |
| ⚡ **Lightning Fast** | Powered by Groq's industry-leading inference speed |

---

## 🎯 How It Works

1. **Click** the TabHarmony icon in your Chrome toolbar
2. **Press** "Organize Tabs" 
3. **Watch** as AI analyzes your tabs and creates organized groups
4. **Navigate** easily with color-coded categories

The AI examines each tab's URL and title to determine the best category, ensuring related tabs are grouped together logically.

---

## 🚀 Quick Start Guide

### Step 1: Install the Extension

```bash
# Clone the repository
git clone https://github.com/yourusername/tabharmony.git
cd tabharmony
```

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `tabharmony` folder

### Step 2: Get Your Free Groq API Key

> 🎉 **Great news!** Groq offers a generous **FREE tier** — no credit card required!

<details>
<summary><b>📋 Click here for step-by-step instructions to get your API key</b></summary>

#### Getting Your Free Groq API Key (2 minutes)

1. **Go to Groq Console**
   - Visit [console.groq.com](https://console.groq.com)

2. **Create an Account**
   - Click **"Sign Up"** (or "Log In" if you have an account)
   - You can sign up with Google, GitHub, or email
   - No credit card required!

3. **Navigate to API Keys**
   - Once logged in, click on **"API Keys"** in the left sidebar
   - Or go directly to [console.groq.com/keys](https://console.groq.com/keys)

4. **Create a New Key**
   - Click **"Create API Key"**
   - Give it a name like "TabHarmony"
   - Click **"Submit"**

5. **Copy Your Key**
   - Your key will look like: `gsk_xxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **Important:** Copy it now! You won't be able to see it again
   - Store it somewhere safe

6. **Add to TabHarmony**
   - Click the TabHarmony extension icon in Chrome
   - Paste your API key in the input field
   - Click **"Save API Key"**

✅ **Done!** You're ready to organize your tabs with AI.

---

#### Groq Free Tier Limits

| Resource | Free Limit |
|----------|------------|
| Requests per minute | 30 |
| Requests per day | 14,400 |
| Tokens per minute | 6,000 |

This is more than enough for personal tab organization!

</details>

### Step 3: Start Organizing!

1. Click the **TabHarmony icon** in your Chrome toolbar
2. Enter your Groq API key when prompted
3. Click **"Organize Tabs"** and watch the magic happen! ✨

---

## 📖 Usage Guide

### Organizing Tabs

| Action | How |
|--------|-----|
| **Organize all tabs** | Click the "Organize Tabs" button |
| **Search tabs** | Type in the search bar to filter |
| **Switch to a tab** | Click any tab in the list |
| **Ungroup a category** | Click the × button on a group header |
| **Ungroup all tabs** | Click "Ungroup All" button |
| **Change API key** | Click the settings (gear) icon |

### Category Colors

| Category | Color | Examples |
|----------|-------|----------|
| AI & ML Tools | 🟣 Purple | ChatGPT, Claude, Gemini, Perplexity |
| Development | 🔵 Blue | GitHub, Stack Overflow, VS Code docs |
| Work & Productivity | 🟢 Green | Google Docs, Notion, Slack, Zoom |
| Job Search | 🔵 Cyan | LinkedIn Jobs, Indeed, Glassdoor |
| Email & Communication | 🟡 Yellow | Gmail, Outlook, Discord |
| Social Media | 🩷 Pink | Twitter/X, Reddit, Instagram |
| Entertainment | 🔴 Red | YouTube, Netflix, Spotify |
| Shopping | 🟠 Orange | Amazon, eBay, product pages |
| News & Reading | ⚪ Grey | News sites, Medium, Wikipedia |
| Finance | 🟢 Green | Banking, investments, crypto |
| Learning | 🔵 Blue | Coursera, Udemy, tutorials |

---

## 🛠️ Technical Details

### Architecture

```
tabharmony/
├── manifest.json      # Chrome extension config (Manifest V3)
├── popup.html         # Extension popup UI
├── popup.js           # Core logic & AI integration
├── styles.css         # Glass-morphism styling
├── config.js          # Secure API key management
└── background.js      # Service worker
```

### Tech Stack

- **Chrome Extension** — Manifest V3
- **AI Provider** — Groq (Llama 3.3 70B Versatile)
- **Storage** — Chrome Sync Storage API
- **Tab Groups** — Chrome TabGroups API

### API Integration

The extension uses Groq's OpenAI-compatible API endpoint:

```
POST https://api.groq.com/openai/v1/chat/completions
Model: llama-3.3-70b-versatile
```

---

## 🔒 Privacy & Security

- ✅ **Local Processing** — Tab analysis happens through direct API calls, no intermediary servers
- ✅ **Secure Storage** — API key stored in Chrome's encrypted sync storage
- ✅ **Minimal Permissions** — Only requests necessary permissions (tabs, storage, tabGroups)
- ✅ **No Tracking** — Zero analytics, no data collection
- ✅ **Open Source** — Full code transparency

---

## 🤔 FAQ

<details>
<summary><b>What if I don't have an API key?</b></summary>

The extension will still work! It falls back to domain-based grouping, organizing tabs by website (e.g., all Google tabs together, all GitHub tabs together).
</details>

<details>
<summary><b>Is Groq really free?</b></summary>

Yes! Groq offers a generous free tier with 14,400 requests per day. For personal tab organization, you'll never hit this limit.
</details>

<details>
<summary><b>Why Groq instead of OpenAI?</b></summary>

Groq offers:
- ⚡ Faster inference (up to 10x faster than OpenAI)
- 💰 Generous free tier (no credit card required)
- 🧠 Access to Llama 3.3 70B (powerful open-source model)
</details>

<details>
<summary><b>Can I use a different AI provider?</b></summary>

Currently, TabHarmony is optimized for Groq. The codebase uses Groq's API endpoint and expects Groq API keys (starting with `gsk_`).
</details>

---

## 🚧 Roadmap

- [ ] Custom category rules
- [ ] Tab group color customization
- [ ] Export/import tab sessions
- [ ] Cross-device synchronization
- [ ] Keyboard shortcuts
- [ ] Tab analytics & insights
- [ ] Support for multiple AI providers

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for organized browsing
  <br><br>
  <a href="https://github.com/yourusername/tabharmony">⭐ Star this repo</a> if you find it useful!
</p>
