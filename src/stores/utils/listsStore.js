import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils.js';
import { toRaw } from 'vue';
import { LISTS } from '../../constants/lists.js';

const getDefaultListData = (listType) => JSON.parse(JSON.stringify(LISTS[listType]));
export const useListsStore = defineStore('lists', () => {
  // States
  const lists = ref([]);
  // Getters
  const getLists = computed(() => lists.value);
  const getList = (id) => {
    const list = lists.value.find((l) => l.id === id);
    return list;
  };

  // Actions
  const setList = (id, options) => {
    const index = lists.value.findIndex((l) => l.id === id);
    if (index !== -1) {
      lists.value[index] = deepMerge(toRaw(lists.value[index]), options);
    } else {
      lists.value.push(deepMerge({ id }, options));
    }
  };
  const resetList = (id) => {
    const index = lists.value.findIndex((l) => l.id === id);
    let defaultListData = {};
    switch (id) {
      case 1 || 2 || 9 || 10 || 11 || 12:
        defaultListData = getDefaultListData('default');
        break;
      case 3 || 6:
        defaultListData = getDefaultListData('timeline');
        break;
      case 4 || 5 || 7 || 8:
        defaultListData = getDefaultListData('chart1');
        break;
      default:
        defaultListData = getDefaultListData('default');
    }
    if (index !== -1) {
      lists.value[index] = deepMerge(toRaw(lists.value[index]), defaultListData);
    } else {
      lists.value.push(deepMerge({ id }, defaultListData));
    }
  };
  const deleteList = (id) => {
    const index = lists.value.findIndex((l) => l.id === id);
    if (index !== -1) {
      lists.value.splice(index, 1);
    }
  };
  return {
    getLists,
    getList,
    setList,
    resetList,
    deleteList,
  };
});

// id
//  1: myNotifications (static)
//  2: notifications (static)
//  3: myProcesses (static)
//  4: myProcessingProcesses (static)
//  5: myEditionProcesses (static)
//  6: processes (static)
//  7: processingProcesses (static)
//  8: editionProcesses (static)
//  9: myProcessingProcessesCount (static)
//  10: myEditionProcessesCount (static)
//  11: processingProcessesCount (static)
//  12: editionProcessesCount (static)

// Structure(e.g.):
//    {id: 0, cursor: null, limit: 5, hasNextChunck: true}

// TODO: The use of  "static" needs to be evaluated
