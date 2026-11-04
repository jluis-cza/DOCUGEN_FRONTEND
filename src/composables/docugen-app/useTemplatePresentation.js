import { ref } from 'vue';
import { PresentationService } from '../../services/docugen-app/PresentationService.js';

export const useTemplatePresentation = () => {
  const loading = ref(false);
  const success = ref(null);
  const message = ref('');
  const code = ref('');

  const renderTemplate = async (payload) => {
    try {
      loading.value = true;
      const response = await PresentationService.renderTemplate(payload);
      success.value = true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || '';
      return response.data?.data;
    } catch (error) {
      success.value = false;
      message.value = error.response?.data?.message || 'Error generando documento';
      code.value = error.response?.data?.code || 'EXXX';
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return { loading, success, message, code, renderTemplate };
};
