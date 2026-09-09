# Viral Radio — Real Listener Monitoring

This build uses real player heartbeats only. It does **not** generate demo/random listener numbers.

## Required
Set the real audio stream URL in `index.html`:

```js
const STREAM_URL = "https://YOUR-REAL-STREAM/stream.mp3";
```

A listener is counted only after the visitor presses Play and the browser successfully starts the real stream. The browser sends a heartbeat every 15 seconds; inactive listeners expire after 45 seconds.

For Vercel production, configure Upstash/Vercel KV with `KV_REST_API_URL` and `KV_REST_API_TOKEN` so the count is shared between serverless instances. Without Redis, the fallback is per-instance memory and may undercount; it never fabricates traffic.
