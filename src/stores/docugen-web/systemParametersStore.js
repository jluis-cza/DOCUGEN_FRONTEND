import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils.js';
import { toRaw } from 'vue';

export const useSystemParametersStore = defineStore('systemParameters', () => {
  // States
  const systemParameters = ref([]);
  const systemParametersOverview = ref({});

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
  const getSystemParametersOverview = computed(() => systemParametersOverview.value);

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
  const setSystemParametersOverview = (data) => {
    systemParametersOverview.value = data || {};
  };
  const resetSystemParameters = () => {
    systemParameters.value = [];
  };
  const resetSystemParametersOverview = () => {
    systemParametersOverview.value = {};
  };

  return {
    //Getters
    getSystemParameters,
    getSystemParameter,
    getSystemParametersOverview,
    //Actions
    setSystemParameters,
    setSystemParameter,
    setSystemParametersOverview,
    resetSystemParameters,
    resetSystemParametersOverview,
  };
});
