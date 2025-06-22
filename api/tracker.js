export default async function handler(req, res) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;
  const ua = req.headers["user-agent"];

  if (ua && ua.includes("vercel-screenshot")) {
    return res.status(204).end(); // skip bot
  }

  try {
    const geoRes = await fetch(`https://ipwhois.app/json/${ip}`);
    const geo = await geoRes.json();

    const data = {
      ip,
      userAgent: ua,
      location: `${geo.city}, ${geo.region}, ${geo.country}`,
      isp: geo.org,
      time: new Date().toISOString()
    };

    console.log("=== Visitor Tracked ===");
    console.log(data);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("GeoIP API Error:", err);
    res.status(500).json({ error: "Tracking failed" });
  }
}
