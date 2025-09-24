
// src/api/openMeteo.js
// Utility for fetching weather data from Open-Meteo API

/**
 * Fetch weather data for a city using Open-Meteo API
 * @param {string} city - City name
 * @param {string} units - 'metric' or 'imperial'
 * @returns {Promise<{current: any, hourly: any[], daily: any[]}>}
 */
import { fetchCurrentWeatherMain } from './openWeather';

export async function fetchMeteoWeather(city, units = 'metric') {
  // Get coordinates for city (use OpenWeather geocoding for simplicity)
  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`);
  const geo = await geoRes.json();
  if (!geo[0]) throw new Error('City not found');
  const { lat, lon, name, country, state } = geo[0];

  // Fetch sunrise/sunset from OpenWeather
  const sunInfo = await fetchCurrentWeatherMain(lat, lon, import.meta.env.VITE_OPENWEATHER_API_KEY);

  // Build Open-Meteo API URL
  const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
  const windUnit = units === 'imperial' ? 'mph' : 'kmh';
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&hourly=temperature_2m,apparent_temperature,weathercode,relative_humidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=${tempUnit}&windspeed_unit=${windUnit}&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();

  // Normalize data to match OpenMeteo structure only
  return {
    current: {
      temp: data.current_weather.temperature,
      feels_like: data.current_weather.temperature, // Open-Meteo does not provide apparent temp for current
      weathercode: data.current_weather.weathercode,
      is_day: data.current_weather.is_day,
      humidity: data.hourly.relative_humidity_2m[0],
      wind_speed: data.current_weather.windspeed,
      wind_direction: data.current_weather.winddirection,
      time: data.current_weather.time,
      sunrise: sunInfo.sunrise,
      sunset: sunInfo.sunset,
    },
    hourly: data.hourly.time.map((t, i) => ({
      dt: new Date(t).getTime() / 1000,
      temp: data.hourly.temperature_2m[i],
      feels_like: data.hourly.apparent_temperature[i],
      weathercode: data.hourly.weathercode[i],
      humidity: data.hourly.relative_humidity_2m[i],
      wind_speed: data.hourly.windspeed_10m[i],
      time: t,
    })),
    daily: data.daily.time.map((t, i) => ({
      dt: new Date(t).getTime() / 1000,
      temp: { max: data.daily.temperature_2m_max[i], min: data.daily.temperature_2m_min[i] },
      weathercode: data.daily.weathercode[i],
      time: t,
    })),
    timezone: data.timezone,
    geo: {
      lat: lat,
      lon: lon,
      name: name,
      country: country,
      state: state || null,
    },
  };
}
