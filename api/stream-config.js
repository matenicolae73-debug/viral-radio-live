export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const streamUrl = String(process.env.CASTER_STREAM_URL || "").trim();
  res.status(200).json({ streamUrl });
}
