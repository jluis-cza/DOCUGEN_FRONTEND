import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SERVICES } from '../../constants/services.js';

const timeDefaultData = { ...SERVICES.payload.utils.time };

export const useTimeStore = defineStore('time', () => {
  // States
  const time = ref(timeDefaultData);
  const timeReceived = ref(false);

  //Getters
  const getTime = computed(() => time.value);
  const isTimeReceived = computed(() => timeReceived.value);

  // Actions
  const setTime = (data) => {
    time.value = data || {};
    timeReceived.value = true;
  };
  const resetTime = () => {
    time.value = timeDefaultData;
    timeReceived.value = false;
  };

  return {
    //Getters
    getTime,
    isTimeReceived,
    //Actions
    setTime,
    resetTime,
  };
});
