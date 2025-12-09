import { DailyWeather } from '../types';

export const getWeatherData = async (lat: number, lon: number): Promise<DailyWeather> => {
    const url = "https://api.open-meteo.com/v1/forecast";
    const params = new URLSearchParams({
        "latitude": lat.toString(),
        "longitude": lon.toString(),
        "daily": "temperature_2m_max,precipitation_sum",
        "timezone": "auto"
    });

    try {
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        
        if (data && data.daily) {
            return data.daily as DailyWeather;
        } else {
            throw new Error('Invalid weather data format');
        }
    } catch (error) {
        console.error("Weather service error:", error);
        throw error;
    }
};
