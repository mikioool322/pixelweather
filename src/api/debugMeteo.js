// Utility to pretty-print the Open-Meteo API response for debugging
fetch('https://api.open-meteo.com/v1/forecast?latitude=52.2297&longitude=21.0122&current_weather=true&hourly=temperature_2m,apparent_temperature,weathercode,relative_humidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto')
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);