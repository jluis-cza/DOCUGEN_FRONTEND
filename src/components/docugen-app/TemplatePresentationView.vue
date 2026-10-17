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

      <v-card v-else class="bulk-panel" rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
          <span>Generación masiva de documentos</span>
          <div class="d-flex align-center ga-2">
            <v-chip size="small" color="primary" variant="tonal">
              {{ bulkRows.length }} / {{ MAX_BULK_DOCUMENTS }} documentos
            </v-chip>
            <v-btn
              size="small"
              variant="tonal"
              prepend-icon="mdi-plus"
              :disabled="bulkRows.length >= MAX_BULK_DOCUMENTS || isBulkGenerating"
              @click="addBulkRow"
            >
              Agregar fila
            </v-btn>
          </div>
        </v-card-title>
        <v-divider />
        <v-card-text class="bulk-table-container pa-4">
          <div v-if="!placeholdersList.length" class="text-center text-medium-emphasis pa-8">
            La plantilla no tiene parámetros dinámicos; cada fila generará el mismo documento.
          </div>
          <div class="bulk-table-scroll">
            <table class="bulk-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th v-for="placeholder in placeholdersList" :key="placeholder.key">
                    {{ placeholder.label || placeholder.key }}
                    <span v-if="placeholder.required" class="text-error">*</span>
                  </th>
                  <th class="status-column">Estado</th>
                  <th class="row-actions-column" aria-label="Acciones"></th>
                  <th class="document-column">Documento</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in bulkRows" :key="row.id">
                  <td>{{ rowIndex + 1 }}</td>
                  <td v-for="placeholder in placeholdersList" :key="placeholder.key">
                    <v-select
                      v-if="placeholder.allowedValues?.length"
                      :model-value="row.data[placeholder.key] ?? ''"
                      :items="placeholder.allowedValues"
                      :error="!!row.errors[placeholder.key]"
                      :error-messages="
                        row.errors[placeholder.key] ? [row.errors[placeholder.key]] : []
                      "
                      density="compact"
                      variant="outlined"
                      hide-details="auto"
                      @update:model-value="(value) => updateBulkValue(row, placeholder, value)"
                    />
                    <v-checkbox
                      v-else-if="placeholder.type === 'boolean'"
                      :model-value="
                        row.data[placeholder.key] === true || row.data[placeholder.key] === 'true'
                      "
                      :error="!!row.errors[placeholder.key]"
                      density="compact"
                      hide-details
                      @update:model-value="(value) => updateBulkValue(row, placeholder, value)"
                    />
                    <v-textarea
                      v-else-if="placeholder.type === 'textarea'"
                      :model-value="row.data[placeholder.key] ?? ''"
                      :error="!!row.errors[placeholder.key]"
                      :error-messages="
                        row.errors[placeholder.key] ? [row.errors[placeholder.key]] : []
                      "
                      rows="1"
                      auto-grow
                      density="compact"
                      variant="outlined"
                      hide-details="auto"
                      @update:model-value="(value) => updateBulkValue(row, placeholder, value)"
                    />
                    <v-text-field
                      v-else
                      :model-value="row.data[placeholder.key] ?? ''"
                      :type="
                        ['number', 'date', 'email', 'url'].includes(placeholder.type)
                          ? placeholder.type
                          : 'text'
                      "
                      :error="!!row.errors[placeholder.key]"
                      :error-messages="
                        row.errors[placeholder.key] ? [row.errors[placeholder.key]] : []
                      "
                      :placeholder="
                        placeholder.type === 'image' ? 'URL o Base64 PNG/JPEG' : placeholder.key
                      "
                      :append-inner-icon="placeholder.type === 'image' ? 'mdi-upload' : undefined"
                      density="compact"
                      variant="outlined"
                      hide-details="auto"
                      @click:append-inner="openBulkImagePicker(row.id, placeholder.key)"
                      @update:model-value="(value) => updateBulkValue(row, placeholder, value)"
                    />
                    <input
                      v-if="placeholder.type === 'image'"
                      :ref="(element) => setBulkImageFileInputRef(row.id, placeholder.key, element)"
                      class="d-none"
                      type="file"
                      accept="image/png,image/jpeg"
                      @change="(event) => handleBulkImageFile(row, placeholder, event)"
                    />
                  </td>
                  <td class="status-column">
                    <v-tooltip v-if="row.error" :text="row.error">
                      <template #activator="{ props }">
                        <v-chip v-bind="props" size="small" color="error" variant="tonal">
                          <v-icon start icon="mdi-alert-circle-outline" /> Error
                        </v-chip>
                      </template>
                    </v-tooltip>
                    <v-chip v-else-if="row.url" size="small" color="success" variant="tonal">
                      <v-icon start icon="mdi-check-circle-outline" /> Generado
                    </v-chip>
                    <v-chip
                      v-else-if="row.status === 'invalid'"
                      size="small"
                      color="warning"
                      variant="tonal"
                    >
                      <v-icon start icon="mdi-alert-outline" /> Revisar datos
                    </v-chip>
                    <v-chip v-else size="small" variant="tonal">Pendiente</v-chip>
                  </td>
                  <td class="row-actions-column">
                    <v-btn
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="text"
                      color="error"
                      aria-label="Eliminar fila"
                      :disabled="bulkRows.length === 1 || isBulkGenerating"
                      @click="removeBulkRow(row.id)"
                    />
                  </td>
                  <td class="document-column">
                    <a
                      v-if="row.url"
                      :href="row.url"
                      target="_blank"
                      rel="noopener"
                      class="text-primary"
                    >
                      Ver PDF
                    </a>
                    <span v-else class="text-medium-emphasis">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="bulkRows.some((row) => Object.keys(row.errors).length)"
            class="text-caption text-error mt-3"
          >
            Corrige los campos marcados antes de generar los documentos.
          </div>
        </v-card-text>
      </v-card>
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
import { useTemplates } from '../../composables/docugen-app/useTemplates.js';
import {
  normalizeImageValue,
  usePresentationConfig,
  validateConfigData,
} from '../../composables/docugen-app/usePresentationConfig.js';
import { usePresentationStore } from '../../stores/docugen-app/presentationStore.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';

