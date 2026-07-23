import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMyProfileStore = defineStore('myProfile', () => {
  // States
  const myProfile = ref({});

  //Getters
  const getMyProfile = computed(() => myProfile.value);

  // Actions
  const setMyProfile = (data) => {
    myProfile.value = data || {};
    return true;
  };
  const resetMyProfile = () => {
    myProfile.value = {};
  };

  return {
    //Getters
    getMyProfile,
    //Actions
    setMyProfile,
    resetMyProfile,
  };
});
