// Real listener counter for Vercel.
// A listener exists only while their browser's audio player is actually playing
// and sending a heartbeat. No random/demo numbers are generated.

const clients = globalThis.__viralRadioClients || (globalThis.__viralRadioClients = new Map());
const TTL_SECONDS = 45;

async function redis(command) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error('Redis request failed');
  return (await r.json()).result;
}

function hasRedis() {
  return Boolean(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL);
}

function clientId(req, body = {}) {
  const supplied = String(body.id || '').trim();
  if (supplied) return supplied.slice(0, 180);
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ua = String(req.headers['user-agent'] || '');
  return `${forwarded}|${ua.slice(0,120)}`;
}

function json(res, status, data) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.status(status).json(data);
}

async function redisStats(now) {
  let cursor = '0';
  let count = 0;
  do {
    const result = await redis(['SCAN', cursor, 'MATCH', 'viral-radio:listener:*', 'COUNT', '1000']);
    cursor = String(result[0]);
    const keys = result[1] || [];
    if (keys.length) {
      const values = await redis(['MGET', ...keys]);
      count += values.filter(v => v && now - Number(v) <= TTL_SECONDS * 1000).length;
    }
  } while (cursor !== '0');

  const peakKey = 'viral-radio:peak';
  const oldPeak = Number(await redis(['GET', peakKey])) || 0;
  if (count > oldPeak) await redis(['SET', peakKey, String(count)]);
  return { listeners: count, peak: Math.max(count, oldPeak) };
}

function memoryStats(now) {
  for (const [k, t] of clients) if (now - t > TTL_SECONDS * 1000) clients.delete(k);
  const count = clients.size;
  const oldPeak = Number(globalThis.__viralRadioPeak || 0);
  globalThis.__viralRadioPeak = Math.max(oldPeak, count);
  return { listeners: count, peak: globalThis.__viralRadioPeak };
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  const now = Date.now();

  try {
    if (req.method === 'GET') {
      const stats = hasRedis() ? await redisStats(now) : memoryStats(now);
      return json(res, 200, { ...stats, source: 'real-player-heartbeats' });
    }

    let body = {};
    try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); } catch (_) {}
    const id = clientId(req, body);
    const active = body.active !== false;

    if (hasRedis()) {
      const key = `viral-radio:listener:${Buffer.from(id).toString('base64url').slice(0,160)}`;
      if (active) await redis(['SET', key, String(now), 'EX', TTL_SECONDS]);
      else await redis(['DEL', key]);
      const stats = await redisStats(now);
      return json(res, 200, { ...stats, source: 'real-player-heartbeats' });
    }

    if (active) clients.set(id, now); else clients.delete(id);
    const stats = memoryStats(now);
    return json(res, 200, { ...stats, source: 'real-player-heartbeats-memory' });
  } catch (_) {
    return json(res, 503, { error: 'Listener store unavailable' });
  }
}
