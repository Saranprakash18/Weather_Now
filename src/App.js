import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState({
    current: {},
    daily: {
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      weather_code: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError("");

    try {
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1`
      );

      if (!geoRes.data.results?.length) throw new Error("City not found");

      const { latitude, longitude, name, country } = geoRes.data.results[0];

      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      setWeather({
        location: `${name}, ${country}`,
        ...weatherRes.data,
      });
    } catch (err) {
      setError(
        err.message === "City not found"
          ? "City not found. Try another city."
          : "Failed to fetch weather data."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Fog with rime",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    return weatherCodes[code] || "Unknown";
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather Now</h1>
        <p>Get current weather conditions for any city</p>
      </header>

      <main className="main-content">
        <form onSubmit={getWeather} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-button">
            {loading ? "Loading..." : "Get Weather"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {weather.location && (
          <div className="weather-card">
            <h2 className="location">{weather.location}</h2>

            <div className="current-weather">
              <div className="temperature">
                {weather.current?.temperature_2m ?? "--"}°
              </div>
              <div className="weather-description">
                {getWeatherDescription(weather.current?.weather_code)}
              </div>
              <div className="feels-like">
                Feels like: {weather.current?.apparent_temperature ?? "--"}°
              </div>
            </div>

            <div className="weather-details">
              <div className="detail">
                <span className="label">Humidity:</span>
                <span className="value">
                  {weather.current?.relative_humidity_2m ?? "--"}%
                </span>
              </div>
              <div className="detail">
                <span className="label">Wind:</span>
                <span className="value">
                  {weather.current?.wind_speed_10m ?? "--"} m/s
                </span>
              </div>
              <div className="detail">
                <span className="label">Direction:</span>
                <span className="value">
                  {weather.current?.wind_direction_10m ?? "--"}°
                </span>
              </div>
            </div>

            <div className="forecast">
              <h3>Daily Forecast</h3>
              <div className="forecast-grid">
                {weather.daily?.time?.map((date, index) => (
                  <div key={date} className="forecast-day">
                    <div className="day">
                      {new Date(date).toLocaleDateString("en", {
                        weekday: "short",
                      })}
                    </div>
                    <div className="forecast-temp">
                      <span className="max-temp">
                        {weather.daily.temperature_2m_max[index]}°
                      </span>
                      <span className="min-temp">
                        {weather.daily.temperature_2m_min[index]}°
                      </span>
                    </div>
                    <div className="forecast-desc">
                      {getWeatherDescription(weather.daily.weather_code[index])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
