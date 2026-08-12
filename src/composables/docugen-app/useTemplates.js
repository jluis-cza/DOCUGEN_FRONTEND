import { computed, ref } from 'vue';
import { useTemplatesStore } from '../../stores/docugen-app/templatesStore.js';
import { TemplateService } from '../../services/docugen-app/TemplateService.js';

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
      templatesStore.setTemplates(response.data.data.templates || []);
      success.value = response.data.success;
      message.value = response.data.message;
      code.value = response.data.code;
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
      templatesStore.setSelectedTemplate(response.data.data || {});
      return response.data.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error cargando plantilla';
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

  return {
    templates,
    selectedTemplate,
    loading,
    success,
    message,
    code,
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    renderTemplate,
  };
};
