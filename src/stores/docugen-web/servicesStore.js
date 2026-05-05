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
    return services.value.find((s) => s.id === id);
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
      console.error('It was intented to update a document!!!');
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
