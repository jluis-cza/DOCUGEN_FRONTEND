import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils';
import { toRaw } from 'vue';

export const useServicesStore = defineStore('services', () => {
  // States
  const services = ref([]);

  //Getters
  const getServices = computed(() => services.value);
  const getService = (id) => {
    const index = services.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      return services.value[index];
    } else {
      return {};
    }
  };
  // Actions
  const setServices = (data) => {
    services.value = data || [];
  };
  const setService = (id, options) => {
    const index = services.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      services.value[index] = deepMerge(toRaw(services.value[index]), options);
    } else {
      services.value.push(options);
      console.log('Se insertó un nuevo documento en el serviceStore!!!');
    }
  };
  const resetServices = () => {
    services.value = [];
  };

  return {
    //Getters
    getServices,
    getService,
    //Actions
    setServices,
    setService,
    resetServices,
  };
});
