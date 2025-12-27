import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWeatherStore = defineStore('weather', () => {
  //states
  const temperature = ref(0);

  //Actions
  const setTemperature = (temp) => {
    temperature.value = temp;
  };
  return {
    //states
    temperature,
    //actions
    setTemperature,
  };
});
