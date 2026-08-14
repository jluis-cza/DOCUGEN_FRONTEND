import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePresentationStore = defineStore('presentation', () => {
  // States
  const currentTemplate = ref(null);
  const currentConfigData = ref({});
  const currentPdfUrl = ref(null);
  const currentViewMode = ref('form'); // 'form' o 'json'

  // Getters
  const getTemplate = computed(() => currentTemplate.value);
  const getConfigData = computed(() => currentConfigData.value);
  const getPdfUrl = computed(() => currentPdfUrl.value);
  const getViewMode = computed(() => currentViewMode.value);

  // Actions
  const setTemplate = (template) => {
    currentTemplate.value = template;
  };

  const setConfigData = (data) => {
    currentConfigData.value = { ...data };
  };

  const setPdfUrl = (url) => {
    currentPdfUrl.value = url;
  };

  const setViewMode = (mode) => {
    currentViewMode.value = mode;
  };

  const resetPresentation = () => {
    currentTemplate.value = null;
    currentConfigData.value = {};
    currentPdfUrl.value = null;
    currentViewMode.value = 'form';
  };

  return {
    // Getters
    getTemplate,
    getConfigData,
    getPdfUrl,
    getViewMode,

    // Actions
    setTemplate,
    setConfigData,
    setPdfUrl,
    setViewMode,
    resetPresentation,
  };
});