const route = useRoute();
const router = useRouter();
const presentationStore = usePresentationStore();
const notificationStore = useNotificationStore();
const { getTemplate, renderTemplate, generateDocumentsBulk } = useTemplates();
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
const MAX_BULK_DOCUMENTS = 100;
const generatorSection = ref('single');
const jsonString = ref('{}');
const jsonError = ref(null);
const showGeneratingDialog = ref(false);
const isLoadingTemplate = ref(true);
const showLoadError = ref(false);
const loadErrorMessage = ref('');
const imageFileInputs = ref({});
const isBulkGenerating = ref(false);
const bulkRowsVersion = ref(0);
let nextBulkRowId = 1;
const pdfFileName = ref('');
const bulkRows = ref([createBulkRow()]);
const bulkHasResults = computed(() => bulkRows.value.some((row) => row.url || row.error));
const successfulBulkRows = computed(() => bulkRows.value.filter((row) => row.url));

const canGeneratePdf = computed(() => {
  if (jsonError.value || isGenerating.value) return false;
  const hasParams = Object.keys(placeholders.value || {}).length > 0;
  if (!hasParams) return true;
  return Object.keys(validationErrors.value || {}).length === 0;
});
const canGenerateBulk = computed(
  () => {
    bulkRowsVersion.value;
    return (
      !isBulkGenerating.value &&
      bulkRows.value.length > 0 &&
      bulkRows.value.length <= MAX_BULK_DOCUMENTS &&
      bulkRows.value.every((row) => validateConfigData(row.data, placeholders.value).isValid)
    );
  }
);

function createBulkRow() {
  const data = Object.fromEntries(
    placeholdersList.value.map((placeholder) => [
      placeholder.key,
      placeholder.type === 'boolean' && !placeholder.allowedValues?.length ? false : '',
    ])
  );
  return {
    id: `document-${nextBulkRowId++}`,
    data,
    errors: {},
    status: 'pending',
    url: '',
    fileName: '',
    error: '',
  };
}

const addBulkRow = () => {
  if (bulkRows.value.length >= MAX_BULK_DOCUMENTS) return;
  bulkRows.value.push(createBulkRow());
  bulkRowsVersion.value += 1;
};

const removeBulkRow = (rowId) => {
  if (bulkRows.value.length <= 1) return;
  bulkRows.value = bulkRows.value.filter((row) => row.id !== rowId);
  bulkRowsVersion.value += 1;
};

const updateBulkValue = (row, placeholder, value) => {
  row.data[placeholder.key] =
    placeholder.type === 'image' ? normalizeImageValue(value) : (value ?? '');
  delete row.errors[placeholder.key];
  row.status = 'pending';
  row.url = '';
  row.fileName = '';
  row.error = '';
  row.errors = validateConfigData(row.data, placeholders.value).errors;
  bulkRowsVersion.value += 1;
};

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
    } else {
      updateBulkValue(row, placeholder, reader.result);
    }
    input.value = '';
  };
  reader.onerror = () => {
    showNotification(reader.error?.message || 'No se pudo leer el archivo de imagen.', 'W0002', 'persistent');
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
    bulkRows.value = [createBulkRow()];
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
  showGeneratingDialog.value = true;
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

.bulk-panel {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.bulk-table-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.bulk-table-scroll {
  width: 100%;
  overflow: auto;
}

.bulk-table {
  width: 100%;
  min-width: max-content;
  border-collapse: separate;
  border-spacing: 0;
}

.bulk-table th,
.bulk-table td {
  min-width: 150px;
  padding: 8px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.bulk-table th:first-child,
.bulk-table td:first-child,
.bulk-table .row-actions-column {
  min-width: 48px;
  width: 48px;
}

.bulk-table .status-column,
.bulk-table .document-column {
  min-width: 130px;
}

.bulk-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f8fafc;
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

  .bulk-panel {
    min-height: 60vh;
  }
}
</style>
