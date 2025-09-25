import React, { useState } from 'react';
// Polish translation for weather groups
const weatherGroupPl = {
  clear: 'Bezchmurnie',
  mainlyClear: 'Prawie bezchmurnie',
  partlyCloudy: 'Częściowo pochmurno',
  overcast: 'Całkowite zachmurzenie',
  fog: 'Mgła',
  drizzle: 'Mżawka',
  freezingDrizzle: 'Marznąca mżawka',
  rain: 'Deszcz',
  freezingRain: 'Marznący deszcz',
  snow: 'Śnieg',
  snowGrains: 'Ziarnisty śnieg',
  rainShowers: 'Przelotne opady deszczu',
  snowShowers: 'Przelotne opady śniegu',
  thunder: 'Burza',
  thunderHail: 'Burza z gradem',
  night: 'Noc',
  other: 'Inne',
};
// Weather type to image mapping (placeholder paths)
const weatherTypeToImageDay = {
  clear: '/assets/weather/sun.gif',
  mainlyClear: '/assets/weather/sun-clouds-small.gif',
  partlyCloudy: '/assets/weather/sun-clouds-big.gif',
  overcast: '/assets/weather/clouds-big.gif',
  clouds: '/assets/weather/clouds-big.gif', // fallback for legacy
  fog: '/assets/weather/fog.gif',
  drizzle: '/assets/weather/cloud-rain.gif',
  freezingDrizzle: '/assets/weather/cloud-rain-snow.gif',
  rain: '/assets/weather/cloud-rain.gif',
  freezingRain: '/assets/weather/cloud-rain-snow.gif',
  snow: '/assets/weather/snow.gif',
  snowGrains: '/assets/weather/snow.gif',
  rainShowers: '/assets/weather/cloud-rain.gif',
  snowShowers: '/assets/weather/snow.gif',
  thunder: '/assets/weather/thunder.gif',
  thunderHail: '/assets/weather/thunder.gif',
  night: '/assets/weather/night.gif',
  other: '/assets/weather/other.gif',
};

const weatherTypeToImageNight = {
  clear: '/assets/weather/moon-clear.gif',
  mainlyClear: '/assets/weather/moon-clouds-small.gif',
  partlyCloudy: '/assets/weather/moon-clouds-big.gif',
  overcast: '/assets/weather/clouds-big.gif',
  clouds: '/assets/weather/clouds-big.gif', // fallback for legacy
  fog: '/assets/weather/fog.gif',
  drizzle: '/assets/weather/cloud-rain.gif',
  freezingDrizzle: '/assets/weather/cloud-rain-snow.gif',
  rain: '/assets/weather/cloud-rain.gif',
  freezingRain: '/assets/weather/cloud-rain-snow.gif',
  snow: '/assets/weather/snow.gif',
  snowGrains: '/assets/weather/snow.gif',
  rainShowers: '/assets/weather/cloud-rain.gif',
  snowShowers: '/assets/weather/snow.gif',
  thunder: '/assets/weather/thunder.gif',
  thunderHail: '/assets/weather/thunder.gif',
  night: '/assets/weather/night.gif',
  other: '/assets/weather/night_other.gif',
};
// Utility to normalize Polish characters
function normalizePolish(str) {
  if (!str) return str;
  return str
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/Ą/g, 'A')
    .replace(/Ć/g, 'C')
    .replace(/Ę/g, 'E')
    .replace(/Ł/g, 'L')
    .replace(/Ń/g, 'N')
    .replace(/Ó/g, 'O')
    .replace(/Ś/g, 'S')
    .replace(/Ź/g, 'Z')
    .replace(/Ż/g, 'Z');
}

import { fetchMeteoWeather } from './api/openMeteo';
import SunCalc from 'suncalc';

