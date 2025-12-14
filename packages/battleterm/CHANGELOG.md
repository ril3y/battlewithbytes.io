# BattleTerm Changelog

All notable changes to BattleTerm will be documented in this file.

## [1.2.2] - 2025-10-24 - Serial Connection Fix

### Fixed

- 🐛 Fixed "Application error: a client-side exception has occurred" when connecting to serial port
- 🔧 Removed deprecated `rendererType` property that caused errors in xterm.js v5+
- ✨ Serial port connections now work reliably without crashes

## [1.2.1] - 2025-10-24 - Auto-Focus on Connect

### Changed

- ✨ Input box automatically receives focus when connected to serial port
- ⌨️ Users can start typing immediately after connecting
- 🎯 Improved workflow - no need to manually click the input box

## [1.2.0] - 2025-10-24 - ESC Key & Cursor Fixes

### Fixed

- 🐛 ESC key now works in fullscreen even when terminal is focused
- 🐛 Terminal cursor no longer blinks when not connected to a serial port
- ✨ ESC key uses event capture phase to bypass xterm.js interception
- ⌨️ Cleaner visual state - cursor only appears when actively connected

## [1.1.9] - 2025-10-24 - ESC to Exit Fullscreen

### Added

- ⌨️ Press ESC key to exit fullscreen mode
- 💡 Brief hint message displays for 3 seconds when entering fullscreen

### Fixed

- 🔧 Removed persistent exit fullscreen button that overlapped with terminal controls
- ✨ Cleaner fullscreen experience without UI conflicts

## [1.1.8] - 2025-10-24 - Fullscreen Height Fix

### Fixed

- 📐 Fullscreen mode now uses full viewport height (100vh)
- ⬇️ Status bar is now pinned to the bottom of the window in fullscreen mode
- ✨ Better utilization of screen space when in fullscreen

## [1.1.7] - 2025-10-24 - Auto-Focus Input

### Changed

- ⌨️ Terminal input automatically focuses on page load
- ✨ Users can start typing immediately without clicking the input box
- 🎯 Improved user experience - terminal is ready to use right away

## [1.1.6] - 2025-10-24 - Fullscreen Toggle

### Added

- ✨ Fullscreen toggle button in browser mode (next to BattleTerm header)
- ✕ Exit fullscreen button when in fullscreen mode

### Changed

- 🎯 PWA mode automatically hides header for clean app experience
- 📱 Browser mode shows header by default with fullscreen toggle option
- 🔄 Users can easily switch between normal and fullscreen views in browser

## [1.1.5] - 2025-10-24 - Full-Screen Terminal

### Changed

- 🎯 Removed `<BattleTerm />` header completely - terminal now full-screen always
- 🔗 battlewithbytes.io attribution always visible in status bar footer
- ✨ Cleaner, more professional terminal-only interface
- 📐 Page always uses full viewport height for maximum terminal space

## [1.1.4] - 2025-10-24 - PWA Enhancements & UI Fixes

### Added

- ✨ Real-time hex/ASCII mode switching without needing to disconnect/reconnect
- 🎯 Full-screen mode in PWA - header is hidden when running as installed app
- 🔗 Attribution link to battlewithbytes.io in status bar when in PWA mode

### Changed

- 📐 Terminal height now dynamically adjusts based on viewport height (40vh/50vh/55vh)
- 🔧 Improved laptop display with responsive height constraints

### Fixed

- 🐛 Fixed TypeScript strict mode errors for better reliability
- 🐛 Hex/ASCII mode toggle now works instantly while connected

## [1.1.3] - 2025-10-24 - Hex View Fix

### Fixed

- 🐛 Hex view was showing both hex AND ASCII text mixed together
- 🐛 Hex view was executing newlines instead of showing them as `0A`
- 🐛 Removed `[HEX]` prefix that made copying hex data annoying
- 🐛 No longer requires disconnect/reconnect to toggle hex mode

### Changed

- Hex mode now shows ONLY raw hex bytes in continuous stream
- Hex bytes display as: `FF A2 3A 4F AD ...` (no text interpretation)
- Line buffer automatically cleared when switching between ASCII/hex modes
- Mode switching is instant and seamless

## [1.1.2] - 2025-10-24 - ANSI Color Support

### Fixed

- 🎨 ANSI color codes from serial devices not displaying properly
- Colors from devices (like colored log output) now render correctly in the terminal

### Changed

- Disabled EOL conversion (`convertEol: false`) in xterm.js to preserve raw ANSI escape sequences
- Terminal now handles data more like a raw terminal (similar to PuTTY)

## [1.1.1] - 2025-10-24 - Bug Fixes

### Fixed

- 🐛 Timestamps appearing in the middle of lines - now only applied to complete lines
- 🐛 Line numbers counting data fragments instead of complete lines
- 🐛 Proper line buffering for serial data to prevent formatting mid-word

### Changed

- Implemented line buffering system to accumulate incomplete data before processing
- Timestamps and line numbers now apply only to complete lines (ending with newline)
- Buffer automatically clears on terminal clear and new connection

## [1.1.0] - 2025-10-24 - PWA Update

### Added

- 📱 Progressive Web App (PWA) support - BattleTerm can now be installed as a standalone application
- 🎯 Fullscreen mode when installed as PWA - removes navigation and header for dedicated terminal experience
- 📐 Minimum window size constraints (800x600) to prevent UI issues
- ✨ Enhanced viewport configuration for optimal PWA display
- 🔧 Standalone mode detection for iOS, Android, and desktop platforms

### Changed

- Terminal page now renders fullscreen when launched as installed PWA app
- Navigation and footer hidden in standalone/PWA mode for distraction-free experience
- Improved professional appearance when used as standalone app

## [1.0.0] - 2025-10-24 - Initial Release

### Added

- 🎉 First public release of BattleTerm
- ✨ Web Serial API integration for browser-based serial communication
- 🎨 Full ANSI color support with xterm.js terminal emulator
- ⚙️ Configurable baud rates (300 to 921600 baud)
- 🔧 Data bits, parity, and stop bits configuration
- 📝 Command history with up/down arrow navigation
- 💾 Download terminal logs to file
- 📊 Real-time TX/RX activity indicators
- 🔍 ASCII and Hex view modes
- 📋 Copy/paste support (Ctrl+C/Ctrl+V and context menu)
- ⏱️ Optional timestamps for debugging
- 🧮 Optional line numbers
- 📈 Connection statistics (bytes sent/received, transfer rates)
- 🎯 Local echo option for sent commands
- 🌐 No installation required - runs directly in browser
- 🔌 Support for Chrome, Edge, and Opera browsers
- 📱 Responsive design for mobile and desktop
- 🎭 Animated ASCII art welcome screen
- ❓ Comprehensive help modal with feature list
- 💚 Clean terminal UI with colorful theme

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
