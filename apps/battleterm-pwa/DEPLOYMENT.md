# BattleTerm PWA Deployment Guide

## Quick Start

```bash
# From monorepo root
pnpm install
pnpm --filter @battlewithbytes/battleterm-pwa build
```

The static files will be in `apps/battleterm-pwa/out/`

## Deployment Options

### 1. GitHub Pages

```bash
# Build the app
pnpm --filter @battlewithbytes/battleterm-pwa build

# Deploy (requires gh-pages package)
cd apps/battleterm-pwa
npx gh-pages -d out
```

### 2. Netlify

**Option A: Drag & Drop**
1. Build the app: `pnpm --filter @battlewithbytes/battleterm-pwa build`
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `out` folder

**Option B: CLI**
```bash
npm install -g netlify-cli
pnpm --filter @battlewithbytes/battleterm-pwa build
cd apps/battleterm-pwa
netlify deploy --prod --dir=out
```

### 3. Vercel

```bash
npm install -g vercel
cd apps/battleterm-pwa
vercel --prod
```

### 4. AWS S3 + CloudFront

```bash
# Build
pnpm --filter @battlewithbytes/battleterm-pwa build

# Upload to S3 (requires AWS CLI)
cd apps/battleterm-pwa
aws s3 sync out/ s3://your-bucket-name --delete

# Configure CloudFront for HTTPS (required for Web Serial API)
```

### 5. Self-Hosted (nginx)

```bash
# Build
pnpm --filter @battlewithbytes/battleterm-pwa build

# Copy to web server
scp -r apps/battleterm-pwa/out/* user@server:/var/www/battleterm/

# nginx configuration
server {
    listen 443 ssl http2;
    server_name battleterm.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/battleterm;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # PWA headers
    location /manifest.json {
        add_header Content-Type application/manifest+json;
    }

    # Service worker
    location /sw.js {
        add_header Cache-Control "no-cache";
    }
}
```

## Important Requirements

### HTTPS is Required
The Web Serial API requires a secure context (HTTPS). Your deployment must use HTTPS for the serial functionality to work.

### Browser Requirements
- Chrome 89+ / Edge 89+ / Opera 76+
- Web Serial API enabled (usually enabled by default)

### Service Worker
The PWA features require a service worker. Most static hosts serve service workers correctly by default.

## Testing Locally

```bash
# Development server
pnpm --filter @battlewithbytes/battleterm-pwa dev

# Test production build locally
pnpm --filter @battlewithbytes/battleterm-pwa build
cd apps/battleterm-pwa/out
npx serve
```

## Environment Variables

This app doesn't require any environment variables by default. If you need to add API endpoints or configuration:

1. Create `.env.local` (not committed to git)
2. Prefix variables with `NEXT_PUBLIC_` to expose them to the browser
3. Reference them in code: `process.env.NEXT_PUBLIC_API_URL`

## Custom Domain Setup

### Netlify
1. Go to Site settings > Domain management
2. Add custom domain
3. Configure DNS (A record or CNAME)

### Vercel
1. Go to Project settings > Domains
2. Add domain
3. Update DNS records as instructed

### GitHub Pages
1. Add `CNAME` file to `public/` directory with your domain
2. Update DNS to point to GitHub Pages
3. Enable HTTPS in repository settings

## Troubleshooting

### Web Serial API not available
- Ensure you're using HTTPS
- Check browser compatibility
- Verify browser flags (usually not needed)

### PWA not installing
- Check manifest.json is accessible
- Verify icons exist at specified paths
- Ensure HTTPS is enabled
- Check browser console for errors

### Build fails
- Verify all dependencies are installed: `pnpm install`
- Check TypeScript errors: `pnpm --filter @battlewithbytes/battleterm-pwa lint`
- Ensure BattleTerm package is built: `pnpm --filter @battlewithbytes/battleterm build`

## Monitoring

Consider adding analytics to track PWA usage:

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Updates

To deploy updates:

1. Update version in `package.json`
2. Rebuild: `pnpm --filter @battlewithbytes/battleterm-pwa build`
3. Deploy using your chosen method
4. Users will get the update on next visit (or via service worker update)
