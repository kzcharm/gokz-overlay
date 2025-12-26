from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import json

app = FastAPI()

app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
app.mount("/js", StaticFiles(directory="static/js"), name="js")
app.mount("/css", StaticFiles(directory="static/css"), name="css")
app.mount("/conf", StaticFiles(directory="static/conf"), name="conf")

# Maps steamid (string) -> set of WebSockets
connections: dict[str, set[WebSocket]] = {}

@app.post("/")
async def receive_gsi(request: Request):
    try:
        data = await request.json()
        
        # 1. Extract provider data
        provider = data.get("provider", {})
        
        # 2. Get the SteamID64.
        # We cast to str() to ensure it matches the WebSocket key format
        # even if the JSON parser treats it as a number.
        steamid = str(provider.get("steamid"))

        # If the GSI payload doesn't contain a steamid, we can't route it.
        if not steamid or steamid == "None":
            return {"error": "No steamid found in provider"}

        message = json.dumps(data)

        # 3. Broadcast only to listeners for this specific SteamID64
        if steamid in connections:
            for ws in connections[steamid].copy():
                try:
                    await ws.send_text(message)
                except Exception:
                    connections[steamid].discard(ws)

        return {"status": "ok", "steamid": steamid}

    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws/{steamid}")
async def websocket_endpoint(websocket: WebSocket, steamid: str):
    """
    Clients connect to /ws/76561198xxxxxxxxx
    """
    await websocket.accept()
    connections.setdefault(steamid, set()).add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if steamid in connections:
            connections[steamid].discard(websocket)
            if not connections[steamid]:
                del connections[steamid]

@app.get("/{steamid}", response_class=HTMLResponse)
async def serve_overlay(steamid: str):
    """
    Serves the overlay. The frontend JS can extract the 'steamid' 
    from the URL (window.location.pathname) to connect to the correct WebSocket.
    """
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            html = f.read()
        return HTMLResponse(content=html)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Error: static/index.html not found</h1>", status_code=404)
    