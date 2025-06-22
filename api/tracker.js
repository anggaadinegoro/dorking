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

    console.log("=== Visitor Tracked ===");
    console.log("IP:", ip);
    console.log("User Agent:", ua);
    console.log("Location:", `${geo.city}, ${geo.region}, ${geo.country}`);
    console.log("ISP:", geo.org);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("GeoIP API Error:", err);
    res.status(500).json({ error: "Tracking failed" });
  }
}
