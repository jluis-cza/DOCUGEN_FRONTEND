import { ref } from 'vue';
import { useTemplatesStore } from '../../stores/docugen-app/templatesStore.js';
import { EditorService } from '../../services/docugen-app/EditorService.js';

export const useTemplateEditor = () => {
  const templatesStore = useTemplatesStore();
  const loading = ref(false);
  const success = ref(null);
  const message = ref('');
  const code = ref('');

  const runEditorOperation = async (operation, fallbackMessage) => {
    try {
      loading.value = true;
      const response = await operation();
      success.value = true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || '';
      return response.data?.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || fallbackMessage;
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createTemplate = (payload) =>
    runEditorOperation(() => EditorService.createTemplate(payload), 'Error creando plantilla');

  const updateTemplate = async (id, payload) => {
    const template = await runEditorOperation(
      () => EditorService.updateTemplate(id, payload),
      'Error actualizando plantilla'
    );
    templatesStore.setSelectedTemplate(template || {});
    return template;
  };

  const deleteTemplate = (id) =>
    runEditorOperation(() => EditorService.deleteTemplate(id), 'Error eliminando plantilla');

  return { loading, success, message, code, createTemplate, updateTemplate, deleteTemplate };
};
