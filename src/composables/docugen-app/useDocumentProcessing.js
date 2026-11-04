import { ref } from 'vue';
import { ProcessingService } from '../../services/docugen-app/ProcessingService.js';

export const useDocumentProcessing = () => {
  const loading = ref(false);
  const success = ref(null);
  const message = ref('');
  const code = ref('');

  const runProcessingOperation = async (operation, fallbackMessage, fallbackCode) => {
    try {
      loading.value = true;
      const response = await operation();
      success.value = response.data?.success ?? true;
      message.value = response.data?.message || '';
      code.value = response.data?.code || fallbackCode;
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

  const generateDocumentRemote = (payload) =>
    runProcessingOperation(
      () => ProcessingService.generateDocumentRemote(payload),
      'Error generando documento remoto',
      'S2009'
    );

  const generateDocumentsBulk = (payload) =>
    runProcessingOperation(
      () => ProcessingService.generateDocumentsBulk(payload),
      'Error generando documentos masivos',
      'S2010'
    );

  return {
    loading,
    success,
    message,
    code,
    generateDocumentRemote,
    generateDocumentsBulk,
  };
};
