# Viral Radio — fixed buttons + real listener monitoring

This version repairs the broken/duplicate HTML and makes the navigation, Play, Vote,
Request, Top 10, News and Follow buttons respond.

## Real listener rule
The listener counter is **not fake**. A listener is counted only after the site's
real audio player successfully starts and sends heartbeats. No random numbers are generated.

## Caster.fm
The ZIP intentionally does **not** invent a stream URL. Before Play can start a
Caster.fm stream through the site's own audio player, set this line in `index.html`:

```js
const STREAM_URL = "YOUR_REAL_CASTER_FM_STREAM_URL";
```

You can also configure the official Caster.fm widget by replacing its Public Token
and Channel ID placeholders.

## Vercel / Redis
For a shared production listener counter, configure Upstash/Vercel Redis with:
`KV_REST_API_URL` and `KV_REST_API_TOKEN` (or the corresponding `UPSTASH_REDIS_REST_*` variables).

Without Redis, the API uses per-instance memory and can undercount across Vercel
instances. It never fabricates listeners.

## Important
Votes and requests in this lightweight build use server memory. For permanent/global
storage, connect the existing endpoints to Redis or another database.
