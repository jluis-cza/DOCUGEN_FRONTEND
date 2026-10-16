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
            size="small"
            variant="tonal"
            :prepend-icon="viewMode === 'form' ? 'mdi-code-json' : 'mdi-form-textbox'"
            @click="toggleViewMode"
          >
            {{ viewMode === 'form' ? 'JSON' : 'Formulario' }}
          </v-btn>

          <v-divider vertical class="mx-2" />

          <v-btn
            size="small"
            variant="tonal"
            prepend-icon="mdi-refresh"
            @click="resetConfig"
            :disabled="isGenerating"
          >
            Limpiar
          </v-btn>

          <v-btn
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
            v-if="pdfUrl"
            size="small"
            color="success"
            prepend-icon="mdi-download"
            @click="downloadPdf"
          >
            Descargar
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-container v-if="!isLoadingTemplate" fluid class="presentation-body pa-4">
      <div class="presentation-layout">
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

            <v-card-text class="config-content pa-4">
              <!-- Form View -->
              <div v-if="viewMode === 'form'" class="form-view">
                <div v-if="placeholdersList.length === 0" class="text-center pa-8">
                  <v-icon size="48" class="text-disabled mb-4">mdi-information-outline</v-icon>
                  <div class="text-subtitle-2 text-disabled">No hay parámetros dinámicos</div>
                  <div class="text-caption text-disabled">Todos los datos son estáticos</div>
                </div>

                <div v-else class="d-flex flex-column ga-4">
                  <div
                    v-for="placeholder in placeholdersList"
                    :key="placeholder.key"
                    class="placeholder-field"
                  >
                    <v-select
                      v-if="placeholder.allowedValues?.length"
                      :model-value="configData[placeholder.key] ?? ''"
                      :items="placeholder.allowedValues"
                      :label="placeholder.label || placeholder.key"
                      :error="!!validationErrors[placeholder.key]"
                      :error-messages="
                        validationErrors[placeholder.key] ? [validationErrors[placeholder.key]] : []
                      "
                      :hint="placeholder.description || `Usado en: ${placeholder.elementType}`"
                      persistent-hint
                      density="comfortable"
                      variant="outlined"
                      @update:model-value="(val) => updateConfigData(placeholder.key, val)"
                    />
                    <v-checkbox
                      v-else-if="placeholder.type === 'boolean'"
                      :model-value="configData[placeholder.key] === true || configData[placeholder.key] === 'true'"
                      :label="placeholder.label || placeholder.key"
                      :error="!!validationErrors[placeholder.key]"
                      :error-messages="
                        validationErrors[placeholder.key] ? [validationErrors[placeholder.key]] : []
                      "
                      :hint="placeholder.description || `Usado en: ${placeholder.elementType}`"
                      persistent-hint
                      density="comfortable"
                      @update:model-value="(val) => updateConfigData(placeholder.key, val)"
                    />
                    <div v-else-if="placeholder.type === 'image'" class="d-flex flex-column ga-2">
                      <v-text-field
                        :model-value="configData[placeholder.key] ?? ''"
                        :label="placeholder.label || placeholder.key"
                        autocomplete="off"
                        :error="!!validationErrors[placeholder.key]"
                        :error-messages="
                          validationErrors[placeholder.key] ? [validationErrors[placeholder.key]] : []
                        "
                        hint="Imagen dinámica para este parámetro: pega una URL HTTP(S), un data URL o Base64 PNG/JPEG. También puedes cargar un archivo."
                        persistent-hint
                        density="comfortable"
                        variant="outlined"
                        @update:model-value="(val) => updateConfigData(placeholder.key, val)"
                      />
                      <input
                        :ref="(el) => setImageFileInputRef(placeholder.key, el)"
                        class="d-none"
                        type="file"
                        accept="image/png,image/jpeg"
                        @change="(event) => handleImageParameterFile(placeholder.key, event)"
                      />
                      <div class="d-flex align-center ga-2">
                        <v-btn
                          size="x-small"
                          variant="text"
                          color="primary"
                          prepend-icon="mdi-upload"
                          @click="openImageFilePicker(placeholder.key)"
                        >
                          Subir imagen dinámica · {{ placeholder.label || placeholder.key }}
                        </v-btn>
                        <span class="text-caption text-medium-emphasis">PNG/JPEG · máx. 2 MB</span>
                      </div>
                      <v-img
                        v-if="String(configData[placeholder.key] || '').startsWith('data:image/')"
                        :src="configData[placeholder.key]"
                        max-width="120"
                        max-height="80"
                        class="rounded border"
                        cover
                      />
                    </div>
                    <v-textarea
                      v-else-if="placeholder.type === 'textarea'"
                      :model-value="configData[placeholder.key] ?? ''"
                      :label="placeholder.label || placeholder.key"
                      :error="!!validationErrors[placeholder.key]"
                      :error-messages="
                        validationErrors[placeholder.key] ? [validationErrors[placeholder.key]] : []
                      "
                      :hint="placeholder.description || `Usado en: ${placeholder.elementType}`"
                      persistent-hint
                      density="comfortable"
                      variant="outlined"
                      @update:model-value="(val) => updateConfigData(placeholder.key, val)"
                    />
                    <v-text-field
                      v-else
                      :model-value="configData[placeholder.key] || ''"
                      :label="placeholder.label || placeholder.key"
                      :type="
                        ['number', 'date', 'email', 'url'].includes(placeholder.type)
                          ? placeholder.type
                          : 'text'
                      "
                      :error="!!validationErrors[placeholder.key]"
                      :error-messages="
                        validationErrors[placeholder.key] ? [validationErrors[placeholder.key]] : []
                      "
                      density="comfortable"
                      variant="outlined"
                      :hint="
                        placeholder.description ||
                        (placeholder.example
                          ? `Ejemplo: ${placeholder.example}`
                          : `Usado en: ${placeholder.elementType}`)
                      "
                      persistent-hint
                      @update:model-value="(val) => updateConfigData(placeholder.key, val)"
                    />
                  </div>
                </div>
              </div>

              <!-- JSON View -->
              <div v-else class="json-view">
                <div class="text-caption text-medium-emphasis mb-2">
                  Edita el JSON de los parámetros directamente:
                </div>
                <v-textarea
                  v-model="jsonString"
                  label="Datos (JSON)"
                  rows="12"
                  density="compact"
                  variant="outlined"
                  font-family="monospace"
                  @blur="syncJsonToData"
                  class="font-mono"
                />
                <div v-if="jsonError" class="text-caption text-error mt-2">{{ jsonError }}</div>
              </div>
            </v-card-text>

            <!-- Validation Summary -->
            <div v-if="Object.keys(validationErrors).length > 0" class="validation-summary">
              <v-alert type="warning" density="compact" class="ma-4">
                <div class="text-subtitle-2 font-weight-bold mb-2">Campos incompletos:</div>
                <ul class="pl-5">
                  <li v-for="(error, key) in validationErrors" :key="key" class="text-caption">
                    <strong>{{ key }}:</strong> {{ error }}
                  </li>
                </ul>
              </v-alert>
            </div>
          </v-card>
        </div>

        <!-- Right Panel: PDF Preview -->
        <div class="preview-panel">
          <v-card class="h-100" rounded="xl">
            <v-card-title>
              <span>Preview PDF</span>
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

              <iframe v-else :src="pdfUrl" class="pdf-iframe" title="PDF Preview" />
            </div>
          </v-card>
        </div>
      </div>
    </v-container>

    <!-- Loading Dialog -->
    <v-dialog v-model="showGeneratingDialog" persistent width="400">
      <v-card>
        <v-card-text class="pa-8 text-center">
          <v-progress-circular indeterminate color="primary" class="mb-4" />
          <div class="text-subtitle-1 font-weight-bold">Generando documento...</div>
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
import { useTemplates } from '../../composables/docugen-app/useTemplates.js';
import { usePresentationConfig } from '../../composables/docugen-app/usePresentationConfig.js';
import { usePresentationStore } from '../../stores/docugen-app/presentationStore.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';

