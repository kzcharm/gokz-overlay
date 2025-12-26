import { WebSocketManager } from "./websocket-manager";

// Export the Durable Object class so Cloudflare Workers can use it
export { WebSocketManager };

interface Env {
  WEBSOCKET_MANAGER: DurableObjectNamespace<WebSocketManager>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle POST / - GSI data receiver
    if (request.method === "POST" && path === "/") {
      return handleGSI(request, env);
    }

    // Handle GET / - show reminder to use /{steamid64}
    if (request.method === "GET" && path === "/") {
      return handleRoot(request);
    }

    // Handle WebSocket connections - /ws/{steamid}
    if (path.startsWith("/ws/")) {
      return handleWebSocket(request, env, path);
    }

    // Handle static files
    if (
      path.startsWith("/js/") ||
      path.startsWith("/css/") ||
      path.startsWith("/conf/") ||
      path.startsWith("/assets/")
    ) {
      return handleStaticFile(request, path);
    }

    // Handle GET /{steamid} - serve overlay HTML
    if (request.method === "GET" && path !== "/" && !path.includes(".")) {
      return handleOverlay(path);
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleGSI(request: Request, env: Env): Promise<Response> {
  try {
    const data = await request.json();

    // Extract provider data
    const provider = data.provider || {};

    // Get the SteamID64
    const steamid = String(provider.steamid || "");

    // If the GSI payload doesn't contain a steamid, we can't route it
    if (!steamid || steamid === "None") {
      return Response.json({ error: "No steamid found in provider" });
    }

    const message = JSON.stringify(data);

    // Get the Durable Object for this SteamID
    const id = env.WEBSOCKET_MANAGER.idFromName(steamid);
    const stub = env.WEBSOCKET_MANAGER.get(id);

    // Broadcast to all WebSocket connections for this SteamID via POST
    await stub.fetch(new Request("http://do/broadcast", {
      method: "POST",
      body: message,
    }));

    return Response.json({ status: "ok", steamid });
  } catch (error) {
    return Response.json({ error: String(error) });
  }
}

async function handleWebSocket(
  request: Request,
  env: Env,
  path: string
): Promise<Response> {
  // Extract steamid from path /ws/{steamid}
  const steamid = path.split("/ws/")[1];
  if (!steamid) {
    return new Response("Invalid WebSocket path", { status: 400 });
  }

  // Get the Durable Object for this SteamID
  const id = env.WEBSOCKET_MANAGER.idFromName(steamid);
  const stub = env.WEBSOCKET_MANAGER.get(id);

  // Forward the WebSocket upgrade request to the Durable Object
  return stub.fetch(request);
}

async function handleStaticFile(request: Request, path: string): Promise<Response> {
  // Import static assets
  const staticAssets = await import("./static-assets");

  // Remove leading slash
  const assetPath = path.slice(1);

  // Get the asset content
  const asset = staticAssets.getAsset(assetPath);

  if (!asset) {
    return new Response("Not Found", { status: 404 });
  }

  // Determine content type
  let contentType = "text/plain";
  if (path.endsWith(".js")) {
    contentType = "application/javascript";
  } else if (path.endsWith(".css")) {
    contentType = "text/css";
  } else if (path.endsWith(".html")) {
    contentType = "text/html";
  } else if (path.endsWith(".gif")) {
    contentType = "image/gif";
  } else if (path.endsWith(".png")) {
    contentType = "image/png";
  } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
    contentType = "image/jpeg";
  }

  // Return the asset
  if (asset instanceof ArrayBuffer || asset instanceof Uint8Array) {
    return new Response(asset, {
      headers: { "Content-Type": contentType },
    });
  }

  return new Response(asset, {
    headers: { "Content-Type": contentType },
  });
}

async function handleRoot(): Promise<Response> {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>GoKZ Overlay</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #1a1a1a;
      color: #ffffff;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: #2a2a2a;
      border-radius: 8px;
      max-width: 600px;
    }
    h1 {
      margin-top: 0;
      color: #4a9eff;
    }
    code {
      background: #1a1a1a;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      color: #4a9eff;
    }
    .example {
      margin: 1.5rem 0;
      padding: 1rem;
      background: #1a1a1a;
      border-radius: 4px;
      border-left: 3px solid #4a9eff;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>GoKZ Overlay</h1>
    <p>To access your overlay, please visit:</p>
    <div class="example">
      <code>/{your-steamid64}</code>
    </div>
    <p>Replace <code>{your-steamid64}</code> with your SteamID64.</p>
    <p><small>Example: <code>/76561198012345678</code></small></p>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

async function handleOverlay(path: string): Promise<Response> {
  // Extract steamid from path (remove leading slash)
  const steamid = path.slice(1);

  // Import static assets to get HTML
  const staticAssets = await import("./static-assets");
  const html = staticAssets.getAsset("index.html");

  if (!html || typeof html !== "string") {
    return new Response("<h1>Error: static/index.html not found</h1>", {
      status: 404,
    });
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

