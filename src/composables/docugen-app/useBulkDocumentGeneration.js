import { computed, ref } from 'vue';
import { normalizeImageValue, validateConfigData } from './usePresentationConfig.js';

export const MAX_BULK_DOCUMENTS = 100;

const createBulkRow = (placeholders, id) => ({
  id: `document-${id}`,
  data: Object.fromEntries(
    placeholders.map((placeholder) => [
      placeholder.key,
      placeholder.type === 'boolean' && !placeholder.allowedValues?.length ? false : '',
    ])
  ),
  errors: {},
  status: 'pending',
  url: '',
  fileName: '',
  error: '',
});

export const useBulkDocumentGeneration = ({
  templateId,
  template,
  placeholders,
  placeholdersList,
  generateDocumentsBulk,
  showNotification,
  setGenerating,
}) => {
  let nextBulkRowId = 1;
  const createNextBulkRow = () => createBulkRow(placeholdersList.value, nextBulkRowId++);
  const isBulkGenerating = ref(false);
  const bulkRows = ref([createNextBulkRow()]);
  const bulkHasResults = computed(() => bulkRows.value.some((row) => row.url || row.error));
  const successfulBulkRows = computed(() => bulkRows.value.filter((row) => row.url));
  const canGenerateBulk = computed(
    () =>
      !isBulkGenerating.value &&
      bulkRows.value.length > 0 &&
      bulkRows.value.length <= MAX_BULK_DOCUMENTS &&
      bulkRows.value.every((row) => validateConfigData(row.data, placeholders.value).isValid)
  );

  const addBulkRow = () => {
    if (bulkRows.value.length >= MAX_BULK_DOCUMENTS) return;
    bulkRows.value.push(createNextBulkRow());
  };

  const resetBulkRows = () => {
    bulkRows.value = [createNextBulkRow()];
  };

  const removeBulkRow = (rowId) => {
    if (bulkRows.value.length <= 1) return;
    bulkRows.value = bulkRows.value.filter((row) => row.id !== rowId);
  };

  const updateBulkValue = (row, placeholder, value) => {
    row.data[placeholder.key] =
      placeholder.type === 'image' ? normalizeImageValue(value) : (value ?? '');
    row.status = 'pending';
    row.url = '';
    row.fileName = '';
    row.error = '';
    row.errors = validateConfigData(row.data, placeholders.value).errors;
  };

  const generateBulkPdfs = async () => {
    const invalidRows = [];
    bulkRows.value.forEach((row, index) => {
      const validation = validateConfigData(row.data, placeholders.value);
      row.errors = validation.errors;
      row.status = validation.isValid ? 'pending' : 'invalid';
      if (!validation.isValid) invalidRows.push(index + 1);
    });
    if (invalidRows.length) {
      showNotification(
        `Completa los datos obligatorios de las filas: ${invalidRows.join(', ')}.`,
        'W0002',
        'persistent'
      );
      return;
    }

    isBulkGenerating.value = true;
    setGenerating(true);
    try {
      const result = await generateDocumentsBulk({
        templateId: templateId.value,
        metadata: { documentName: template.value?.name || 'Documento' },
        documents: bulkRows.value.map((row) => ({
          id: row.id,
          data: row.data,
          metadata: { documentName: template.value?.name || 'Documento' },
        })),
      });

      const resultsById = new Map((result?.results || []).map((item) => [item.id, item]));
      bulkRows.value.forEach((row, index) => {
        const item = resultsById.get(row.id) || result?.results?.[index];
        if (item?.success) {
          row.url = item.url;
          row.fileName = item.fileName || '';
          row.error = '';
          row.status = 'success';
        } else {
          row.url = '';
          row.fileName = '';
          row.status = 'error';
          row.error = item?.error?.message || 'No se pudo generar el PDF.';
        }
      });

      const succeeded = successfulBulkRows.value.length;
      const failed = bulkRows.value.length - succeeded;
      showNotification(
        failed
          ? `Lote procesado: ${succeeded} PDF(s) generado(s), ${failed} con error.`
          : `Se generaron ${succeeded} PDF(s) correctamente.`,
        failed ? 'S2011' : 'S2010',
        failed ? 'persistent' : 'short'
      );
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo generar el lote de PDFs.';
      console.error('Error generando PDFs masivos:', error);
      showNotification(message, error?.response?.data?.code || 'E2007', 'persistent');
    } finally {
      isBulkGenerating.value = false;
      setGenerating(false);
    }
  };

  const downloadBulkPdfs = () => {
    const rows = successfulBulkRows.value;
    rows.forEach((row) => {
      const link = document.createElement('a');
      link.href = row.url;
      link.download = row.fileName || 'documento.pdf';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
    showNotification(`Se solicitaron las descargas de ${rows.length} PDF(s).`, 'S2010', 'short');
  };

  return {
    isBulkGenerating,
    bulkRows,
    bulkHasResults,
    successfulBulkRows,
    canGenerateBulk,
    addBulkRow,
    resetBulkRows,
    removeBulkRow,
    updateBulkValue,
    generateBulkPdfs,
    downloadBulkPdfs,
  };
};
