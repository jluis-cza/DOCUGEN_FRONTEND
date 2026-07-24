// This store stores the processes FETCHED from the database
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { extractTime, extractSubarray } from '../../helpers/utils.js';
import { identifyModuleProcessPrefix } from '../../helpers/docugen-web/managerProcessHelper.js';

export const useMyProcessesStore = defineStore('myProcesses', () => {
  // States
  const myProcesses = ref([]);

  //Getters
  const getAllMyProcesses = computed(() => myProcesses.value);
  const getMyDateSegmentedProcesses = computed(() => {
    const sections = [];
    for (const myProcess of myProcesses.value) {
      const myProcessDate = extractTime(myProcess.createdAt, 'America/La_Paz', 'long').date;
      const section = sections.find((section) => section.date === myProcessDate);
      if (section) {
        section.myProcesses.push(myProcess);
      } else {
        sections.push({ date: myProcessDate, myProcesses: [myProcess] });
      }
    }
    return sections;
  });
  const getMyProcessesCount = (module, date) => {
    if (!module || !date) throw new Error('There is no id or module arguments input');
    const modulePrefix = identifyModuleProcessPrefix(module); // Identifing the module
    // Counting the processes by prefix code then by date
    const count = myProcesses.value.filter((p) => {
      if (p.code.slice(0, 3) === modulePrefix) {
        return extractTime(p.createdAt, 'America/La_Paz', 'numeric').date === date;
      } else {
        return false;
      }
    }).length;
    return count;
  };
  const getMyHistoricalProcessesCounting = (module) => {
    if (!module) throw new Error('There is no id or module arguments input');
    const modulePrefix = identifyModuleProcessPrefix(module); // Identifing the module
    const processesByModule = myProcesses.value.filter((p) => p.code.slice(0, 3) === modulePrefix);
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
  const getMyHistoricalProcessesCountingWindow = (module, offset) => {
    if (!module && !offset) throw new Error('There is no offset or module arguments input');
    const modulePrefix = identifyModuleProcessPrefix(module); // Identifing the module
    const processesByModule = myProcesses.value.filter((p) => p.code.slice(0, 3) === modulePrefix);
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
  // Actions
  const setMyProcesses = (data) => {
    myProcesses.value = data || [];
  };

  const resetMyProcesses = () => {
    myProcesses.value = [];
  };

  return {
    //Getters
    getAllMyProcesses,
    getMyDateSegmentedProcesses,
    getMyHistoricalProcessesCounting,
    getMyHistoricalProcessesCountingWindow,
    getMyProcessesCount,
    //Actions
    setMyProcesses,
    resetMyProcesses,
  };
});