const route = useRoute();
const router = useRouter();
const presentationStore = usePresentationStore();
const notificationStore = useNotificationStore();
const { getTemplate, renderTemplate } = useTemplates();
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
const jsonString = ref('{}');
const jsonError = ref(null);
const showGeneratingDialog = ref(false);
const isLoadingTemplate = ref(true);
const showLoadError = ref(false);
const loadErrorMessage = ref('');
const imageFileInputs = ref({});

const canGeneratePdf = computed(() => {
  if (jsonError.value || isGenerating.value) return false;
  const hasParams = Object.keys(placeholders.value || {}).length > 0;
  if (!hasParams) return true;
  return Object.keys(validationErrors.value || {}).length === 0;
});

const showNotification = (message, code, mode = 'persistent') => {
  notificationStore.setNotification({
    message,
    code,
    mode,
  });
};

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
    showNotification('Formato no compatible. Selecciona una imagen PNG o JPEG.', 'W0002', 'persistent');
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
    showNotification(reader.error?.message || 'No se pudo leer el archivo de imagen.', 'W0002', 'persistent');
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
    const tmpl = await getTemplate(templateId.value);

    if (!tmpl || !tmpl._id) {
      loadErrorMessage.value = 'La plantilla no existe o no tienes permisos';
      isLoadingTemplate.value = false;
      showLoadError.value = true;
      showNotification('La plantilla no existe o no tienes permisos.', 'E0002', 'persistent');
      setTimeout(() => router.push('/dashboard/templates'), 500);
      return;
    }

    extractPlaceholdersFromTemplate(tmpl);
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
    link.download = `${template.value?.name || 'documento'}.pdf`;
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
}

.presentation-body {
  height: calc(100vh - 120px);
  padding: 16px;
}

.presentation-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
.config-content {
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

.placeholder-field {
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

.json-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.json-view textarea {
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

.validation-summary {
  background: rgba(251, 191, 36, 0.05);
  border-top: 1px solid rgba(251, 191, 36, 0.2);
}

.font-mono {
  font-family: 'Fira Code', 'Courier New', monospace;
}
</style>
