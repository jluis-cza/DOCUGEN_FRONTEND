// This store stores the processes FETCHED from the database
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils';
import { toRaw } from 'vue';
import { extractTime } from '../../helpers/utils.js';

export const useProcessesStore = defineStore('processes', () => {
  // States
  const processes = ref([]);

  //Getters
  const getAllProcesses = computed(() => processes.value);
  const getDateProcesses = computed(() => {
    const sections = [];
    for (const process of processes.value) {
      const processData = extractTime(process.createdAt, 'America/La_Paz', 'long').date;
      const section = sections.find((section) => section.date === processData);
      if (section) {
        section.processes.push(process);
      } else {
        sections.push({ date: processData, processes: [process] });
      }
    }
    return sections;
  });
  const getProcess = (id) => {
    const index = processes.value.findIndex((p) => p._id === id);
    if (index !== -1) {
      return processes.value[index];
    } else {
      return {};
    }
  };
  // Actions
  const setProcesses = (data) => {
    processes.value = data || [];
  };
  const setProcess = (id, options) => {
    const index = processes.value.findIndex((p) => p._id === id);
    if (index !== -1) {
      processes.value[index] = deepMerge(toRaw(processes.value[index]), options);
    } else {
      processes.value.push(options);
      console.log('Se insertó un nuevo documento en el ProcessesStore!!!');
    }
  };
  const resetProcesses = () => {
    processes.value = [];
  };

  return {
    //Getters
    getAllProcesses,
    getDateProcesses,
    getProcess,
    //Actions
    setProcesses,
    setProcess,
    resetProcesses,
  };
});
