// Simple in-memory rate limiting per IP
const rateLimitMap = new Map();
const MAX_REQUESTS = 10; // per minute
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const requests = rateLimitMap.get(ip);
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < WINDOW_MS);
  rateLimitMap.set(ip, validRequests);
  if (validRequests.length >= MAX_REQUESTS) {
    return true;
  }
  validRequests.push(now);
  return false;
}

export async function handler(event) {
  const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

  if (isRateLimited(clientIP)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: "Too many requests. Please try again later." }),
    };
  }

  const { city } = event.queryStringParameters;

  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "City parameter is required" }),
    };
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${process.env.VITE_OPENWEATHER_API_KEY}`
    );

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
