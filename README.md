# GoKZ Overlay - Cloudflare Workers

A Game State Integration (GSI) overlay for GoKZ, deployed on Cloudflare Workers.

## Setup

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
- Durable Objects enabled in your Cloudflare plan

## Architecture

- **Main Worker** (`src/index.ts`): Handles HTTP routes and WebSocket routing
- **Durable Object** (`src/websocket-manager.ts`): Manages WebSocket connections per SteamID
- **Static Assets**: Bundled into the Worker at build time

## Routes

- `POST /` - Receives GSI data from CS:GO/CS2
- `GET /{steamid}` - Serves the overlay HTML page
- `GET /ws/{steamid}` - WebSocket endpoint for real-time updates
- Static files: `/js/*`, `/css/*`, `/conf/*`, `/assets/*`

