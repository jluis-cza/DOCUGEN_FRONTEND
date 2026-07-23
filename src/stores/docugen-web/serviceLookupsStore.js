import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils';
import { toRaw } from 'vue';

export const useServiceLookupsStore = defineStore('serviceLookups', () => {
  // States
  const serviceLookups = ref([]);
  const serviceLookupsOverview = ref({});
  //Getters
  const getServiceLookups = computed(() => serviceLookups.value);
  const getServiceLookup = (id) => {
    return serviceLookups.value.find((s) => s._id === id);
  };
  const getServiceLookupsOverview = computed(() => serviceLookupsOverview.value);
  // Actions
  const setServiceLookups = (data) => {
    serviceLookups.value = data || [];
  };
  const setServiceLookup = (id, options) => {
    const index = serviceLookups.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      serviceLookups.value[index] = deepMerge(toRaw(serviceLookups.value[index]), options);
    } else {
      serviceLookups.value.push(options);
      console.log('A document was inserted in serviceLookups!');
    }
  };
  const setServiceLookupsOverview = (data) => {
    serviceLookupsOverview.value = data || {};
  };
  const resetServiceLookups = () => {
    serviceLookups.value = [];
  };
  const resetServiceLookupsOverview = () => {
    serviceLookupsOverview.value = {};
  };

  return {
    //Getters
    getServiceLookups,
    getServiceLookup,
    getServiceLookupsOverview,
    //Actions
    setServiceLookups,
    setServiceLookup,
    setServiceLookupsOverview,
    resetServiceLookups,
    resetServiceLookupsOverview,
  };
});
