import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TABLES } from '../constants/tables';
import { deepMerge } from '../helpers/utils.js';
import { toRaw } from 'vue';

export const useTablesStore = defineStore('tables', () => {
  // States
  const tables = ref([]);
  // Getters
  const getTables = computed(() => tables.value);
  const getTable = computed(() => (id) => {
    const table = tables.value.find((t) => t.id === id);
    return table;
  });
  // Actions
  const setTable = (id, options) => {
    const index = tables.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      tables.value[index] = deepMerge(toRaw(tables.value[index]), options);
    } else {
      tables.value.push(deepMerge({ id }, options));
    }
  };
  const resetTable = (id) => {
    const defaultOptions = structuredClone(TABLES.default);
    const index = tables.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      tables.value[index] = deepMerge(tables.value[index], defaultOptions);
    } else {
      tables.value.push(deepMerge({ id }, defaultOptions));
    }
  };
  const deleteTable = (id) => {
    const index = tables.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      tables.value.splice(index, 1);
    }
  };
  return {
    getTables,
    getTable,
    setTable,
    resetTable,
    deleteTable,
  };
});

// id
//  1: systemParameters
//
// Structure:
// {id:0, pagination:{},sort:{}, search:''}
