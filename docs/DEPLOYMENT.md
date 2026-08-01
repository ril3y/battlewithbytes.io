# Deployment Guide

This guide covers deploying the BattleWithBytes.io monorepo applications to Vercel with subdomain configurations.

## Overview

The monorepo contains multiple Next.js applications that are deployed as static sites to individual Vercel projects, each mapped to a subdomain:

| Application | Subdomain | Package Name |
|------------|-----------|--------------|
| BattleTerm | battleterm.battlewithbytes.io | `@battlewithbytes/battleterm-app` |
| UCAN | ucan.battlewithbytes.io | `@battlewithbytes/ucan` |
| BattleForge | battleforge.battlewithbytes.io | `@battlewithbytes/battleforge` |
| BattleMagic | battlemagic.battlewithbytes.io | `@battlewithbytes/battlemagic` |
| MOSFET Calculator | mosfet.battlewithbytes.io | `@battlewithbytes/mosfet-calculator` |
| Ohm's Law Calculator | ohms.battlewithbytes.io | `@battlewithbytes/ohms-law-calculator` |
| WireMapper | wirewizard.battlewithbytes.io | `@battlewithbytes/wirewizard` |

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm i -g vercel`
3. **Domain**: Ownership of `battlewithbytes.io` domain
4. **Git Repository**: GitHub/GitLab/Bitbucket repository

## Vercel Project Setup

### Method 1: Using Vercel Dashboard (Recommended)

For each application, you'll need to create a separate Vercel project:

#### 1. BattleTerm

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure the project:
   - **Project Name**: `battleterm-battlewithbytes`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/battleterm`
   - **Build Command**: `cd ../.. && pnpm turbo build --filter=@battlewithbytes/battleterm-app`
   - **Output Directory**: `out`
   - **Install Command**: `cd ../.. && pnpm install`
5. Click "Deploy"

#### 2. UCAN

1. Create a new project
2. Import the same repository
3. Configure:
   - **Project Name**: `ucan-battlewithbytes`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/ucan`
   - **Build Command**: `cd ../.. && pnpm turbo build --filter=@battlewithbytes/ucan`
   - **Output Directory**: `out`
   - **Install Command**: `cd ../.. && pnpm install`
4. Click "Deploy"

#### 3. BattleForge

1. Create a new project
2. Import the same repository
3. Configure:
   - **Project Name**: `battleforge-battlewithbytes`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/battleforge`
   - **Build Command**: `cd ../.. && pnpm turbo build --filter=@battlewithbytes/battleforge`
   - **Output Directory**: `out`
   - **Install Command**: `cd ../.. && pnpm install`
4. Click "Deploy"

#### 4. BattleMagic

1. Create a new project
2. Import the same repository
3. Configure:
   - **Project Name**: `battlemagic-battlewithbytes`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/battlemagic`
   - **Build Command**: `cd ../.. && pnpm turbo build --filter=@battlewithbytes/battlemagic`
   - **Output Directory**: `out`
   - **Install Command**: `cd ../.. && pnpm install`
4. Click "Deploy"

#### 5. MOSFET Calculator

1. Create a new project
2. Import the same repository
3. Configure:
   - **Project Name**: `mosfet-calculator-battlewithbytes`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/mosfet-calculator`
   - **Build Command**: `cd ../.. && pnpm turbo build --filter=@battlewithbytes/mosfet-calculator`
   - **Output Directory**: `out`
   - **Install Command**: `cd ../.. && pnpm install`
4. Click "Deploy"

#### 6. Ohm's Law Calculator

1. Create a new project
2. Import the same repository
3. Configure:
   - **Project Name**: `ohms-law-calculator-battlewithbytes`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/ohms-law-calculator`
   - **Build Command**: `cd ../.. && pnpm turbo build --filter=@battlewithbytes/ohms-law-calculator`
   - **Output Directory**: `out`
   - **Install Command**: `cd ../.. && pnpm install`
4. Click "Deploy"

#### 7. Wire Wizard

Wire Wizard ships inside the main web app (`packages/wire-wizard`, rendered
at `/tools/wire-wizard`), so it needs no separate deployment.

### Method 2: Using Vercel CLI

You can also deploy using the Vercel CLI from each app directory:

```bash
# Navigate to the app directory
cd apps/battleterm

# Deploy
vercel --prod
```

The `vercel.json` file in each app directory will automatically configure the build settings.

## DNS Configuration

After creating the Vercel projects, you need to configure DNS for each subdomain.

### For Each Subdomain:

1. Go to your Vercel project's **Settings** → **Domains**
2. Add the custom domain (e.g., `battleterm.battlewithbytes.io`)
3. Vercel will provide DNS records to add

### DNS Records (at your DNS provider)

For each subdomain, add a CNAME record:

| Type | Name | Value |
|------|------|-------|
| CNAME | battleterm | cname.vercel-dns.com |
| CNAME | ucan | cname.vercel-dns.com |
| CNAME | battleforge | cname.vercel-dns.com |
| CNAME | battlemagic | cname.vercel-dns.com |
| CNAME | mosfet | cname.vercel-dns.com |
| CNAME | ohms | cname.vercel-dns.com |
| CNAME | wirewizard | cname.vercel-dns.com |

**Alternative**: If Vercel provides specific CNAME values for each project, use those instead of the generic `cname.vercel-dns.com`.

### SSL/TLS

Vercel automatically provisions SSL certificates for all custom domains. This process typically takes a few minutes after DNS records are configured.

## Environment Variables

### Required for All Apps

None of the apps currently require environment variables for basic functionality. However, if you add analytics, monitoring, or other services, configure them per project:

1. Go to **Project Settings** → **Environment Variables**
2. Add variables for Production, Preview, and Development as needed

### Common Environment Variables (if needed)

```env
# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_FEATURE_X=true

