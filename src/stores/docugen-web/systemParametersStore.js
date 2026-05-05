import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils.js';
import { toRaw } from 'vue';

export const useSystemParametersStore = defineStore('systemParameters', () => {
  // States
  const systemParameters = ref([]);

  //Getters
  const getSystemParameters = computed(() => systemParameters.value);

  // Actions
  const setSystemParameters = (data) => {
    systemParameters.value = data || [];
  };
  const setSystemParameter = (id, options) => {
    const index = systemParameters.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      systemParameters.value[index] = deepMerge(toRaw(systemParameters.value[index]), options);
    } else {
      console.error('It was intented to update a document!!!');
    }
  };
  const resetSystemParameters = () => {
    systemParameters.value = [];
  };

  return {
    //Getters
    getSystemParameters,
    //Actions
    setSystemParameters,
    setSystemParameter,
    resetSystemParameters,
  };
});
