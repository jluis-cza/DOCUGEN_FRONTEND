// This store stores the accounts FETCHED from the database
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils';
import { toRaw } from 'vue';

export const useSessionsStore = defineStore('sessions', () => {
  // States
  const sessions = ref([]);

  //Getters
  const getSessions = computed(() => sessions.value);
  const getAccount = (id) => {
    const index = sessions.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      return sessions.value[index];
    } else {
      return {};
    }
  };
  // Actions
  const setSessions = (data) => {
    sessions.value = data || [];
  };
  const setSession = (id, options) => {
    const index = sessions.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      sessions.value[index] = deepMerge(toRaw(sessions.value[index]), options);
    } else {
      sessions.value.push(options);
      console.log('Se insertó un nuevo documento en el sessionsStore!!!');
    }
  };
  const resetSessions = () => {
    sessions.value = [];
  };

  return {
    //Getters
    getSessions,
    getAccount,
    //Actions
    setSessions,
    setSession,
    resetSessions,
  };
});
