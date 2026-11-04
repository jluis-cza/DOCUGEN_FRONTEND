<template>
  <div class="presentation-shell">
    <!-- Top Bar -->
    <v-app-bar
      v-if="!isLoadingTemplate"
      color="surface"
      flat
      class="presentation-topbar border-b"
      density="comfortable"
    >
      <template #prepend>
        <v-btn icon="mdi-arrow-left" variant="text" color="primary" @click="backToEditor" />
      </template>

      <div class="presentation-heading">
        <div class="text-start">
          <div class="text-caption text-medium-emphasis">Plantilla</div>
          <div class="text-subtitle-1 font-weight-bold">{{ template?.name || 'Documento' }}</div>
        </div>
      </div>

      <template #append>
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-btn
            v-if="generatorSection === 'single'"
            size="small"
            variant="tonal"
            :prepend-icon="viewMode === 'form' ? 'mdi-code-json' : 'mdi-form-textbox'"
            @click="toggleViewMode"
          >
            {{ viewMode === 'form' ? 'JSON' : 'Formulario' }}
          </v-btn>

          <v-divider vertical class="mx-2" />

          <v-btn
            v-if="generatorSection === 'single'"
            size="small"
            variant="tonal"
            prepend-icon="mdi-refresh"
            @click="resetConfig"
            :disabled="isGenerating"
          >
            Limpiar
          </v-btn>

          <v-btn
            v-if="generatorSection === 'single'"
            size="small"
            color="primary"
            prepend-icon="mdi-file-pdf-box"
            @click="generatePdf"
            :loading="isGenerating"
            :disabled="!canGeneratePdf"
          >
            {{ pdfUrl ? 'Regenerar' : 'Generar' }} PDF
          </v-btn>

          <v-btn
            v-if="generatorSection === 'single' && pdfUrl"
            size="small"
            color="success"
            prepend-icon="mdi-download"
            @click="downloadPdf"
          >
            Descargar
          </v-btn>

          <template v-if="generatorSection === 'bulk'">
            <v-btn
              size="small"
              color="primary"
              prepend-icon="mdi-file-multiple"
              :loading="isBulkGenerating"
              :disabled="!canGenerateBulk"
              @click="generateBulkPdfs"
            >
              {{ bulkHasResults ? 'Regenerar' : 'Generar' }} PDFs
            </v-btn>
            <v-btn
              v-if="successfulBulkRows.length"
              size="small"
              color="success"
              prepend-icon="mdi-download-multiple"
              :disabled="isBulkGenerating"
              @click="downloadBulkPdfs"
            >
              Descargar PDFs
            </v-btn>
          </template>
        </div>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-container v-if="!isLoadingTemplate" fluid class="presentation-body pa-4">
      <v-tabs
        v-model="generatorSection"
        color="primary"
        class="generator-section-tabs mb-3"
        density="comfortable"
      >
        <v-tab value="single" prepend-icon="mdi-file-document-edit-outline">
          Generador de documento individual
        </v-tab>
        <v-tab value="bulk" prepend-icon="mdi-file-multiple-outline">
          Generación masiva de documentos
        </v-tab>
      </v-tabs>

      <div v-if="generatorSection === 'single'" class="presentation-layout">
        <!-- Left Panel: Configuration -->
        <div class="config-panel">
          <v-card class="h-100" rounded="xl">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Configuración</span>
              <v-chip size="small" color="primary" variant="tonal">
                {{ Object.keys(placeholders).length }} parámetro{{
                  Object.keys(placeholders).length !== 1 ? 's' : ''
                }}
              </v-chip>
            </v-card-title>

            <v-divider />

            <TemplateConfigurationForm
              :parameters="placeholdersList"
              :values="configData"
              :errors="validationErrors"
              :view-mode="viewMode"
              :json-error="jsonError"
              @update:value="({ key, value }) => updateConfigData(key, value)"
              v-model:json-string="jsonString"
              @sync-json="syncJsonToData"
              @set-image-file-input-ref="setImageFileInputRef"
              @image-file-selected="handleImageParameterFile"
              @request-image-file="openImageFilePicker"
            />
          </v-card>
        </div>

        <!-- Right Panel: PDF Preview -->
        <div class="preview-panel">
          <v-card class="h-100" rounded="xl">
            <v-card-title>
              <span>Vista previa PDF</span>
            </v-card-title>

            <v-divider />

            <div class="preview-content">
              <div v-if="!pdfUrl" class="preview-placeholder">
                <v-icon size="64" class="text-disabled mb-4">mdi-file-pdf-outline</v-icon>
                <div class="text-subtitle-2 text-disabled">No hay PDF generado</div>
                <div class="text-caption text-disabled">
                  Completa la configuración y haz click en "Generar PDF"
                </div>
              </div>

              <iframe v-else :src="pdfUrl" class="pdf-iframe" title="Vista previa PDF" />
            </div>
          </v-card>
        </div>
      </div>

      <PresentationBulkGenerationPanel
        v-else
        :placeholders="placeholdersList"
        :bulk-rows="bulkRows"
        :max-documents="MAX_BULK_DOCUMENTS"
        :is-generating="isBulkGenerating"
        @add-row="addBulkRow"
        @update-value="updateBulkValue"
        @request-image-file="openBulkImagePicker"
        @set-image-file-input-ref="setBulkImageFileInputRef"
        @image-file-selected="handleBulkImageFile"
        @remove-row="removeBulkRow"
      />
    </v-container>

    <!-- Loading Dialog -->
    <v-dialog v-model="showGeneratingDialog" persistent width="400">
      <v-card>
        <v-card-text class="pa-8 text-center">
          <v-progress-circular indeterminate color="primary" class="mb-4" />
          <div class="text-subtitle-1 font-weight-bold">
            {{ generatorSection === 'bulk' ? 'Generando documentos...' : 'Generando documento...' }}
          </div>
          <div class="text-caption text-medium-emphasis">Por favor espera</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Loading Template Dialog -->
    <v-dialog v-model="isLoadingTemplate" persistent width="400">
      <v-card>
        <v-card-text class="pa-8 text-center">
          <v-progress-circular indeterminate color="primary" class="mb-4" />
          <div class="text-subtitle-1 font-weight-bold">Cargando plantilla...</div>
          <div class="text-caption text-medium-emphasis">Por favor espera</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Error Dialog -->
    <v-dialog v-model="showLoadError" persistent width="400">
      <v-card>
        <v-card-text class="pa-8 text-center">
          <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
          <div class="text-subtitle-1 font-weight-bold">Error cargando plantilla</div>
          <div class="text-caption text-medium-emphasis mt-2">{{ loadErrorMessage }}</div>
          <v-btn color="error" class="mt-6" @click="router.push('/dashboard/templates')">
            Volver al listado
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TemplateConfigurationForm from './ConfigurationTemplateForm.vue';
import PresentationBulkGenerationPanel from './PresentationBulkGenerationPanel.vue';
import { useTemplateAcquisition } from '../../composables/docugen-app/useTemplateAcquisition.js';
import { useTemplatePresentation } from '../../composables/docugen-app/useTemplatePresentation.js';
import { useDocumentProcessing } from '../../composables/docugen-app/useDocumentProcessing.js';
import {
  normalizeImageValue,
  usePresentationConfig,
} from '../../composables/docugen-app/usePresentationConfig.js';
import {
  MAX_BULK_DOCUMENTS,
  useBulkDocumentGeneration,
} from '../../composables/docugen-app/useBulkDocumentGeneration.js';
import { usePresentationStore } from '../../stores/docugen-app/presentationStore.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';