# API Endpoints (if applicable)
NEXT_PUBLIC_API_URL=https://api.battlewithbytes.io
```

## Build Configuration

Each app uses:

- **Framework**: Next.js 15.3.0
- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Output**: Static Export (`output: 'export'`)

### Special Build Considerations

#### BattleForge & BattleMagic (WASM Apps)

These apps use WebAssembly modules:

- WASM files are output to `/static/wasm/` directory
- Custom headers ensure proper MIME type (`application/wasm`)
- Cache headers set for optimal performance

The build process includes a `prebuild` script that copies necessary data files.

#### UCAN & BattleMagic (Web Serial API)

These apps use the Web Serial API:

- `Permissions-Policy: serial=(self)` header is set
- Requires HTTPS (automatically provided by Vercel)

## Deployment Workflow

### Automatic Deployments

Vercel automatically deploys on:

- **Production**: Pushes to the `main` branch
- **Preview**: Pull requests and pushes to other branches

### Manual Deployments

Using Vercel CLI:

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Deployment from CI/CD

Add Vercel tokens to your CI/CD pipeline:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (use VERCEL_TOKEN environment variable)
vercel --token=$VERCEL_TOKEN --prod
```

## Monitoring Deployments

### Vercel Dashboard

- View deployment status: [vercel.com/dashboard](https://vercel.com/dashboard)
- Check build logs for errors
- Monitor performance metrics

### Deployment Checks

After deployment, verify:

1. Site loads correctly at the subdomain
2. All assets (CSS, JS, images) load properly
3. WASM modules load (for BattleForge/BattleMagic)
4. Web Serial API works (for UCAN/BattleMagic)
5. No console errors in browser DevTools

## Troubleshooting

### Build Failures

**Issue**: "Module not found" errors
- **Solution**: Ensure all workspace dependencies are properly linked in `package.json`
- Check that the build command includes `cd ../..` to run from monorepo root

**Issue**: WASM build failures (BattleForge/BattleMagic)
- **Solution**: Ensure WASM files exist in the package before build
- Check that `build:wasm` task completed successfully
- Verify `prebuild` scripts executed

### DNS Issues

**Issue**: "Domain not found" or SSL errors
- **Solution**: Wait up to 48 hours for DNS propagation
- Verify CNAME records are correct
- Check that domain isn't set to "DNS Only" mode in DNS provider

**Issue**: SSL certificate not provisioning
- **Solution**: Ensure DNS is fully propagated
- Remove and re-add the domain in Vercel
- Check for CAA DNS records that might block Let's Encrypt

### Runtime Issues

**Issue**: 404 errors on page routes
- **Solution**: Verify `output: 'export'` is set in `next.config.js`
- Check that `outputDirectory` is set to `out` in `vercel.json`

**Issue**: WASM modules not loading
- **Solution**: Verify headers in `vercel.json` include proper `Content-Type: application/wasm`
- Check browser console for MIME type errors
- Ensure WASM files are in the output directory

**Issue**: Web Serial API not working
- **Solution**: Verify site is served over HTTPS
- Check `Permissions-Policy` header is set correctly
- Ensure user is using a compatible browser (Chrome, Edge)

## Performance Optimization

### Caching Strategy

Vercel automatically handles caching, but you can optimize:

1. **Static Assets**: Automatically cached with immutable headers
2. **WASM Files**: Custom cache headers set for 1 year
3. **HTML Pages**: Cached based on Next.js configuration

### Build Optimization

1. **Turborepo Caching**: Enabled by default, speeds up rebuilds
2. **Remote Caching**: Consider enabling Vercel Remote Cache for team workflows
3. **Incremental Static Regeneration**: Not used (static export mode)

## Security Headers

All apps include security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

Additional headers for specific apps:

- **UCAN/BattleMagic**: `Permissions-Policy: serial=(self)`

## Rollback Procedure

To rollback a deployment:

1. Go to the project in Vercel Dashboard
2. Navigate to **Deployments**
3. Find the previous working deployment
4. Click "..." → "Promote to Production"

Or use Vercel CLI:

```bash
vercel rollback
```

## Cost Considerations

- **Hobby Plan**: Free for personal projects, includes:
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS

- **Pro Plan**: $20/month per member, includes:
  - Unlimited bandwidth
  - Advanced analytics
  - Team collaboration features

With 7 separate projects, you'll have 7 Vercel projects under your account.

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Turborepo + Vercel Guide](https://turbo.build/repo/docs/handbook/deploying-with-docker)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Checklist

Before going live, ensure:

- [ ] All 7 Vercel projects created
- [ ] DNS CNAME records configured for all subdomains
- [ ] SSL certificates provisioned
- [ ] Production deployments successful
- [ ] All sites accessible via HTTPS
- [ ] No console errors in production
- [ ] WASM modules loading correctly (BattleForge, BattleMagic)
- [ ] Web Serial API working (UCAN, BattleMagic)
- [ ] Performance metrics acceptable
- [ ] Security headers verified

## Maintenance

### Regular Updates

1. Update dependencies regularly
2. Monitor Vercel dashboard for security alerts
3. Review build logs for warnings
4. Test new deployments in preview mode before promoting

### Monitoring

Consider integrating:

- Analytics (Vercel Analytics, Google Analytics, Plausible)
- Error tracking (Sentry)
- Performance monitoring (Vercel Speed Insights)
- Uptime monitoring (UptimeRobot, Pingdom)
