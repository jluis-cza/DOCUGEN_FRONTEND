import { computed, ref } from 'vue';
import { useTemplatesStore } from '../../stores/docugen-app/templatesStore.js';
import { TemplateService } from '../../services/docugen-app/TemplateService.js';

const unwrapApiData = (response, fallback = {}) => {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return fallback;
};

export const useTemplates = () => {
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
      const response = await TemplateService.listTemplates(params);
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

  const getTemplate = async (id) => {
    try {
      loading.value = true;
      const response = await TemplateService.getTemplate(id);
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
      const response = await TemplateService.getTemplateParameters(id);
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

  const getGenerationAvailability = async () => {
    try {
      loading.value = true;
      const response = await TemplateService.getGenerationAvailability();
      const payload = unwrapApiData(response, { enabled: false });
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S2008';
      return payload;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error consultando disponibilidad';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createTemplate = async (payload) => {
    try {
      loading.value = true;
      const response = await TemplateService.createTemplate(payload);
      success.value = true;
      message.value = response.data.message;
      code.value = response.data.code;
      return response.data.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error creando plantilla';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateTemplate = async (id, payload) => {
    try {
      loading.value = true;
      const response = await TemplateService.updateTemplate(id, payload);
      success.value = true;
      message.value = response.data.message;
      code.value = response.data.code;
      templatesStore.setSelectedTemplate(response.data.data || {});
      return response.data.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error actualizando plantilla';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteTemplate = async (id) => {
    try {
      loading.value = true;
      const response = await TemplateService.deleteTemplate(id);
      success.value = true;
      message.value = response.data.message;
      code.value = response.data.code;
      return response.data.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error eliminando plantilla';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const renderTemplate = async (payload) => {
    try {
      loading.value = true;
      const response = await TemplateService.renderTemplate(payload);
      success.value = true;
      message.value = response.data.message;
      code.value = response.data.code;
      return response.data.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error generando documento';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const generateDocumentRemote = async (payload) => {
    try {
      loading.value = true;
      const response = await TemplateService.generateDocumentRemote(payload);
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || 'S2009';
      return response.data.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error generando documento remoto';
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
    getGenerationAvailability,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    renderTemplate,
    generateDocumentRemote,
  };
};
