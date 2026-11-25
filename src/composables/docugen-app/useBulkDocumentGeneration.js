import { computed, ref } from 'vue';
import { createBulkDocumentsArchive } from '../../helpers/docugen-app/bulkDocumentArchive.js';
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
  imageFileNames: {},
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
  isSingleGenerating = ref(false),
}) => {
  let nextBulkRowId = 1;
  const createNextBulkRow = () => createBulkRow(placeholdersList.value, nextBulkRowId++);
  const isBulkGenerating = ref(false);
  const isBulkDownloading = ref(false);
  const bulkRows = ref([createNextBulkRow()]);
  const bulkHasResults = computed(() => bulkRows.value.some((row) => row.url || row.error));
  const successfulBulkRows = computed(() => bulkRows.value.filter((row) => row.url));
  const canGenerateBulk = computed(
    () =>
      !isBulkGenerating.value &&
      !isBulkDownloading.value &&
      !isSingleGenerating.value &&
      bulkRows.value.length > 0 &&
      bulkRows.value.length <= MAX_BULK_DOCUMENTS &&
      bulkRows.value.every((row) => validateConfigData(row.data, placeholders.value).isValid)
  );

  const addBulkRow = () => {
    if (isBulkGenerating.value || isBulkDownloading.value) return;
    if (bulkRows.value.length >= MAX_BULK_DOCUMENTS) return;
    bulkRows.value.push(createNextBulkRow());
  };

  const resetBulkRows = () => {
    if (isBulkGenerating.value || isBulkDownloading.value) return;
    bulkRows.value = [createNextBulkRow()];
  };

  const removeBulkRow = (rowId) => {
    if (isBulkGenerating.value || isBulkDownloading.value) return;
    if (bulkRows.value.length <= 1) return;
    bulkRows.value = bulkRows.value.filter((row) => row.id !== rowId);
  };

  const updateBulkValue = (row, placeholder, value, imageFileName = '') => {
    if (isBulkGenerating.value || isBulkDownloading.value) return;
    row.data[placeholder.key] =
      placeholder.type === 'image' ? normalizeImageValue(value) : (value ?? '');
    if (placeholder.type === 'image') {
      if (imageFileName) row.imageFileNames[placeholder.key] = imageFileName;
      else delete row.imageFileNames[placeholder.key];
    }
    row.status = 'pending';
    row.url = '';
    row.fileName = '';
    row.error = '';
    row.errors = validateConfigData(row.data, placeholders.value).errors;
  };

  const generateBulkPdfs = async () => {
    if (isBulkGenerating.value || isBulkDownloading.value || isSingleGenerating.value) return;

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

  const downloadBulkPdfs = async () => {
    if (isBulkGenerating.value || isBulkDownloading.value) return;
    const rows = successfulBulkRows.value.map((row) => ({
      ...row,
      data: { ...row.data },
      imageFileNames: { ...row.imageFileNames },
    }));
    if (!rows.length) return;

    isBulkDownloading.value = true;
    try {
      const archive = await createBulkDocumentsArchive({
        rows,
        placeholders: placeholdersList.value,
        fetchPdf: async (url) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`No se pudo descargar un PDF (HTTP ${response.status}).`);
          }
          return response.blob();
        },
      });
      const downloadUrl = URL.createObjectURL(archive);
      const link = document.createElement('a');
      const archiveName =
        String(template.value?.name || 'documentos')
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Za-z0-9_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 100) || 'documentos';
      link.href = downloadUrl;
      link.download = `${archiveName}-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      showNotification(
        `Se descargó un archivo ZIP con ${rows.length} PDF(s) y su índice de datos.`,
        'S2010',
        'short'
      );
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo crear el ZIP de PDFs.';
      console.error('Error descargando PDFs masivos:', error);
      showNotification(message, error?.response?.data?.code || 'E2010', 'persistent');
    } finally {
      isBulkDownloading.value = false;
    }
  };

  return {
    isBulkGenerating,
    isBulkDownloading,
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
