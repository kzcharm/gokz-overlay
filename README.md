# GOKZ Overlay

A Game State Integration (GSI) overlay for GOKZ, deployed on Cloudflare Workers.

**Original Author:** [Sikarii](https://github.com/Sikarii)

This version has been ported to Cloudflare Workers, so you don't need to set up GSI Server or download static files on your own. Just download the configuration file and place it in your CS:GO `cfg/` folder

## User Setup

1. Download `gamestate_integration_gokz_overlay.cfg` from the root of this repository
2. Place it in your CS:GO `cfg/` folder:
3. Restart CS:GO

That's it! The overlay will work automatically.

## Developer Setup

If you want to deploy your own instance:

1. Install dependencies:
```bash
npm install
```

2. Build static assets:
```bash
npm run build:static
```

## Development

Run the development server:
```bash
npm run dev
```

## Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

Make sure you have:
- Cloudflare account configured with `wrangler login`
- Durable Objects enabled in your Cloudflare plan (free tier supports SQLite-based Durable Objects)

## Architecture

- **Main Worker** (`src/index.ts`): Handles HTTP routes and WebSocket routing
- **Durable Object** (`src/websocket-manager.ts`): Manages WebSocket connections per SteamID
- **Static Assets**: Bundled into the Worker at build time

## Routes

- `POST /` - Receives GSI data from CS:GO
- `GET /{steamid}` - Serves the overlay HTML page
- `GET /ws/{steamid}` - WebSocket endpoint for real-time updates
- Static files: `/js/*`, `/css/*`, `/conf/*`, `/assets/*`

