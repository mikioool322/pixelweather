# Copilot Instructions for AI Coding Agents

## Project Overview
PixelWeather is a web application for displaying weather information for a user-specified location. The frontend is built with Vite and React, using the OpenWeatherAPI for weather data. The app features a pixel art visual style (graphics provided separately) and is intended for deployment on Netlify or Vercel.

## Architecture & Key Components
- **Frontend:** Vite + React (SPA)
- **Weather Data:** Fetched from OpenWeatherAPI (https://openweathermap.org/api)
- **User Input:** User provides a location (city name, etc.) to retrieve weather
- **Graphics:** Pixel art assets (to be provided; reference when available)
- **Deployment:** Netlify or Vercel (static hosting)

## Developer Workflows
- **Install dependencies:** `npm install` or `yarn install`
- **Start dev server:** `npm run dev` (Vite default)
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Deploy:** Push to main branch or connect repo to Netlify/Vercel dashboard

## Project Conventions
- Use functional React components and hooks
- Use Tailwind CSS utility classes for styling; configure via `tailwind.config.js`
- Keep API keys/secrets out of the repo (use environment variables, e.g., `.env`)
- Organize components in `/src/components`, API logic in `/src/api`, and assets in `/public` or `/src/assets`
- Use clear, descriptive names for components and variables
- Integrate pixel art graphics as React components or static assets

## Example File Structure
- `/src` — React source code
	- `/components` — UI components (WeatherDisplay, LocationInput, etc.)
	- `/api` — API utility for OpenWeatherAPI requests
	- `/assets` — Pixel art graphics (when available)
- `/public` — Static files
- `.env` — API keys (not committed)

## Key Dependencies
- `react`, `react-dom`, `vite`
- `tailwindcss` (for styling)
- (Optional) `axios` or `fetch` for API calls

## Notes
- Reference OpenWeatherAPI docs for required endpoints and parameters
- Ensure pixel art graphics are used according to provided guidelines
- Update this file as the project structure and conventions evolve