const route = useRoute();
const router = useRouter();
const presentationStore = usePresentationStore();
const notificationStore = useNotificationStore();
const { getTemplate, getTemplateParameters } = useTemplateAcquisition();
const { renderTemplate } = useTemplatePresentation();
const { generateDocumentsBulk } = useDocumentProcessing();
const {
  template,
  placeholders,
  configData,
  viewMode,
  isGenerating,
  pdfUrl,
  validationErrors,
  placeholdersList,
  extractPlaceholdersFromTemplate,
  updateConfigData,
  setConfigDataBulk,
  validate,
  toggleViewMode: toggleViewModeAction,
  resetConfig,
} = usePresentationConfig();

const templateId = computed(() => route.params.templateId);
const generatorSection = ref('single');
const jsonString = ref('{}');
const jsonError = ref(null);
const showGeneratingDialog = ref(false);
const isLoadingTemplate = ref(true);
const showLoadError = ref(false);
const loadErrorMessage = ref('');
const imageFileInputs = ref({});
const pdfFileName = ref('');

const canGeneratePdf = computed(() => {
  if (jsonError.value || isGenerating.value) return false;
  const hasParams = Object.keys(placeholders.value || {}).length > 0;
  if (!hasParams) return true;
  return Object.keys(validationErrors.value || {}).length === 0;
});

