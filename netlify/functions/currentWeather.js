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

// netlify/functions/currentWeather.js
export async function handler(event) {
  const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

  if (isRateLimited(clientIP)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: "Too many requests. Please try again later." }),
    };
  }

  const { lat, lon } = event.queryStringParameters;

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing lat or lon parameter" }),
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.VITE_OPENWEATHER_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ main: null, id: null, sunrise: null, sunset: null }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        main: data.weather?.[0]?.main ?? null,
        id: typeof data.weather?.[0]?.id === "number" ? data.weather[0].id : null,
        sunrise: typeof data.sys?.sunrise === "number" ? data.sys.sunrise : null,
        sunset: typeof data.sys?.sunset === "number" ? data.sys.sunset : null,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
