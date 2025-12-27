import axios from 'axios';

const query =
  '?latitude=-16.5&longitude=-68.15&hourly=temperature_2m,rain,wind_speed_120m&timezone=auto';
const API_URL = `${import.meta.env.VITE_WEATHER_API_URL_1}${query}`;

export const getWeather = async () => {
  const response = await axios.get(API_URL);
  console.log({ response: response });
  const temperature = response.data.hourly.temperature_2m[0];

  return { temperature };
};
