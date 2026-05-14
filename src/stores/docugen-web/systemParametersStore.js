import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils.js';
import { toRaw } from 'vue';

export const useSystemParametersStore = defineStore('systemParameters', () => {
  // States
  const systemParameters = ref([]);

  //Getters
  const getSystemParameters = computed(() => systemParameters.value);
  const getSystemParameter = (id) => {
    const index = systemParameters.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      return systemParameters.value[index];
    } else {
      return {};
    }
  };
  // Actions
  const setSystemParameters = (data) => {
    systemParameters.value = data || [];
  };
  const setSystemParameter = (id, options) => {
    const index = systemParameters.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      systemParameters.value[index] = deepMerge(toRaw(systemParameters.value[index]), options);
    } else {
      systemParameters.value.push(options);
      console.log('Se insertó un nuevo documento en el store de parametros del sistema!!!');
    }
  };
  const resetSystemParameters = () => {
    systemParameters.value = [];
  };

  return {
    //Getters
    getSystemParameters,
    getSystemParameter,
    //Actions
    setSystemParameters,
    setSystemParameter,
    resetSystemParameters,
  };
});
