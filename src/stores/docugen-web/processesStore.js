// This store stores the processes FETCHED from the database
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge, extractTime, extractSubarray } from '../../helpers/utils.js';
import { identifyModuleProcessPrefix } from '../../helpers/docugen-web/managerProcessHelper.js';
import { toRaw } from 'vue';

export const useProcessesStore = defineStore('processes', () => {
  // States
  const processes = ref([]);

  //Getters
  const getAllProcesses = computed(() => processes.value);
  const getProcessesCount = (module, date) => {
    if (!module || !date) throw new Error('There is no id or module arguments input');
    const modulePrefix = identifyModuleProcessPrefix(module); // Identifing the module
    // Counting the processes by prefix code then by date
    const count = processes.value.filter((p) => {
      if (p.code.slice(0, 3) === modulePrefix) {
        return extractTime(p.createdAt, 'America/La_Paz', 'numeric').date === date;
      } else {
        return false;
      }
    }).length;
    return count;
  };
  const getHistoricalProcessesCounting = (module) => {
    if (!module) throw new Error('There is no id or module arguments input');
    const modulePrefix = identifyModuleProcessPrefix(module); // Identifing the module
    const processesByModule = processes.value.filter((p) => p.code.slice(0, 3) === modulePrefix);
    // Creating the dataset (date, count)
    const dataset = [];
    for (const process of processesByModule) {
      const processDate = extractTime(process.createdAt, 'America/La_Paz', 'numeric').date;
      const element = dataset.find((element) => element.date === processDate);
      if (element) {
        element.count = element.count + 1;
      } else {
        dataset.push({ date: processDate, count: 1 });
      }
    }
    dataset.reverse(); // ascending order
    return dataset;
  };
  const getHistoricalProcessesCountingWindow = (module, offset) => {
    if (!module && !offset) throw new Error('There is no offset or module arguments input');
    const modulePrefix = identifyModuleProcessPrefix(module); // Identifing the module
    const processesByModule = processes.value.filter((p) => p.code.slice(0, 3) === modulePrefix);
    // Creating the dataset (date, count)
    const dataset = [];
    for (const process of processesByModule) {
      const processDate = extractTime(process.createdAt, 'America/La_Paz', 'numeric').date;
      const element = dataset.find((element) => element.date === processDate);
      if (element) {
        element.count = element.count + 1;
      } else {
        dataset.push({ date: processDate, count: 1 });
      }
    }
    const subDataset = extractSubarray(dataset, offset, 7); // Extracting subarray up to 7 elements (1week)
    subDataset.reverse(); // ascending order
    return subDataset;
  };
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
    getProcessesCount,
    getHistoricalProcessesCounting,
    getHistoricalProcessesCountingWindow,
    getProcess,
    //Actions
    setProcesses,
    setProcess,
    resetProcesses,
  };
});
