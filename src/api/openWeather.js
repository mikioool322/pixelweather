/**
 * Fetch current weatherMain (e.g. 'Rain', 'Snow', etc.) for given coordinates
 * @param {number} lat
 * @param {number} lon
 * @param {string} apiKey
 * @returns {Promise<{main: string|null, id: number|null, sunrise: number|null, sunset: number|null}>}
 */
export async function fetchCurrentWeatherMain(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return { main: null, id: null, sunrise: null, sunset: null };
  const data = await res.json();
  return {
    main: data.weather && data.weather[0] && data.weather[0].main ? data.weather[0].main : null,
    id: data.weather && data.weather[0] && typeof data.weather[0].id === 'number' ? data.weather[0].id : null,
    sunrise: typeof data.sys?.sunrise === 'number' ? data.sys.sunrise : null,
    sunset: typeof data.sys?.sunset === 'number' ? data.sys.sunset : null,
  };
}
// src/api/openWeather.js
// Utility for fetching weather data from OpenWeatherMap API

const API_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch weather data for a city
 * @param {string} city - City name
 * @param {string} apiKey - OpenWeatherMap API key
 * @param {string} units - 'metric' or 'imperial'
 * @returns {Promise<{current: any, hourly: any[], daily: any[]}>}
 */
export async function fetchWeather(city, apiKey, units = 'metric') {
  // Get coordinates for city
  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`);
  const geo = await geoRes.json();
  if (!geo[0]) throw new Error('City not found');
  const { lat, lon } = geo[0];

  // Fetch One Call weather data (v3.0 or v2.5/onecall)
  const res = await fetch(`${API_BASE}/onecall?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}&lang=pl`);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  return {
    current: data.current,
    hourly: data.hourly,
    daily: data.daily,
    timezone: data.timezone,
  };
}
