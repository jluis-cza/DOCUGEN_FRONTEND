import { useWeatherStore } from "../stores/weatherStore";
import { getWeather } from "../helpers/weather";

export const useWeatherComposable = async () => {
 const temperature = await (await getWeather()).temperature
 console.log({temperature: temperature})
 const weather = useWeatherStore()
 weather.setTemperature(temperature)
}