function App() {
  // Image loading states (must be inside function component)
  const [mainIconLoaded, setMainIconLoaded] = useState(false);
  const [errorIconLoaded, setErrorIconLoaded] = useState(false);
  // For hourly and daily, use arrays
  const [hourlyIconLoaded, setHourlyIconLoaded] = useState(Array(12).fill(false));
  const [dailyIconLoaded, setDailyIconLoaded] = useState(Array(6).fill(false));
  // Hide scrollbar utility
  const hideScrollbar = 'scrollbar-hide';

  // Enable mouse wheel horizontal scroll
  const onWheel = (e) => {
    if (sliderRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      sliderRef.current.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  // Drag-to-scroll logic for the hourly slider
  const sliderRef = React.useRef(null);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeft = React.useRef(0);

  const onPointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
    sliderRef.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2; // scroll speed
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const onPointerUp = (e) => {
    isDragging.current = false;
    sliderRef.current.releasePointerCapture(e.pointerId);
  };
  // Subtle slider background and scrollbar color per weather


  // Use weatherCodeId for color logic (OpenWeather code, e.g. 200, 500, 800)
  const [weatherCodeId, setWeatherCodeId] = useState(0); // default: clear (Open-Meteo)
  const [isNight, setIsNight] = useState(false);
  const [localTime, setLocalTime] = useState('');
  const [unit, setUnit] = useState('C');
  const [city, setCity] = useState('');
  // On first load, try to get user location via IP and fetch weather
  React.useEffect(() => {
    (async () => {
      await new Promise(res => setTimeout(res, 2000));
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const ip = await res.json();
        const data = await fetch(`https://ipwho.is/${ip.ip}`);
        const geoData = await data.json();
        if (geoData && geoData.city) {
          setCity(geoData.city);
          handleSearch(geoData.city);
        }
      } catch {}
    })();
    // eslint-disable-next-line
  }, []);
  const [weather, setWeather] = useState(null); // displayed (converted if needed)
  const [weatherRaw, setWeatherRaw] = useState(null); // always metric, for conversion
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geoInfo, setGeoInfo] = useState({ name: '', country: '', state: '' });

  // Allow handleSearch to take an optional city param (for auto-lookup)
  const handleSearch = async (cityOverride) => {
    const searchCity = cityOverride || city;
    if (!searchCity) return;
    setLoading(true);
    setError('');
    try {
      const units = unit === 'C' ? 'metric' : 'imperial';
      // Fetch weather and geo info in one go (geoRes is used inside fetchMeteoWeather)
      const data = await fetchMeteoWeather(searchCity, units);
      // Try to extract geo info from data (if fetchMeteoWeather returns it)
      if (data.geo && data.geo.name) {
        setGeoInfo({ name: data.geo.name, country: data.geo.country, state: data.geo.state || '' });
      } else {
        setGeoInfo({ name: searchCity, country: '', state: '' });
      }
      setWeather(data);
      setWeatherRaw(data);
      // Use Open-Meteo weathercode and is_day
      setWeatherCodeId(data.current.weathercode);
      setIsNight(data.current.is_day === 0);
      // Local time at location
      try {
        const tz = data.timezone || 'Europe/Warsaw';
        const local = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: tz });
        setLocalTime(local);
      } catch {
        setLocalTime('');
      }
    } catch (e) {
      setError(e.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };
  // Map Open-Meteo codes to color groups
  function getWeatherGroup(code) {
    if (code === 0) return 'clear';
    if (code === 1) return 'mainlyClear';
    if (code === 2) return 'partlyCloudy';
    if (code === 3) return 'overcast';
    if ([45,48].includes(code)) return 'fog';
    if ([51,53,55].includes(code)) return 'drizzle';
    if ([56,57].includes(code)) return 'freezingDrizzle';
    if ([61,63,65].includes(code)) return 'rain';
    if ([66,67].includes(code)) return 'freezingRain';
    if ([71,73,75].includes(code)) return 'snow';
    if ([77].includes(code)) return 'snowGrains';
    if ([80,81,82].includes(code)) return 'rainShowers';
    if ([85,86].includes(code)) return 'snowShowers';
    if ([95].includes(code)) return 'thunder';
    if ([96,99].includes(code)) return 'thunderHail';
    return 'other';
  }
  const weatherGroup = getWeatherGroup(weatherCodeId);

  // If it's night, force all color classes to 'night' variant
  const colorKey = isNight ? 'night' : weatherGroup;
    // Weather-adaptive search bar color
  // Map weather code IDs to color classes (3-4 per group)
  // If night, override to night color
  // Convert temperature values if needed
  React.useEffect(() => {
    if (!weatherRaw) return;
    if (unit === 'C') {
      setWeather(weatherRaw);
    } else {
      // Convert all temps to F
      const toF = c => c * 9/5 + 32;
      const convert = obj => obj == null ? null : { ...obj };
      const w = JSON.parse(JSON.stringify(weatherRaw));
      if (w.current) {
        w.current.temp = toF(w.current.temp);
        w.current.feels_like = toF(w.current.feels_like);
      }
      if (w.hourly) {
        w.hourly = w.hourly.map(h => ({ ...h, temp: toF(h.temp), feels_like: toF(h.feels_like) }));
      }
      if (w.daily) {
        w.daily = w.daily.map(d => ({ ...d, temp: { max: toF(d.temp.max), min: toF(d.temp.min) } }));
      }
      setWeather(w);
    }
    // eslint-disable-next-line
  }, [unit, weatherRaw]);
  const searchBarBg = {
    clear: 'bg-blue-300/80',
    clouds: 'bg-blue-200/80',
    fog: 'bg-gray-300/80',
    drizzle: 'bg-blue-100/80',
    freezingDrizzle: 'bg-cyan-100/80',
    rain: 'bg-blue-400/80',
    freezingRain: 'bg-cyan-300/80',
    snow: 'bg-white/80',
    snowGrains: 'bg-gray-100/80',
    rainShowers: 'bg-blue-500/80',
    snowShowers: 'bg-blue-100/80',
    thunder: 'bg-yellow-900/80 text-white placeholder-white',
    thunderHail: 'bg-indigo-900/80 text-white placeholder-white',
    night: 'bg-blue-950/80 text-white placeholder-white',
    other: 'bg-white/80',
  }[colorKey] || 'bg-white/80';

  const sliderBg = {
    clear: 'bg-blue-300/60',
    clouds: 'bg-blue-200/60',
    fog: 'bg-gray-300/60',
    drizzle: 'bg-blue-100/60',
    freezingDrizzle: 'bg-cyan-100/60',
    rain: 'bg-blue-400/60',
    freezingRain: 'bg-cyan-300/60',
    snow: 'bg-white/60',
    snowGrains: 'bg-gray-100/60',
    rainShowers: 'bg-blue-500/60',
    snowShowers: 'bg-blue-100/60',
    thunder: 'bg-yellow-900/60',
    thunderHail: 'bg-indigo-900/60',
    night: 'bg-blue-950/60',
    other: 'bg-blue-100/60',
  }[colorKey] || 'bg-blue-100/60';

  const sliderScrollbar = {
    clear: 'scrollbar-thumb-blue-300 scrollbar-track-blue-100',
    clouds: 'scrollbar-thumb-blue-200 scrollbar-track-gray-200',
    fog: 'scrollbar-thumb-gray-300 scrollbar-track-gray-100',
    drizzle: 'scrollbar-thumb-blue-100 scrollbar-track-blue-50',
    freezingDrizzle: 'scrollbar-thumb-cyan-100 scrollbar-track-cyan-50',
    rain: 'scrollbar-thumb-blue-400 scrollbar-track-blue-200',
    freezingRain: 'scrollbar-thumb-cyan-300 scrollbar-track-cyan-100',
    snow: 'scrollbar-thumb-gray-100 scrollbar-track-white',
    snowGrains: 'scrollbar-thumb-gray-100 scrollbar-track-gray-50',
    rainShowers: 'scrollbar-thumb-blue-500 scrollbar-track-blue-200',
    snowShowers: 'scrollbar-thumb-blue-100 scrollbar-track-blue-50',
    thunder: 'scrollbar-thumb-yellow-900 scrollbar-track-gray-800',
    thunderHail: 'scrollbar-thumb-indigo-900 scrollbar-track-gray-800',
    night: 'scrollbar-thumb-blue-900 scrollbar-track-blue-950',
    other: 'scrollbar-thumb-blue-300 scrollbar-track-blue-100',
  }[colorKey] || 'scrollbar-thumb-blue-300 scrollbar-track-blue-100';

  // Map weather to background and section color classes
  const bgClass = {
    clear: 'bg-gradient-to-b from-blue-200 to-blue-400',
    clouds: 'bg-gradient-to-b from-blue-100 to-gray-400',
    fog: 'bg-gradient-to-b from-gray-300 to-gray-400',
    drizzle: 'bg-gradient-to-b from-blue-100 to-blue-200',
    freezingDrizzle: 'bg-gradient-to-b from-cyan-100 to-cyan-300',
    rain: 'bg-gradient-to-b from-blue-400 to-blue-600',
    freezingRain: 'bg-gradient-to-b from-cyan-300 to-cyan-500',
    snow: 'bg-gradient-to-b from-white to-gray-200',
    snowGrains: 'bg-gradient-to-b from-gray-100 to-gray-300',
    rainShowers: 'bg-gradient-to-b from-blue-500 to-blue-700',
    snowShowers: 'bg-gradient-to-b from-blue-100 to-blue-300',
    thunder: 'bg-gradient-to-b from-yellow-900 to-gray-800',
    thunderHail: 'bg-gradient-to-b from-indigo-900 to-gray-800',
    night: 'bg-gradient-to-b from-blue-900 to-gray-800',
    other: 'bg-gray-200',
  }[colorKey] || 'bg-gray-200';

  const sectionClass = {
    clear: 'bg-blue-100/80',
    clouds: 'bg-blue-50/80',
    fog: 'bg-gray-200/80',
    drizzle: 'bg-blue-50/80',
    freezingDrizzle: 'bg-cyan-50/80',
    rain: 'bg-blue-200/80',
    freezingRain: 'bg-cyan-200/80',
    snow: 'bg-white/80',
    snowGrains: 'bg-gray-100/80',
    rainShowers: 'bg-blue-300/80',
    snowShowers: 'bg-blue-50/80',
    thunder: 'bg-yellow-900/80 text-white',
    thunderHail: 'bg-indigo-900/80 text-white',
    night: 'bg-blue-950/80 text-white',
    other: 'bg-white/80',
  }[colorKey] || 'bg-white/80';

  const headerClass = {
    clear: 'bg-blue-100/80',
    clouds: 'bg-blue-50/80',
    fog: 'bg-gray-200/80',
    drizzle: 'bg-blue-50/80',
    freezingDrizzle: 'bg-cyan-50/80',
    rain: 'bg-blue-200/80',
    freezingRain: 'bg-cyan-200/80',
    snow: 'bg-white/80',
    snowGrains: 'bg-gray-100/80',
    rainShowers: 'bg-blue-300/80',
    snowShowers: 'bg-blue-50/80',
    thunder: 'bg-yellow-900/80 text-white',
    thunderHail: 'bg-indigo-900/80 text-white',
    night: 'bg-blue-900/90 text-white',
    other: 'bg-white/80',
  }[colorKey] || 'bg-white/80';

  // Removed 'Wykrywanie lokalizacji...' view and ipLookupDone gating
  return (
  <div className={`min-h-screen ${bgClass} transition-colors duration-[1500ms]`}>
  {/* Header */}
  <header className={`w-full relative flex flex-col md:flex-row items-center p-4 shadow ${headerClass} transition-colors duration-[1500ms]`}>
        {/* Responsive header layout */}
        <div className="w-full flex flex-col md:flex-row items-center gap-2">
          {/* Desktop: title centered absolutely, with z-10 */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10">
            <span style={{ fontFamily: 'Minecraft', fontSize: 32, letterSpacing: 2, textAlign: 'center' }}>Pixel Weather</span>
          </div>
          {/* Mobile: two rows: top row title, bottom row searchbar + units */}
          <div className="w-full flex flex-col md:hidden">
            <div className="w-full mb-2 flex justify-center">
              <span className="block text-center w-full" style={{ fontFamily: 'Minecraft', fontSize: 32, letterSpacing: 2 }}>Pixel Weather</span>
            </div>
            <div className="w-full flex flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Wpisz miasto..."
                value={city}
                onChange={e => setCity(e.target.value)}
                className={`px-3 py-2 rounded border border-black-300 focus:outline-none focus:ring w-full min-w-[100px] ${searchBarBg}`}
                style={{ fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif' }}
              />
              <button
                className="ml-2 p-2 bg-blue-500 text-white rounded"
                title="Szukaj"
                onClick={() => handleSearch()}
                disabled={loading}
              >
                <span role="img" aria-label="search"><img src="assets/lupkaa.png" alt="Szukaj" /></span>
              </button>
              <div className="flex items-center gap-2 ml-2">
                <button
                  className={`px-2 py-1 rounded ${unit === 'C' ? 'bg-blue-500 text-black' : 'bg-gray-200 text-black'}`}
                  onClick={() => setUnit('C')}
                >°C</button>
                <button
                  className={`px-2 py-1 rounded ${unit === 'F' ? 'bg-blue-500 text-black' : 'bg-gray-200 text-black'}`}
                  onClick={() => setUnit('F')}
                >°F</button>
              </div>
            </div>
          </div>
          {/* Desktop: searchbar and units row below title, if needed */}
          <div className="w-full flex flex-row items-center gap-2 hidden md:flex">
            <div className="flex flex-row items-center flex-1 min-w-0">
              <input
                type="text"
                placeholder="Wpisz miasto..."
                value={city}
                onChange={e => setCity(e.target.value)}
                className={`px-3 py-2 rounded border border-black-300 focus:outline-none focus:ring w-full md:w-64 ${searchBarBg}`}
                style={{ fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif' }}
              />
              <button
                className="ml-2 p-2 bg-blue-500 text-white rounded"
                title="Szukaj"
                onClick={() => handleSearch()}
                disabled={loading}
              >
                <span role="img" aria-label="search"><img src="assets/lupkaa.png" alt="Szukaj" /></span>
              </button>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                className={`px-2 py-1 rounded ${unit === 'C' ? 'bg-blue-500 text-black' : 'bg-gray-200 text-black'}`}
                onClick={() => setUnit('C')}
              >°C</button>
              <button
                className={`px-2 py-1 rounded ${unit === 'F' ? 'bg-blue-500 text-black' : 'bg-gray-200 text-black'}`}
                onClick={() => setUnit('F')}
              >°F</button>
            </div>
          </div>
        </div>
      </header>

      {/* Today & Hourly Section */}
  <section className={`w-full max-w-3xl mx-auto mt-4 p-2 md:p-4 rounded shadow ${sectionClass} transition-colors duration-[1500ms]`}>
        {/* removed loading message */}
        {error && (
          <div className="flex flex-col items-center justify-center h-[220px] w-full text-center relative">
            {!errorIconLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />}
            <img src="/assets/no signal.gif" alt="" className="w-40 h-40 object-contain mb-4 relative z-10" onLoad={() => setErrorIconLoaded(true)} />
            <div className="text-xl font-bold text-gray-500 relative z-10">Brak Sygnału</div>
          </div>
        )}
        {weather && !loading && !error ? (
          <FadeIn>
            {/* Main Weather Widget */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-4 md:mb-6 relative w-full">
              {/* Responsive main weather widget layout */}
              {/* Top right info for mobile, absolute for desktop */}
              <div className="w-full flex flex-row justify-end md:absolute md:right-0 md:top-0 text-sm text-gray-500 text-right z-10">
                <div>
                  <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                    <span>{localTime}</span>
                    <span className="ml-0 md:ml-2">{new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: weather?.timezone || 'Europe/Warsaw' })}</span>
                  </div>
                  <div className="truncate">{normalizePolish(geoInfo.name)}{geoInfo.state ? `, ${normalizePolish(geoInfo.state)}` : ''}{geoInfo.country ? `, ${normalizePolish(geoInfo.country)}` : ''}</div>
                </div>
              </div>
              {/* Row below: left info, right icon (mobile); stacked on desktop */}
              <div className="w-full flex flex-row justify-between items-start md:mt-0 md:flex-col">
                <div className="flex flex-col items-start ml-5">
                  <div className="text-6xl flex items-center justify-end md:justify-center">
                  <div className="relative w-32 h-32 mb-4 ml-2">
                    {!mainIconLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />}
                    <img src={(isNight ? weatherTypeToImageNight : weatherTypeToImageDay)[weatherGroup]} alt="" className="w-32 h-32 object-contain relative z-10" onLoad={() => setMainIconLoaded(true)} />
                  </div>
                </div>
                  <div className="text-4xl font-bold text-left md:text-left">{normalizePolish(Math.round(weather.current.temp) + '°' + unit)}</div>
                  <div className="text-gray-600 text-left md:text-left">{normalizePolish('Odczuwalna: ' + Math.round(weather.current.feels_like) + '°' + unit)}</div>
                  <div className="capitalize text-left md:text-left">{normalizePolish(weatherGroupPl[weatherGroup]) || 'Pogoda'}</div>
                  <div className="text-sm text-gray-500 text-left md:text-left">{normalizePolish('Wilgotność: ' + weather.current.humidity + '% | Wiatr: ' + Math.round(weather.current.wind_speed) + ' km/h')}</div>
                </div>

              </div>
            </div>
            {/* Hourly Forecast Slider */}
            <div
              ref={sliderRef}
              className={`flex overflow-x-auto gap-2 pb-2 rounded-lg select-none cursor-grab active:cursor-grabbing ${sliderBg} ${hideScrollbar} transition-colors duration-[1500ms]`}
              style={{ scrollbarWidth: 'none' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onWheel={onWheel}
            >
              {(() => {
                  // Strefa czasowa miasta (np. "Asia/Shanghai")
                  const tz = weather.timezone || "Europe/Warsaw";

                  // Aktualny czas UTC (timestamp w sekundach)
                  const nowUtcTs = Date.now() / 1000;

                  // Znajdź pierwszą godzinę prognozy >= teraz
                  const firstIdx = weather.hourly.findIndex(h => h.dt >= nowUtcTs);
                  const start = firstIdx === -1 ? 0 : firstIdx;

                  // Formatter do wyświetlania godzin w lokalnym czasie miasta
                  const hourFormatter = new Intl.DateTimeFormat("pl-PL", {
                    timeZone: tz,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  return weather.hourly.slice(start, start + 12).map((h, i) => {
                    // h.dt jest w sekundach (UTC), robimy Date
                    const date = new Date(h.dt * 1000);

                    // Oblicz sunrise/sunset dla tej daty i lokalizacji
                    const lat = weather.geo.lat;
                    const lon = weather.geo.lon;
                    const sunTimes = SunCalc.getTimes(date, lat, lon);

                    const sunriseTs = Math.floor(sunTimes.sunrise.getTime() / 1000);
                    const sunsetTs = Math.floor(sunTimes.sunset.getTime() / 1000);

                    const isHourNight = h.dt < sunriseTs || h.dt > sunsetTs;
                    const iconSet = isHourNight ? weatherTypeToImageNight : weatherTypeToImageDay;

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center rounded"
                      >
                        <div className="text-2xl">
                          <div className="relative w-16 h-16 mx-auto">
                            {!hourlyIconLoaded[i] && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />}
                            <img
                              src={iconSet[getWeatherGroup(h.weathercode)]}
                              alt=""
                              className="w-16 h-16 object-contain relative z-10"
                              draggable={false}
                              onLoad={() => {
                                setHourlyIconLoaded(arr => {
                                  const copy = [...arr];
                                  copy[i] = true;
                                  return copy;
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-sm">
                          {normalizePolish(hourFormatter.format(date))}
                        </div>
                        <div className="font-bold">
                          {normalizePolish(Math.round(h.temp) + "°" + unit)}
                        </div>
                      </div>
                    );
                  });
                })()}
            </div>
          </FadeIn>
        ) : (
          <div className="flex flex-col items-center justify-center h-[220px] w-full text-center text-gray-400">
            Wyszukaj miasto, aby zobaczyc pogode.
          </div>
        )}
      </section>

      {/* Multi-day Forecast Section */}
  <section className={`w-full max-w-5xl mx-auto mt-4 md:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-6 p-2 md:p-6 ${sectionClass} transition-colors duration-[1500ms]`}>
        {weather && !loading && !error ? (
          weather.daily.slice(1, 7).map((d, i) => {
            const date = new Date(d.dt * 1000);
            const day = ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'][date.getDay()];
            return (
                <div key={i} className="flex flex-col items-center rounded shadow p-2 md:p-3 min-w-0">
                <div className="text-lg font-semibold">{normalizePolish(day)}</div>
                <div className="text-3xl">
                  <div className="relative w-16 h-16 mx-auto">
                    {!dailyIconLoaded[i] && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />}
                    <img src={weatherTypeToImageDay[getWeatherGroup(d.weathercode)]} alt="" className="w-16 h-16 object-contain relative z-10" onLoad={() => {
                      setDailyIconLoaded(arr => {
                        const copy = [...arr];
                        copy[i] = true;
                        return copy;
                      });
                    }} />
                  </div>
                </div>
                <div className="text-sm">{normalizePolish('max: ' + Math.round(d.temp.max) + '°' + unit)}</div>
                <div className="text-sm">{normalizePolish('min: ' + Math.round(d.temp.min) + '°' + unit)}</div>
              </div>
            );
          })
        ) : (
          [...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center  rounded shadow p-3">
              <div className="text-lg font-semibold">{normalizePolish(['Pn','Wt','Śr','Cz','Pt','Sb','Nd'][(new Date().getDay()+i)%7])}</div>
              <div className="text-3xl">
                <div className="relative w-16 h-16 mx-auto">
                  {!dailyIconLoaded[i] && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />}
                  <img src={(isNight ? weatherTypeToImageNight : weatherTypeToImageDay)['clear']} alt="" className="w-16 h-16 object-contain relative z-10" onLoad={() => {
                    setDailyIconLoaded(arr => {
                      const copy = [...arr];
                      copy[i] = true;
                      return copy;
                    });
                  }} />
                </div>
              </div>
              <div className="text-sm">{normalizePolish('max: --°' + unit)}</div>
              <div className="text-sm">{normalizePolish('min: --°' + unit)}</div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

// FadeIn component for smooth appearance
function FadeIn({ children }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    setVisible(true);
  }, []);
  return (
    <div className={`transition-opacity duration-1500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}

export default App;
