# BattleTerm PWA

Standalone Progressive Web App (PWA) version of BattleTerm - a professional browser-based serial terminal with ANSI support and Web Serial API integration.

## Overview

This is the standalone PWA application that provides BattleTerm as a fullscreen, installable web application. It uses the `@battlewithbytes/battleterm` package from the monorepo workspace.

## Features

- **Fullscreen Terminal Interface**: Optimized for use as a standalone application
- **PWA Support**: Installable on desktop and mobile devices
- **Offline Capable**: Works without internet connection once installed
- **Web Serial API**: Direct hardware serial communication support
- **ANSI Support**: Full terminal emulation with xterm.js
- **Static Export**: Builds to static files for easy deployment

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run development server
pnpm --filter @battlewithbytes/battleterm-pwa dev

# Build for production
pnpm --filter @battlewithbytes/battleterm-pwa build

# Export static files
pnpm --filter @battlewithbytes/battleterm-pwa export
```

## Deployment

The app is configured for static export and can be deployed to any static hosting service:

1. Run `pnpm build` to create the production build
2. The `out` directory will contain the static files
3. Deploy the `out` directory to your hosting service

Compatible hosting platforms:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any static file host

## Configuration

### PWA Manifest

The PWA configuration is in `public/manifest.json`. Key settings:

- **Theme Color**: `#10b981` (emerald green)
- **Background Color**: `#000000` (black)
- **Display Mode**: `standalone`
- **Icons**: 192x192 and 512x512 PNG icons

### Next.js Configuration

The app uses `output: 'export'` in `next.config.js` for static site generation. This enables deployment to static hosts without requiring a Node.js server.

## Browser Requirements

- Modern browser with Web Serial API support (Chrome, Edge, Opera)
- HTTPS connection (required for Web Serial API)
- Service Worker support for PWA features

## Architecture

This app is part of the BattleWithBytes monorepo:

```
apps/battleterm-pwa/          # This PWA app
├── src/
│   └── app/
│       ├── layout.tsx        # Root layout with PWA metadata
│       ├── page.tsx          # Main page with BattleTerm component
│       └── globals.css       # Global styles
├── public/
│   └── manifest.json         # PWA manifest
└── package.json              # Dependencies

packages/battleterm/          # Core BattleTerm component
└── src/
    └── components/
        └── BattleTerm.tsx    # Terminal component used by this app
```

## Version

Current version: **1.2.2**

This version is synchronized with the `@battlewithbytes/battleterm` package version.

## License

Part of the BattleWithBytes project.
