# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (Next.js + Socket.io via custom server)
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Production build (verify no compile errors)
npm run build

# Start Python YOLO service (port 8000)
cd yolo-service && python main.py

# Install Python deps
cd yolo-service && pip install -r requirements.txt
```

There are no automated tests. The `npm run dev:next` script runs Next.js directly (no Socket.io) – only use this for UI work that doesn't need real-time features.

## Architecture

This is a **Proof of Concept** with two user-facing views:
- `app/page.tsx` – Customer view (camera stream, AI detection, queue, video call)
- `app/seller/page.tsx` – Seller dashboard (queue management, video call, cutting table camera)

### Real-time layer

**Socket.io requires a custom HTTP server** (`server.ts`). Next.js cannot attach Socket.io to its built-in server, so `server.ts` creates a Node `http.Server`, wraps Next.js as a request handler, then attaches Socket.io via `lib/socket-server.ts`. Both the `queueStore` and `socketServer` are singletons on `globalThis` to survive Next.js hot-reloads.

Socket.io path: `/api/socket`. The file at `app/api/socket/route.ts` is a stub that prevents Next.js from returning 404; the actual Socket.io upgrade is handled by the custom server.

### Queue flow

```
Customer POST /api/queue → ticket created in queueStore (in-memory)
Customer socket emits queue:join → ticket.socketId associated
Seller socket emits queue:call → customer notified via queue:called
Seller socket emits rtc:call → customer gets rtc:incoming-call
Customer emits rtc:accept → seller gets rtc:accepted → both startCall/answerCall
Both sides relay SDP/ICE via rtc:signal (server is pure relay)
Seller emits rtc:hangup → customer shows PaymentFlow
Customer emits payment:complete → seller gets payment:received
```

### AI detection pipeline

`useYOLO` (hook) captures a video frame to a hidden canvas every 1500ms → sends JPEG base64 to `POST /api/detect` → Next.js proxies to Python FastAPI at `:8000` → Python runs YOLOv8 → crops 70px below each bounding box for the price label → EasyOCR reads label text → `difflib.get_close_matches` fuzzy-matches against `labelKeywords` in `data/products.json` → normalized `[0-1]` bbox coordinates returned.

If the Python service is unreachable, `/api/detect` returns `{ detections: [], service_unavailable: true }` – the frontend degrades gracefully (no bounding boxes, all other features work).

The detector uses a position cache keyed on normalized bbox coordinates (rounded to 2 decimal places) to avoid re-running slow OCR for static scenes.

### WebRTC

`useWebRTC` wraps `simple-peer`. The caller sets `initiator: true`; the callee sets `initiator: false`. All SDP offers/answers and ICE candidates flow through Socket.io (`rtc:signal` events) – the server is a dumb relay. STUN only (`stun.l.google.com:19302`); for internet demos a TURN server (Metered.ca or Cloudflare Calls) is needed.

The hook takes `onSignal`/`offSignal` callback props instead of direct socket access to avoid re-render loops from unstable socket references.

### Camera sources

Controlled by `NEXT_PUBLIC_CAMERA_MODE` env var (`webcam` | `ip`). The `useCamera` hook handles both `getUserMedia` (webcam mode) and HLS via `hls.js` (IP camera mode). Cam 1 is used in the customer view; Cam 2 (cutting table) in the seller view.

### Key data

`data/products.json` – 8 cheese entries. Each entry's `labelKeywords` array drives OCR matching. To add a product, add an entry here and ensure the keywords cover likely OCR variants (accent variants, abbreviations).

### Adding new Socket.io events

1. Add handler in `lib/socket-server.ts` inside the `io.on('connection')` block
2. Add emitter method to `useSocket.ts`
3. Subscribe in the relevant page component via `socket.on(...)` inside a `useEffect`