const getBulkImageInputKey = (rowId, key) => `${rowId}:${key}`;
const setBulkImageFileInputRef = (rowId, key, element) => {
  const inputKey = getBulkImageInputKey(rowId, key);
  if (element) imageFileInputs.value[inputKey] = element;
  else delete imageFileInputs.value[inputKey];
};
const openBulkImagePicker = (rowId, key) => {
  imageFileInputs.value[getBulkImageInputKey(rowId, key)]?.click();
};

const handleBulkImageFile = (row, placeholder, event) => {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    showNotification(
      'Formato no compatible. Selecciona una imagen PNG o JPEG.',
      'W0002',
      'persistent'
    );
    input.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showNotification('La imagen supera el límite de 2 MB.', 'W0002', 'persistent');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      showNotification('No se pudo leer el archivo de imagen.', 'W0002', 'persistent');
    } else {
      updateBulkValue(row, placeholder, reader.result);
    }
    input.value = '';
  };
  reader.onerror = () => {
    showNotification(
      reader.error?.message || 'No se pudo leer el archivo de imagen.',
      'W0002',
      'persistent'
    );
    input.value = '';
  };
  reader.readAsDataURL(file);
};

const showNotification = (message, code, mode = 'persistent') => {
  notificationStore.setNotification({
    message,
    code,
    mode,
  });
};

const {
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
} = useBulkDocumentGeneration({
  templateId,
  template,
  placeholders,
  placeholdersList,
  generateDocumentsBulk,
  showNotification,
  setGenerating: (isGenerating) => {
    showGeneratingDialog.value = isGenerating;
  },
});

const setImageFileInputRef = (key, element) => {
  if (element) imageFileInputs.value[key] = element;
  else delete imageFileInputs.value[key];
};

const openImageFilePicker = (key) => {
  imageFileInputs.value[key]?.click();
};

const handleImageParameterFile = (key, event) => {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;

  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    showNotification(
      'Formato no compatible. Selecciona una imagen PNG o JPEG.',
      'W0002',
      'persistent'
    );
    input.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showNotification('La imagen supera el límite de 2 MB.', 'W0002', 'persistent');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      showNotification('No se pudo leer el archivo de imagen.', 'W0002', 'persistent');
      input.value = '';
      return;
    }
    updateConfigData(key, reader.result);
    validate();
    input.value = '';
  };
  reader.onerror = () => {
    showNotification(
      reader.error?.message || 'No se pudo leer el archivo de imagen.',
      'W0002',
      'persistent'
    );
    input.value = '';
  };
  reader.readAsDataURL(file);
};

onMounted(async () => {
  isLoadingTemplate.value = true;
  loadErrorMessage.value = '';

  if (!templateId.value) {
    loadErrorMessage.value = 'ID de plantilla no encontrado';
    isLoadingTemplate.value = false;
    showLoadError.value = true;
    showNotification('No se encontró el identificador de la plantilla.', 'E0001', 'persistent');
    setTimeout(() => router.push('/dashboard/templates'), 500);
    return;
  }

  try {
    const [tmpl, parameterResponse] = await Promise.all([
      getTemplate(templateId.value, { includeContent: true }),
      getTemplateParameters(templateId.value),
    ]);

    if (!tmpl || !tmpl._id) {
      loadErrorMessage.value = 'La plantilla no existe o no tienes permisos';
      isLoadingTemplate.value = false;
      showLoadError.value = true;
      showNotification('La plantilla no existe o no tienes permisos.', 'E0002', 'persistent');
      setTimeout(() => router.push('/dashboard/templates'), 500);
      return;
    }

    if (!Array.isArray(parameterResponse?.parameters)) {
      throw new Error('La respuesta del servidor no contiene parámetros dinámicos válidos.');
    }

    extractPlaceholdersFromTemplate(tmpl, parameterResponse.parameters);
    resetBulkRows();
    presentationStore.setTemplate(tmpl);
    updateJsonString();
    isLoadingTemplate.value = false;
  } catch (error) {
    loadErrorMessage.value = error?.message || 'Error desconocido cargando plantilla';
    isLoadingTemplate.value = false;
    showLoadError.value = true;
    showNotification('Error cargando la plantilla.', 'E0003', 'persistent');
    setTimeout(() => router.push('/dashboard/templates'), 800);
  }
});

watch(
  () => configData.value,
  () => {
    updateJsonString();
    validate();
  },
  { deep: true }
);

const updateJsonString = () => {
  jsonString.value = JSON.stringify(configData.value, null, 2);
  jsonError.value = null;
};

const syncJsonToData = () => {
  try {
    const parsed = JSON.parse(jsonString.value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Los datos deben ser un objeto JSON.');
    }
    setConfigDataBulk(parsed);
    validate();
    jsonError.value = null;
  } catch (error) {
    jsonError.value = `JSON inválido: ${error.message}`;
    showNotification('El JSON de configuración no es válido.', 'W0001', 'persistent');
  }
};

