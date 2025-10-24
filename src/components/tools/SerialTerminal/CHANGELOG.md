# BattleTerm Changelog

All notable changes to BattleTerm will be documented in this file.

## [1.1.0] - 2025-10-24 - PWA Update

### Added
- 📱  Progressive Web App (PWA) support - BattleTerm can now be installed as a standalone application
- 🎯  Fullscreen mode when installed as PWA - removes navigation and header for dedicated terminal experience
- 📐  Minimum window size constraints (800x600) to prevent UI issues
- ✨  Enhanced viewport configuration for optimal PWA display
- 🔧  Standalone mode detection for iOS, Android, and desktop platforms

### Changed
- Terminal page now renders fullscreen when launched as installed PWA app
- Navigation and footer hidden in standalone/PWA mode for distraction-free experience
- Improved professional appearance when used as standalone app

## [1.0.0] - 2025-10-24 - Initial Release

### Added
- 🎉  First public release of BattleTerm
- ✨  Web Serial API integration for browser-based serial communication
- 🎨  Full ANSI color support with xterm.js terminal emulator
- ⚙️  Configurable baud rates (300 to 921600 baud)
- 🔧  Data bits, parity, and stop bits configuration
- 📝  Command history with up/down arrow navigation
- 💾  Download terminal logs to file
- 📊  Real-time TX/RX activity indicators
- 🔍  ASCII and Hex view modes
- 📋  Copy/paste support (Ctrl+C/Ctrl+V and context menu)
- ⏱️  Optional timestamps for debugging
- 🧮  Optional line numbers
- 📈  Connection statistics (bytes sent/received, transfer rates)
- 🎯  Local echo option for sent commands
- 🌐  No installation required - runs directly in browser
- 🔌  Support for Chrome, Edge, and Opera browsers
- 📱  Responsive design for mobile and desktop
- 🎭  Animated ASCII art welcome screen
- ❓  Comprehensive help modal with feature list
- 💚  Clean terminal UI with colorful theme

### Features
- **Core Serial Communication**
  - Web Serial API for direct port access
  - Configurable connection parameters
  - Auto-reconnect capability
  - Port information display

- **Terminal Emulation**
  - xterm.js-based terminal display
  - ANSI escape sequence support
  - Color output rendering
  - Unicode (UTF-8) support
  - Smooth scrolling
  - Resizable terminal window

- **Developer Tools**
  - Hex view for binary data analysis
  - Timestamp overlay for timing analysis
  - Line numbers for log review
  - Command history buffer
  - Log export functionality

- **User Experience**
  - Intuitive connection flow
  - Visual TX/RX indicators
  - Error handling and display
  - Keyboard shortcuts
  - Context menu actions
  - Configuration persistence (remembers last settings)

---

## Future Roadmap

Planned features for future releases:

- 📦 Macro/quick send buttons for common commands
- 📊 Data logging with filters
- 🎨 Custom color themes
- 📝 Multiple terminal tabs
- 🔍 Search functionality in terminal output
- 📈 Advanced protocol analysis
- 🔌 WebUSB fallback support
- 🌍 Internationalization (i18n)

---

**Note**: This changelog follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
