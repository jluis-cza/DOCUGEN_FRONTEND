import { computed, ref } from 'vue';
import { useTemplatesStore } from '../../stores/docugen-app/templatesStore.js';
import { AcquisitionService } from '../../services/docugen-app/AcquisitionService.js';

const unwrapApiData = (response, fallback = {}) => {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return fallback;
};

export const useTemplateAcquisition = () => {
  const templatesStore = useTemplatesStore();
  const loading = ref(false);
  const success = ref(null);
  const message = ref('');
  const code = ref('');

  const templates = computed(() => templatesStore.getTemplates);
  const selectedTemplate = computed(() => templatesStore.getSelectedTemplate);

  const listTemplates = async (params = { page: 1, limit: 10, search: '' }) => {
    try {
      loading.value = true;
      const response = await AcquisitionService.listTemplates(params);
      const payload = unwrapApiData(response, { templates: [] });
      const items = Array.isArray(payload?.templates)
        ? payload.templates
        : Array.isArray(payload)
          ? payload
          : [];

      templatesStore.setTemplates(items);
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S2001';
      return response;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error listando plantillas';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getTemplate = async (id, { includeContent = false } = {}) => {
    try {
      loading.value = true;
      const response = await AcquisitionService.getTemplate(id, includeContent);
      const template = unwrapApiData(response, {});
      templatesStore.setSelectedTemplate(template || {});
      return template || {};
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error cargando plantilla';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getTemplateParameters = async (id) => {
    try {
      loading.value = true;
      const response = await AcquisitionService.getTemplateParameters(id);
      const payload = unwrapApiData(response, { parameters: [] });
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S2007';
      return payload;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error cargando parámetros';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    templates,
    selectedTemplate,
    loading,
    success,
    message,
    code,
    listTemplates,
    getTemplate,
    getTemplateParameters,
  };
};