const toggleViewMode = () => {
  toggleViewModeAction();
  presentationStore.setViewMode(viewMode.value);
};

const generatePdf = async () => {
  if (jsonError.value) {
    showNotification('Corrige el JSON inválido antes de generar el PDF.', 'W0001', 'persistent');
    return;
  }

  if (!validate()) {
    const firstError =
      Object.values(validationErrors.value || {})[0] || 'Completa los valores requeridos';
    showNotification(firstError, 'W0002', 'persistent');
    return;
  }

  isGenerating.value = true;
  showGeneratingDialog.value = true;

  try {
    const result = await renderTemplate({
      templateId: templateId.value,
      metadata: { documentName: template.value?.name || 'Documento' },
      data: configData.value,
    });

    if (result?.url) {
      pdfUrl.value = result.url;
      pdfFileName.value = result.fileName || '';
      presentationStore.setPdfUrl(pdfUrl.value);
      presentationStore.setConfigData(configData.value);
      showNotification('PDF generado correctamente.', 'S2006', 'short');
    }
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'No se pudo generar el PDF';
    console.error('Error generando PDF:', error);
    showNotification(message, error?.response?.data?.code || 'E2007', 'persistent');
  } finally {
    isGenerating.value = false;
    showGeneratingDialog.value = false;
  }
};

const downloadPdf = () => {
  if (pdfUrl.value) {
    const link = document.createElement('a');
    link.href = pdfUrl.value;
    link.download = pdfFileName.value || `${template.value?.name || 'documento'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const backToEditor = () => {
  presentationStore.resetPresentation();
  router.push(`/templates/${templateId.value}/edit`);
};

const handleResetConfig = () => {
  resetConfig();
  pdfUrl.value = null;
  pdfFileName.value = '';
  updateJsonString();
  showNotification('Configuración reiniciada.', 'I0001', 'short');
};

Object.assign(window, {
  resetConfig: handleResetConfig,
});
</script>

<style scoped>
.presentation-shell {
  min-height: calc(100vh - 64px);
  background: linear-gradient(180deg, #f5f7ff 0%, #eef3fb 100%);
}

.presentation-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.presentation-topbar :deep(.v-toolbar__prepend) {
  margin-inline-end: 0;
}

.presentation-heading {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  margin-left: clamp(32px, 12.5vw, 180px);
  min-width: 0;
}

.presentation-body {
  height: calc(100vh - 120px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.generator-section-tabs {
  flex: 0 0 auto;
}

.presentation-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.presentation-layout > * {
  min-width: 0;
}

.config-panel,
.preview-panel {
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
.config-panel .v-card,
.preview-panel .v-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}
.config-panel :deep(.config-content) {
  height: calc(100% - 60px);
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(148, 163, 184, 0.5);
    }
  }
}

.config-panel :deep(.placeholder-field) {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-panel :deep(.json-view) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.config-panel :deep(.json-view textarea) {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  flex: 1;
}

.preview-content {
  height: calc(100% - 60px);
  position: relative;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  text-align: center;
  padding: 40px;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.config-panel :deep(.validation-summary) {
  background: rgba(251, 191, 36, 0.05);
  border-top: 1px solid rgba(251, 191, 36, 0.2);
}

.config-panel :deep(.font-mono) {
  font-family: 'Fira Code', 'Courier New', monospace;
}

@media (max-width: 900px) {
  .presentation-body {
    height: auto;
    min-height: calc(100vh - 120px);
  }

  .presentation-layout {
    flex: none;
    grid-template-columns: 1fr;
  }

  .config-panel,
  .preview-panel {
    height: min(70vh, 720px);
  }
}

@media (max-width: 600px) {
  .presentation-topbar :deep(.v-toolbar__content) {
    height: auto !important;
    min-height: 64px;
    flex-wrap: wrap;
    padding-block: 6px;
  }

  .presentation-heading {
    margin-left: 0;
    min-width: 0;
  }

  .presentation-topbar :deep(.v-toolbar__append) {
    flex: 1 1 100%;
    margin-inline-start: 0;
  }

  .presentation-topbar :deep(.v-toolbar__append > div) {
    width: 100%;
    justify-content: flex-start;
  }

  .presentation-body {
    padding: 8px !important;
  }

  .config-panel,
  .preview-panel {
    height: min(65vh, 600px);
  }

  .preview-placeholder {
    padding: 20px;
  }
}
</style>
