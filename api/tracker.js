import UAParser from 'ua-parser-js';

export default async function handler(req, res) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;
  const ua = req.headers["user-agent"];
  const parser = new UAParser(ua);
  const result = parser.getResult();

  if (ua && ua.includes("vercel-screenshot")) {
    return res.status(204).end(); // skip screenshot bot
  }

  try {
    const geoRes = await fetch(`https://ipwhois.app/json/${ip}`);
    const geo = await geoRes.json();

    const visitorData = {
      timestamp: new Date().toISOString(),
      ip,
      location: `${geo.city}, ${geo.region}, ${geo.country}`,
      isp: geo.org,
      userAgent: ua,
      device: result.device.type || "desktop",
      browser: result.browser.name + " " + result.browser.version,
      os: result.os.name + " " + result.os.version
    };

    console.log("=== Visitor Tracked ===");
    console.log(visitorData);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("GeoIP API Error:", err);
    res.status(500).json({ error: "Tracking failed" });
  }
}
