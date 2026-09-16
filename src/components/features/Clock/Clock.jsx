import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/i18n";

import {
  WidgetBody,
  WidgetControls,
  widgetGlassMorphism,
} from "@/components/ui/Widget";
import { Icon } from "@/components/ui/Icon";

import { submitOnEnter } from "@/utils/keyboard";

function getWeatherIconName(code, isDay = true) {
  // Céu limpo
  if (code === 0) {
    return isDay ? "sun" : "moon";
  }

  // Parcialmente nublado
  if ([1, 2].includes(code)) {
    return isDay ? "cloudSun" : "cloudMoon";
  }

  // Nublado
  if (code === 3) {
    return "cloud";
  }

  // Neblina
  if ([45, 48].includes(code)) {
    return "cloudFog";
  }

  // Chuva
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return "cloudRain";
  }

  // Neve
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "cloudSnow";
  }

  // Tempestade
  if ([95, 96, 99].includes(code)) {
    return "cloudLightning";
  }

  return "cloud";
}

function formatHourTime(time) {
  return time.slice(11, 16);
}

function formatWeekday(date, locale) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(locale, {
    weekday: "short",
  });
}

const WEATHER_ICON_SIZE = 20;

export function Clock({
  location = "São Paulo, São Paulo, Brasil",
  latitude = -23.55052,
  longitude = -46.63331,
  timezone = "America/Sao_Paulo",
  onConfigChange,
  onClose,
}) {
  const { locale, t } = useLanguage();
  const locationInputRef = useRef(null);

  // Clock
  const [time, setTime] = useState(new Date());

  // Selected weather location
  const [selectedLocation, setSelectedLocation] = useState(location);
  const [selectedLatitude, setSelectedLatitude] = useState(latitude);
  const [selectedLongitude, setSelectedLongitude] = useState(longitude);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);

  // Loaded weather data
  const [weather, setWeather] = useState(null);

  // Weather edit state
  const [isEditingWeather, setIsEditingWeather] = useState(false);
  const [editLocation, setEditLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [weatherSlide, setWeatherSlide] = useState(0);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);

  const currentTime = time.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: locale === "en-US",
    timeZone: selectedTimezone,
  });

  const currentDate = time.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: selectedTimezone,
  });

  useEffect(() => {
    async function fetchWeather() {
      if (selectedLatitude == null || selectedLongitude == null) return;

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedLatitude}&longitude=${selectedLongitude}&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code,precipitation_probability,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`,
      );

      const data = await response.json();

      const currentHourIndex = data.hourly.time.findLastIndex(
        (hourTime) => hourTime <= data.current.time,
      );

      if (data.timezone) {
        setSelectedTimezone(data.timezone);
      }

      const nextHourIndex = data.hourly.time.findIndex(
        (hourTime) => hourTime > data.current.time,
      );

      const nextHours = data.hourly.time
        .slice(nextHourIndex, nextHourIndex + 6)
        .map((time, index) => ({
          time,
          temperature: Math.round(
            data.hourly.temperature_2m[nextHourIndex + index],
          ),
          weatherCode: data.hourly.weather_code[nextHourIndex + index],
          isDay: data.hourly.is_day[nextHourIndex + index],
          precipitationProbability:
            data.hourly.precipitation_probability[nextHourIndex + index],
        }));

      const nextDays = data.daily.time.map((date, index) => ({
        date,
        min: Math.round(data.daily.temperature_2m_min[index]),
        max: Math.round(data.daily.temperature_2m_max[index]),
        weatherCode: data.daily.weather_code[index],
      }));

      setWeather({
        current: {
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day,
          precipitationProbability:
            data.hourly.precipitation_probability[currentHourIndex] ?? 0,
        },
        nextHours,
        nextDays,
      });
    }

    fetchWeather();
  }, [selectedLatitude, selectedLongitude]);

  function handleEditWeather() {
    setEditLocation("");
    setLocationSuggestions([]);
    setIsEditingWeather(true);
  }

  useEffect(() => {
    if (!isEditingWeather) return;

    locationInputRef.current?.focus();
  }, [isEditingWeather]);

  async function handleConfirmWeather() {
    const locationName = editLocation.trim();

    if (!locationName) {
      setEditLocation("");
      setLocationSuggestions([]);
      setIsEditingWeather(false);
      return;
    }

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=pt&format=json`,
    );

    const data = await response.json();
    const location = data.results?.[0];

    if (!location) return;

    const selectedLocationData = {
      location: `${location.name}${location.admin1 ? `, ${location.admin1}` : ""}, ${location.country}`,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone ?? "America/Sao_Paulo",
    };

    setSelectedLocation(selectedLocationData.location);
    setSelectedLatitude(selectedLocationData.latitude);
    setSelectedLongitude(selectedLocationData.longitude);
    setSelectedTimezone(selectedLocationData.timezone);
    onConfigChange?.(selectedLocationData);
    setIsEditingWeather(false);
    setEditLocation("");
    setLocationSuggestions([]);
  }

  async function handleLocationChange(event) {
    const value = event.target.value;

    setEditLocation(value);

    if (value.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        value,
      )}&count=100&language=pt&format=json`,
    );

    const data = await response.json();

    setLocationSuggestions(data.results ?? []);
  }

  function handleSelectLocation(selectedSuggestion) {
    const selectedLocationData = {
      location: `${selectedSuggestion.name}${
        selectedSuggestion.admin1 ? `, ${selectedSuggestion.admin1}` : ""
      }, ${selectedSuggestion.country}`,
      latitude: selectedSuggestion.latitude,
      longitude: selectedSuggestion.longitude,
      timezone: selectedSuggestion.timezone ?? "America/Sao_Paulo",
    };

    setSelectedLocation(selectedLocationData.location);
    setSelectedLatitude(selectedLocationData.latitude);
    setSelectedLongitude(selectedLocationData.longitude);
    setSelectedTimezone(selectedLocationData.timezone);
    onConfigChange?.(selectedLocationData);
    setEditLocation("");
    setLocationSuggestions([]);
    setIsEditingWeather(false);
  }

  // Slider

  function showPreviousWeatherSlide() {
    setWeatherSlide((currentSlide) =>
      currentSlide === 0 ? 1 : currentSlide - 1,
    );
  }

  function showNextWeatherSlide() {
    setWeatherSlide((currentSlide) =>
      currentSlide === 0 ? 1 : currentSlide + 1,
    );
  }

  return (
    <WidgetBody
      width="clock"
      onClose={onClose}
      top={
        <div>
          <span className="block">{currentTime}</span>
          <span className="text-lg">{currentDate}</span>
        </div>
      }
      middle={
        !isEditingWeather ? (
          <div
            className="
              grid
              gap-4
              w-full
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Icon name="mapPin" />
              <span className="truncate">{selectedLocation}</span>
            </div>

            {weather && (
              <>
                <div
                  className="
                  grid
                  overflow-hidden
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      transition-transform
                      duration-300
                      ease-out
                    "
                    style={{
                      transform: `translateX(-${weatherSlide * 100}%)`,
                    }}
                  >
                    {/* Hour Weather */}
                    <div className="shrink-0 w-full px-1">
                      <WeatherWrapper
                        className="
                        grid
                        grid-cols-7
                        gap-2
                        h-max
                      "
                      >
                        <div
                          className="
                          flex
                          flex-col
                          items-center
                          gap-2
                        "
                        >
                          <span className="text-sm">{t("now")}</span>
                          <span>{weather.current.temperature}°</span>
                          <Icon
                            name={getWeatherIconName(
                              weather.current.weatherCode,
                              weather.current.isDay === 1,
                            )}
                            size={WEATHER_ICON_SIZE}
                          />
                          <span className="text-sm">
                            {weather.current.precipitationProbability}%
                          </span>
                        </div>
                        {weather.nextHours.map((hour) => (
                          <div
                            key={hour.time}
                            className="
                            grid
                            place-items-center
                            gap-2                    "
                          >
                            <span className="text-sm">
                              {formatHourTime(hour.time)}
                            </span>
                            <span>{hour.temperature}°</span>
                            <Icon
                              name={getWeatherIconName(
                                hour.weatherCode,
                                hour.isDay === 1,
                              )}
                              size={WEATHER_ICON_SIZE}
                            />
                            <span className="text-sm">
                              {hour.precipitationProbability}%
                            </span>
                          </div>
                        ))}
                      </WeatherWrapper>
                    </div>
                    {/* Day Weather */}
                    <div
                      className="
                        shrink-0
                        w-ful
                        px-1
                      "
                    >
                      <WeatherWrapper
                        className="
                        grid
                        grid-cols-8
                        gap-2
                        h-max
                      "
                      >
                        <div
                          className="
                            justify-self-center
                            grid
                            grid-rows-4
                            gap-1
                            text-sm
                          "
                        >
                          <span className="row-start-2">{t("maximum")}</span>
                          <span className="row-start-3">{t("minimum")}</span>
                        </div>
                        {weather.nextDays.map((day) => (
                          <div
                            key={day.date}
                            className="
                              grid
                              place-items-center
                              gap-2
                            "
                          >
                            <span className="text-sm">
                              {formatWeekday(day.date, locale)}
                            </span>
                            <span>{day.max}°</span>
                            <span>{day.min}°</span>
                            <Icon
                              name={getWeatherIconName(day.weatherCode)}
                              size={WEATHER_ICON_SIZE}
                            />
                          </div>
                        ))}
                      </WeatherWrapper>
                    </div>
                  </div>
                </div>
                {/* Buttons */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={showPreviousWeatherSlide}
                    aria-label="Previsão anterior"
                    className="
                        absolute
                        left-1
                        top-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-black/50
                        p-1
                      "
                  >
                    <Icon name="dot" />
                  </button>

                  <button
                    type="button"
                    onClick={showNextWeatherSlide}
                    aria-label="Próxima previsão"
                    className="
                        absolute
                        right-1
                        top-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-black/50
                        p-1
                      "
                  >
                    <Icon name="dot" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="
              relative
              h-full
            "
          >
            <div>
              <label>
                <input
                  ref={locationInputRef}
                  type="text"
                  value={editLocation}
                  onChange={handleLocationChange}
                  onKeyDown={(event) =>
                    submitOnEnter(event, handleConfirmWeather)
                  }
                  placeholder={t("typeLocation")}
                  className="
                    w-full
                    px-2
                    pt-1
                    pb-1
                    border
                    rounded
                  "
                />
              </label>
              {locationSuggestions.length > 0 && (
                <div
                  className="
                    absolute
                    left-0
                    z-10
                    mt-2
                    p-1
                    w-full
                    h-49.5
                    bg-gray-700
                    rounded
                    shadow-lg
                    overflow-y-auto
                  "
                >
                  {locationSuggestions.map((location) => {
                    return (
                      <button
                        type="button"
                        key={location.id}
                        onClick={() => handleSelectLocation(location)}
                        className="
                          w-full
                          p-1
                          text-left
                          truncate
                          hover:bg-gray-600
                          rounded
                        "
                      >
                        <span>{location.name}</span>,{" "}
                        <span>
                          {location.admin1 ? `${location.admin1}, ` : ""}
                          {location.country}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )
      }
      bottom={
        <WidgetControls>
          <WidgetControls.Edit
            isEditing={isEditingWeather}
            onEdit={handleEditWeather}
            onConfirm={handleConfirmWeather}
          />
        </WidgetControls>
      }
    />
  );
}

function WeatherWrapper({ children, className }) {
  return (
    <div
      className={`
        ${widgetGlassMorphism}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
