import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils.js';
import { toRaw } from 'vue';
import { LISTS } from '../../constants/lists.js';

const getDefaultListData = () => JSON.parse(JSON.stringify(LISTS.default))
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
    const index = lists.value.findIndex((l)=> l.id === id);
    if (index !== -1) {
      lists.value[index] = deepMerge(toRaw(lists.value[index]), options);
    } else {
      lists.value.push(deepMerge({ id }, options)); 
    }
  };
  const resetList = (id) => {
    const index = lists.value.findIndex((l)=> l.id === id);
    if (index !== -1) {
      lists.value[index] = deepMerge(toRaw(lists.value[index]), getDefaultListData());
    } else {
      lists.value.push(deepMerge({ id }, getDefaultListData()));
    }
  };
  const deleteList = (id) => {
    const index = lists.value.findIndex((l)=> l.id === id);
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
// Structure(e.g.):
//    {id: 0, cursor: null, limit: 5, hasNextChunck: true}
