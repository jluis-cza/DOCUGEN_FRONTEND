import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSystemParametersStore = defineStore('systemParameters', () => {
  // States
  const systemParameters = ref([]);

  //Getters
  const getSystemParameters = computed(() => systemParameters.value);

  // Actions
  const setSystemParameters = (data) => {
    systemParameters.value = data || [];
  };
  const resetSystemParameters = () => {
    systemParameters.value = [];
  };

  return {
    //Getters
    getSystemParameters,
    //Actions
    setSystemParameters,
    resetSystemParameters,
  };
});
