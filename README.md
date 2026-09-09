# Viral Radio — Real Caster.fm Streaming

This version removes the duplicated HTML/JavaScript that caused the Play button error.

## Activate the real Caster.fm stream
1. In Caster.fm, open your station's Streams / Broadcasting area and copy the real **Stream URL**.
2. In Vercel → Project → Settings → Environment Variables, create:
   - Name: `CASTER_STREAM_URL`
   - Value: your real Caster.fm stream URL
   - Enable Production (and Preview if you test there)
3. Redeploy.

The Play button then starts the real Caster.fm stream. Listener counts are sent only while the browser audio is actually playing. No random/demo listeners are generated.

If Caster.fm is off-air or the URL is wrong, the player reports the real playback error instead of fabricating a stream.
