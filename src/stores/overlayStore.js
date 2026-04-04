import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useOverlayStore = defineStore('overlay', () => {
  // States
  const overlay = ref({});
  const overlaySet = ref(false);

  //Getters
  const getOverlay = computed(() => overlay.value);
  const isOverlaySet = computed(() => overlaySet.value);
  // Actions
  const setOverlay = (data) => {
    overlay.value = data || {};
    overlaySet.value = true;
  };
  const resetOverlay = () => {
    overlay.value = {};
    overlaySet.value = false;
  };

  return {
    //Getters
    getOverlay,
    isOverlaySet,
    //Actions
    setOverlay,
    resetOverlay,
  };
});
