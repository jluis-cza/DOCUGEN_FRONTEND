import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTemplatesStore = defineStore('docugen-app-templates', () => {
  const templates = ref([]);
  const selectedTemplate = ref({});

  const getTemplates = computed(() => templates.value);
  const getSelectedTemplate = computed(() => selectedTemplate.value);

  const setTemplates = (data = []) => {
    templates.value = data;
  };

  const setSelectedTemplate = (data = {}) => {
    selectedTemplate.value = data;
  };

  const resetSelectedTemplate = () => {
    selectedTemplate.value = {};
  };

  return {
    getTemplates,
    getSelectedTemplate,
    setTemplates,
    setSelectedTemplate,
    resetSelectedTemplate,
  };
});
