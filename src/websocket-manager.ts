export class WebSocketManager implements DurableObject {
  private connections: Set<WebSocket> = new Set();
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle broadcast POST request
    if (request.method === "POST" && url.pathname === "/broadcast") {
      const message = await request.text();
      await this.broadcast(message);
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle WebSocket upgrade
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket connection
    this.handleSession(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private handleSession(ws: WebSocket): void {
    // Accept the WebSocket connection
    ws.accept();

    // Add to connections set
    this.connections.add(ws);

    // Handle messages (we don't need to process them, just keep connection alive)
    ws.addEventListener("message", () => {
      // Echo or ignore - we're just broadcasting from POST requests
    });

    // Handle close/error
    ws.addEventListener("close", () => {
      this.connections.delete(ws);
    });

    ws.addEventListener("error", () => {
      this.connections.delete(ws);
    });
  }

  async broadcast(message: string): Promise<void> {
    // Broadcast to all connected WebSockets
    const deadConnections: WebSocket[] = [];

    for (const ws of this.connections) {
      try {
        ws.send(message);
      } catch (error) {
        // Connection is dead, mark for removal
        deadConnections.push(ws);
      }
    }

    // Clean up dead connections
    for (const ws of deadConnections) {
      this.connections.delete(ws);
    }
  }
}

interface Env {
  WEBSOCKET_MANAGER: DurableObjectNamespace<WebSocketManager>;
}

