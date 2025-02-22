
# TabHarmony: AI-Powered Tab Organization Chrome Extension

## Overview
TabHarmony is an intelligent Chrome extension that uses OpenAI's GPT API to automatically organize and manage your browser tabs. It helps users maintain a clean and organized browsing experience by intelligently grouping related tabs and providing natural language search capabilities.

## Demo
![Demo](https://github.com/user-attachments/assets/cd8aafdc-c0ae-4ab9-8c36-824ab611cfd0)

## Features

### 1. Intelligent Tab Organization
- **AI-Powered Grouping**: Uses OpenAI's GPT API to analyze tab content and group similar tabs together
- **Automatic Categories**: Creates logical categories based on tab content (Work, Social, Shopping, News, etc.)
- **Visual Organization**: Groups tabs with clear visual separation and intuitive interface

### 2. Smart Search
- **Natural Language Search**: Search your tabs using everyday language
- **AI Understanding**: Leverages GPT to understand the context of your search queries
- **Real-time Results**: Instantly highlights and suggests relevant tabs

### 3. User Interface
- **Clean Design**: Modern, minimalist interface with a beautiful blue theme
- **Glass Morphism**: Contemporary design with subtle transparency effects
- **Responsive Animations**: Smooth transitions and loading states for better UX

### 4. Security
- **Secure API Key Storage**: Safely stores your OpenAI API key in Chrome's secure storage
- **Privacy-Focused**: No data collection or external storage of browsing history
- **Local Processing**: All tab organization happens locally in your browser

## Technical Details

### Core Components

1. **popup.html & styles.css**
   - Main user interface
   - Glass morphism design elements
   - Responsive layout (400x500px)
   - Custom color scheme:
     - Background: #F0F8FF
     - Accent: #1E90FF
     - Text: #004080
     - Highlights: #87CEEB

2. **popup.js**
   - Tab management logic
   - UI interactions
   - OpenAI API integration
   - Search functionality

3. **config.js**
   - API key management
   - Chrome storage integration
   - Configuration validation

4. **background.js**
   - Chrome extension background processes
   - Tab group creation and management
   - Event handling

### Architecture

```
TabHarmony/
├── manifest.json      # Extension configuration
├── popup.html        # Main UI template
├── styles.css        # UI styling
├── popup.js         # Core functionality
├── config.js        # Configuration management
├── background.js    # Background processes
└── icons/           # Extension icons
```

## Installation

1. **Clone or Download**
   ```bash
   git clone [repository-url]
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the extension directory

3. **Configuration**
   - Click the TabHarmony icon in Chrome
   - Open settings (gear icon)
   - Enter your OpenAI API key
   - Save settings

## Usage

1. **Basic Organization**
   - Click the TabHarmony icon in Chrome
   - Press "Organize Tabs"
   - Wait for AI analysis to complete
   - View your automatically organized tabs

2. **Search**
   - Type your query in the search bar
   - Use natural language (e.g., "find my shopping tabs")
   - Click on suggested tabs to navigate

3. **Settings**
   - Access settings via the gear icon
   - Manage your API key
   - View organization history

## Development

### Prerequisites
- Chrome browser
- OpenAI API key
- Basic understanding of Chrome extension architecture

### Local Development
1. Make changes to source files
2. Reload the extension in Chrome
3. Test changes by clicking the extension icon

### Files to Modify
- `popup.html` for UI changes
- `styles.css` for styling
- `popup.js` for functionality
- `config.js` for configuration
- `background.js` for background processes

## Use Cases

1. **Research Organization**
   - Group research materials by topic
   - Keep academic sources separate from general browsing
   - Quickly find related research tabs

2. **Work Management**
   - Separate work-related tabs from personal browsing
   - Group project-specific resources
   - Maintain focus by organizing tabs by task

3. **Shopping Comparison**
   - Group product research tabs
   - Compare prices across different sites
   - Keep track of wish list items

4. **Content Creation**
   - Organize reference materials
   - Group inspiration sources
   - Maintain separate contexts for different projects

5. **Learning & Education**
   - Group course materials
   - Organize tutorial resources
   - Separate study topics

## Future Enhancements
- Custom categorization rules
- Tab group color customization
- Export/import of tab groups
- Cross-device synchronization
- Advanced search filters
- Tab analytics and insights

## Support
For issues, feature requests, or contributions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Follow the contribution guidelines

