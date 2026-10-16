<template>
  <v-container fluid>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h3>Plantillas</h3>
      </div>
      <div class="d-flex ga-2">
        <v-btn color="secondary" variant="tonal" prepend-icon="mdi-import" @click="triggerImport">
          Importar plantilla
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Crear plantilla
        </v-btn>
      </div>
    </div>

    <input
      ref="importInputRef"
      type="file"
      accept="application/json,.json"
      class="d-none"
      @change="handleImportTemplate"
    />

    <v-card class="mb-4 pa-2">
      <div class="d-flex ga-3 align-center">
        <v-text-field
          v-model="search"
          label="Buscar plantilla"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          @keyup.enter="loadTemplates"
        />
        <v-btn color="primary" @click="loadTemplates" variant="tonal"> Buscar </v-btn>
      </div>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="templates"
        :loading="loading"
        :items-per-page="10"
        :items-per-page-options="[5, 10, 25]"
      >
        <template #[`item.name`]="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip :color="getTemplateStatusColor(item.status)" size="small" label>
            {{ getTemplateStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #[`item.updatedAt`]="{ item }">
          {{ formatUpdatedAt(item.updatedAt) }}
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex ga-2">
            <v-btn
              color="info"
              variant="tonal"
              size="small"
              prepend-icon="mdi-eye-outline"
              @click="openEditor(item._id)"
            >
              Ver
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-information-outline"
              @click="openTemplateDetails(item)"
            >
              Ver detalles
            </v-btn>
            <v-btn
              color="secondary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-download"
              @click="exportTemplate(item)"
            >
              Exportar
            </v-btn>
            <v-btn
              color="warning"
              variant="tonal"
              size="small"
              prepend-icon="mdi-swap-horizontal"
              @click="openStatusDialog(item)"
            >
              Actualizar estado
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              size="small"
              prepend-icon="mdi-delete-outline"
              @click="deleteItem(item._id)"
            >
              Eliminar
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="detailsDialog" max-width="960" persistent scrollable>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Detalle de la plantilla</span>
          <v-btn icon="mdi-close" variant="text" @click="detailsDialog = false" />
        </v-card-title>

        <v-card-text v-if="detailsLoading" class="pt-5">
          <v-progress-linear indeterminate color="primary" />
        </v-card-text>

        <v-card-text v-else-if="selectedTemplateDetails" class="pa-4">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Identificador</div>
                <div class="text-body-2 font-weight-medium">{{ selectedTemplateDetails._id }}</div>
              </v-sheet>
            </v-col>
            <v-col cols="12" md="6">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Nombre</div>
                <div class="text-body-2 font-weight-medium">{{ selectedTemplateDetails.name }}</div>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6" class="d-flex">
              <v-sheet border rounded class="pa-3 mb-3 flex-grow-1">
                <div class="text-caption text-medium-emphasis mb-2">Estado</div>
                <v-chip
                  :color="getTemplateStatusColor(selectedTemplateDetails.status)"
                  size="small"
                  label
                >
                  {{ getTemplateStatusLabel(selectedTemplateDetails.status) }}
                </v-chip>
              </v-sheet>
            </v-col>
            <v-col cols="12" md="6" class="d-flex">
              <v-sheet border rounded class="pa-3 mb-3 flex-grow-1">
                <div class="text-caption text-medium-emphasis mb-2">Elementos</div>
                <div class="text-body-2">{{ (selectedTemplateDetails.elements || []).length }}</div>
              </v-sheet>
            </v-col>

            <v-col cols="12">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Descripción</div>
                <div class="text-body-2">
                  {{ selectedTemplateDetails.description || 'Sin descripción' }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Dimensiones</div>
                <div class="d-flex flex-wrap align-center ga-2">
                  <span class="text-body-2">
                    {{ selectedTemplateDetails.dimensions?.width || 0 }} x
                    {{ selectedTemplateDetails.dimensions?.height || 0 }}
                    {{ selectedTemplateDetails.dimensions?.unit || 'px' }}
                  </span>
                  <span v-if="templateDimensionSummary" class="text-caption text-medium-emphasis">
                    {{ templateDimensionSummary.inches }}
                    ({{ templateDimensionSummary.millimeters }})
                  </span>
                  <span
                    v-if="templateDimensionSummary?.paperSize"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ templateDimensionSummary.paperSize }}
                  </span>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Payload para generación</div>
                <code class="text-caption d-block">{{
                  JSON.stringify({ templateId: selectedTemplateDetails._id }, null, 2)
                }}</code>
              </v-sheet>
            </v-col>
            <v-col cols="12" md="6">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Metadata</div>
                <pre class="metadata-json text-caption mb-0">{{
                  JSON.stringify(selectedTemplateDetails.metadata || {}, null, 2)
                }}</pre>
              </v-sheet>
            </v-col>

            <v-col cols="12">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Parámetros estáticos</div>
                <div v-if="selectedTemplateDetails.staticParameters?.length">
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Clave</th>
                        <th>Tipo</th>
                        <th>Requerido</th>
                        <th>Origen</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(param, index) in selectedTemplateDetails.staticParameters"
                        :key="`${param.key}-${index}`"
                      >
                        <td>{{ param.key }}</td>
                        <td>{{ param.type || 'text' }}</td>
                        <td>{{ param.required ? 'Sí' : 'No' }}</td>
                        <td>{{ param.source || 'elemento' }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
                <div v-else class="text-body-2 text-medium-emphasis">
                  No se detectaron parámetros estáticos.
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">
                  Parámetros dinámicos configurables
                </div>
                <div v-if="selectedTemplateDetails.dynamicParameters?.length">
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Clave</th>
                        <th>Label</th>
                        <th>Tipo</th>
                        <th>Requerido</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(param, index) in selectedTemplateDetails.dynamicParameters"
                        :key="`${param.key}-${index}`"
                      >
                        <td>{{ param.key }}</td>
                        <td>{{ param.label || param.key }}</td>
                        <td>{{ param.type || 'text' }}</td>
                        <td>{{ param.required ? 'Sí' : 'No' }}</td>
                        <td>{{ param.description || 'Sin descripción' }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
                <div v-else class="text-body-2 text-medium-emphasis">
                  No hay parámetros dinámicos definidos para esta plantilla.
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="detailsDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogOpen" max-width="560" persistent>
      <v-card>
        <v-card-title>Crear plantilla</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Nombre de la plantilla" />
          <v-text-field v-model="form.description" label="Descripción" />
          <v-select
            v-model="form.status"
            label="Estado"
            :items="TEMPLATE_STATUS_OPTIONS"
            item-title="title"
            item-value="value"
          />
          <v-select
            v-model="selectedPaperSize"
            label="Tamaño de papel"
            :items="PAPER_SIZES"
            item-title="label"
            item-value="value"
            @update:model-value="applyPaperSize"
          />
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.dimensions.width"
                label="Ancho (px)"
                type="number"
                min="100"
                max="5000"
                step="1"
                :rules="[dimensionRule]"
                hint="Entre 100 y 5000 px"
                persistent-hint
                @update:model-value="selectedPaperSize = 'custom'"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.dimensions.height"
                label="Alto (px)"
                type="number"
                min="100"
                max="5000"
                step="1"
                :rules="[dimensionRule]"
                hint="Entre 100 y 5000 px"
                persistent-hint
                @update:model-value="selectedPaperSize = 'custom'"
              />
            </v-col>
          </v-row>
          <div class="text-caption text-medium-emphasis mt-2">
            * Conversión utilizada: 96 px = 1 pulgada (25,4 mm).
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogOpen = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!canCreateTemplate"
            @click="createNewTemplate"
          >
            Crear plantilla
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="statusDialogOpen" max-width="480" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          Actualizar estado de la plantilla
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            Selecciona el nuevo estado para
            <strong>{{ selectedTemplateForStatus?.name }}</strong
            >.
          </p>
          <v-select
            v-model="selectedStatus"
            label="Nuevo estado"
            :items="TEMPLATE_STATUS_OPTIONS"
            item-title="title"
            item-value="value"
            :disabled="updatingStatus"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="tonal"
            class="bg-secondary"
            :disabled="updatingStatus"
            @click="closeStatusDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            variant="tonal"
            class="bg-primary"
            :loading="updatingStatus"
            :disabled="!selectedStatus || selectedStatus === selectedTemplateForStatus?.status"
            @click="confirmStatusUpdate"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTemplates } from '../../composables/docugen-app/useTemplates.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';
import {
  getTemplateStatusColor,
  getTemplateStatusLabel,
  TEMPLATE_STATUS_OPTIONS,
} from '../../helpers/docugen-app/templateStatus.js';
import { extractTime } from '../../helpers/utils.js';

const router = useRouter();
const notificationStore = useNotificationStore();
const {
  templates,
  loading,
  message,
  code,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
  getTemplateParameters,
} = useTemplates();
const dialogOpen = ref(false);
const statusDialogOpen = ref(false);
const updatingStatus = ref(false);
const selectedTemplateForStatus = ref(null);
const selectedStatus = ref('');
const detailsDialog = ref(false);
const detailsLoading = ref(false);
const search = ref('');
const importInputRef = ref(null);
const selectedTemplateDetails = ref(null);
const PIXELS_PER_INCH = 96;
const MIN_DIMENSION = 100;
const MAX_DIMENSION = 5000;
const PAPER_SIZES = [
  {
    value: 'letter',
    name: 'Carta',
    label: 'Carta — 8.5 × 11 in (216 × 279 mm)',
    width: 816,
    height: 1056,
  },
  {
    value: 'legal',
    name: 'Legal',
    label: 'Legal — 8.5 × 14 in (216 × 356 mm)',
    width: 816,
    height: 1344,
  },
  {
    value: 'oficio',
    name: 'Oficio',
    label: 'Oficio — 8.5 × 13 in (216 × 330 mm)',
    width: 816,
    height: 1248,
  },
  {
    value: 'a4',
    name: 'A4',
    label: 'A4 — 8.27 × 11.69 in (210 × 297 mm)',
    width: 794,
    height: 1123,
  },
  {
    value: 'a3',
    name: 'A3',
    label: 'A3 — 11.69 × 16.54 in (297 × 420 mm)',
    width: 1123,
    height: 1587,
  },
  {
    value: 'a5',
    name: 'A5',
    label: 'A5 — 5.83 × 8.27 in (148 × 210 mm)',
    width: 559,
    height: 794,
  },
  {
    value: 'tabloid',
    name: 'Tabloide',
    label: 'Tabloide — 11 × 17 in (279 × 432 mm)',
    width: 1056,
    height: 1632,
  },
  { value: 'custom', label: 'Personalizado', width: null, height: null },
];
const selectedPaperSize = ref('a4');

const form = ref({
  name: '',
  description: '',
  status: 'draft',
  dimensions: { width: 794, height: 1123 },
});
const isValidDimension = (value) =>
  Number.isInteger(Number(value)) &&
  Number(value) >= MIN_DIMENSION &&
  Number(value) <= MAX_DIMENSION;
const dimensionRule = (value) =>
  isValidDimension(value) ||
  `Ingresa un número entero entre ${MIN_DIMENSION} y ${MAX_DIMENSION} px.`;
const canCreateTemplate = computed(
  () =>
    Boolean(form.value.name.trim()) &&
    isValidDimension(form.value.dimensions.width) &&
    isValidDimension(form.value.dimensions.height) &&
    !loading.value
);
const templateDimensionSummary = computed(() => {
  const dimensions = selectedTemplateDetails.value?.dimensions;
  if (!dimensions || (dimensions.unit && dimensions.unit !== 'px')) return null;

  const width = Number(dimensions.width);
  const height = Number(dimensions.height);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

  const widthInches = width / PIXELS_PER_INCH;
  const heightInches = height / PIXELS_PER_INCH;
  const paperSize = PAPER_SIZES.find(
    (paper) => paper.value !== 'custom' && paper.width === width && paper.height === height
  );
  const landscapePaperSize =
    paperSize ||
    PAPER_SIZES.find(
      (paper) => paper.value !== 'custom' && paper.width === height && paper.height === width
    );
  const isLandscape = !paperSize && Boolean(landscapePaperSize);

  return {
    inches: `${widthInches.toFixed(2)} × ${heightInches.toFixed(2)} in`,
    millimeters: `${(widthInches * 25.4).toFixed(1)} × ${(heightInches * 25.4).toFixed(1)} mm`,
    paperSize: landscapePaperSize
      ? `Tamaño estándar: ${landscapePaperSize.name}${isLandscape ? ' (horizontal)' : ''}`
      : 'Tamaño personalizado',
  };
});

const headers = [
  {
    title: 'Nombre',
    key: 'name',
    headerProps: { class: 'bg-accent font-weight-bold' },
  },
  {
    title: 'Estado',
    key: 'status',
    headerProps: { class: 'bg-accent font-weight-bold' },
  },
  {
    title: 'Actualizado',
    key: 'updatedAt',
    headerProps: { class: 'bg-accent font-weight-bold' },
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
    headerProps: { class: 'bg-accent font-weight-bold' },
  },
];

const normalizePlaceholderKey = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/^\{\{\s*/, '')
    .replace(/\s*\}\}$/, '')
    .replace(/\s+/g, '_');
};

const formatUpdatedAt = (value) => {
  if (!value) return 'Sin fecha';
  const { date, hour } = extractTime(value, 'America/La_Paz', 'short2');
  return `${date}, ${hour.slice(0, 5)}`;
};

const extractStaticParameters = (template) => {
  if (!template || !Array.isArray(template.elements)) return [];

  const paramsMap = new Map();

  template.elements.forEach((element) => {
    const explicitKey = normalizePlaceholderKey(element?.placeholderKey);
    if (explicitKey) {
      paramsMap.set(explicitKey, {
        key: explicitKey,
        label: explicitKey,
        type: element?.type || 'text',
        required: true,
        source: 'placeholder',
      });
    }

    const textContent = [element?.text || '', element?.qrValue || '', element?.src || ''].join(' ');
    const matches = textContent.match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g) || [];

    matches.forEach((match) => {
      const key = normalizePlaceholderKey(match);
      if (!key || paramsMap.has(key)) return;
      paramsMap.set(key, {
        key,
        label: key,
        type: element?.type || 'text',
        required: true,
        source: 'texto',
      });
    });
  });

  return [...paramsMap.values()].sort((a, b) => String(a.key).localeCompare(String(b.key)));
};

const openTemplateDetails = async (item) => {
  if (!item?._id) return;

  try {
    detailsLoading.value = true;
    const payload = await getTemplateParameters(item._id);
    const template = payload?.template || (await getTemplate(item._id));
    const dynamicParameters = Array.isArray(payload?.parameters)
      ? payload.parameters
      : Array.isArray(template?.metadata?.dynamicParameters)
        ? template.metadata.dynamicParameters
        : [];

    selectedTemplateDetails.value = {
      ...template,
      staticParameters: extractStaticParameters(template),
      dynamicParameters,
    };
    detailsDialog.value = true;
  } catch (error) {
    console.error('Error cargando detalle de plantilla', error);
    alert(
      `No se pudo cargar el detalle de la plantilla. Motivo: ${error?.message || 'error desconocido'}`
    );
  } finally {
    detailsLoading.value = false;
  }
};

const openCreateDialog = () => {
  form.value = {
    name: '',
    description: '',
    status: 'draft',
    dimensions: { width: 794, height: 1123 },
  };
  selectedPaperSize.value = 'a4';
  dialogOpen.value = true;
};

const applyPaperSize = (paperSizeValue) => {
  const paperSize = PAPER_SIZES.find(({ value }) => value === paperSizeValue);
  if (!paperSize || paperSize.value === 'custom') return;
  form.value.dimensions = { width: paperSize.width, height: paperSize.height };
};

const openStatusDialog = (template) => {
  selectedTemplateForStatus.value = template;
  selectedStatus.value = template.status || 'draft';
  statusDialogOpen.value = true;
};

const closeStatusDialog = () => {
  if (updatingStatus.value) return;
  statusDialogOpen.value = false;
  selectedTemplateForStatus.value = null;
  selectedStatus.value = '';
};

const confirmStatusUpdate = async () => {
  const template = selectedTemplateForStatus.value;
  if (!template || !selectedStatus.value || updatingStatus.value) return;

  updatingStatus.value = true;
  try {
    const updatedTemplate = await updateTemplate(template._id, { status: selectedStatus.value });
    template.status = updatedTemplate.status;
    if (selectedTemplateDetails.value?._id === updatedTemplate._id) {
      selectedTemplateDetails.value.status = updatedTemplate.status;
    }
    statusDialogOpen.value = false;
    notificationStore.setNotification({
      message: message.value,
      code: code.value,
      mode: 'automatic',
    });
    selectedTemplateForStatus.value = null;
    selectedStatus.value = '';
  } catch (error) {
    notificationStore.setNotification({
      message: error.response?.data?.message || error.message || 'No se pudo actualizar el estado.',
      code: error.response?.data?.code || 'EXXX',
      mode: 'automatic',
    });
  } finally {
    updatingStatus.value = false;
  }
};

const createNewTemplate = async () => {
  if (!canCreateTemplate.value) return;

  const payload = {
    name: form.value.name,
    description: form.value.description,
    status: form.value.status,
    dimensions: {
      width: Number(form.value.dimensions.width),
      height: Number(form.value.dimensions.height),
      unit: 'px',
    },
    elements: [],
    metadata: {},
  };

  try {
    const created = await createTemplate(payload);
    dialogOpen.value = false;
    form.value = {
      name: '',
      description: '',
      status: 'draft',
      dimensions: { width: 794, height: 1123 },
    };

    await loadTemplates();
    if (created && created._id) {
      openEditor(created._id);
    }
  } catch (error) {
    notificationStore.setNotification({
      message: error.response?.data?.message || error.message || 'No se pudo crear la plantilla.',
      code: error.response?.data?.code || 'EXXX',
      mode: 'automatic',
    });
  }
};

const getSafeTemplateName = (value, fallback = 'Plantilla importada') => {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim();
  return cleaned || fallback;
};

const buildExportFileName = (templateName) => {
  const safeName =
    (templateName || 'plantilla')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'plantilla';

  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '')
    .replace('T', '_');

  return `${safeName}_${stamp}.json`;
};

const validateTemplateImportCompatibility = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('El archivo no contiene un objeto de plantilla válido.');
  }

  if (payload._id || payload.owner || payload.createdAt || payload.updatedAt || payload.__v) {
    throw new Error(
      'La plantilla importada contiene metadatos internos que pueden producir conflictos.'
    );
  }

  const schemaVersion = payload?.metadata?.schemaVersion ?? 1;
  if (schemaVersion !== 1) {
    throw new Error('La versión de la plantilla no es compatible con esta instalación.');
  }

  if (!payload.name || typeof payload.name !== 'string') {
    throw new Error('La plantilla importada debe incluir un nombre válido.');
  }

  if (!payload.dimensions || typeof payload.dimensions !== 'object') {
    throw new Error('La plantilla importada debe incluir dimensiones válidas.');
  }

  if (!payload.elements || !Array.isArray(payload.elements)) {
    throw new Error('La plantilla importada debe incluir un array de elementos válido.');
  }

  const firstInvalidElement = payload.elements.find(
    (element) => !element || typeof element !== 'object' || !element.id || !element.type
  );

  if (firstInvalidElement) {
    throw new Error('Hay elementos de la plantilla importada con formato incompatible.');
  }

  const supportedTypes = [
    'text',
    'title',
    'subtitle',
    'paragraph',
    'list',
    'image',
    'placeholder',
    'date',
    'pageNumber',
    'rect',
    'line',
    'footer',
    'qr',
    'signature',
    'separator',
    'table',
    'checkbox',
  ];

  const unsupportedType = payload.elements.find(
    (element) => !supportedTypes.includes(element.type)
  );
  if (unsupportedType) {
    throw new Error(
      `El tipo de elemento "${unsupportedType.type}" no es compatible con esta versión.`
    );
  }
};

const normalizeImportedTemplate = (payload, sourceName = 'Plantilla importada') => {
  validateTemplateImportCompatibility(payload);

  const name = getSafeTemplateName(payload.name, sourceName);
  const description = typeof payload.description === 'string' ? payload.description : '';
  const status = ['draft', 'published', 'archived'].includes(payload.status)
    ? payload.status
    : 'draft';
  const dimensions =
    payload.dimensions && typeof payload.dimensions === 'object'
      ? {
          width: Number(payload.dimensions.width) || 794,
          height: Number(payload.dimensions.height) || 1123,
          unit: payload.dimensions.unit || 'px',
        }
      : { width: 794, height: 1123, unit: 'px' };
  const page =
    payload.page && typeof payload.page === 'object'
      ? payload.page
      : {
          backgroundColor: '#ffffff',
          margin: { top: 40, right: 40, bottom: 40, left: 40 },
        };
  const canvas =
    payload.canvas && typeof payload.canvas === 'object'
      ? payload.canvas
      : {
          version: 1,
          zoom: 1,
          background: '#ffffff',
        };
  const elements = Array.isArray(payload.elements) ? payload.elements : [];
  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};

  return {
    name: sourceName && sourceName !== 'Plantilla importada' ? sourceName : name,
    description,
    status,
    dimensions,
    page,
    canvas,
    elements,
    metadata: {
      ...metadata,
      schemaVersion: 1,
      importedAt: new Date().toISOString(),
      importedFrom: sourceName,
    },
  };
};

const triggerImport = () => {
  importInputRef.value?.click();
};

const handleImportTemplate = async (event) => {
  const file = event?.target?.files?.[0];
  if (!file) return;

  try {
    const content = await file.text();
    const parsed = JSON.parse(content);
    const sourceName = file.name.replace(/\.json$/i, '') || 'Plantilla importada';
    const normalized = normalizeImportedTemplate(parsed, sourceName);
    await createTemplate(normalized);
    await loadTemplates();
  } catch (error) {
    console.error('Error importando plantilla', error);
    alert(`No se pudo importar la plantilla. Motivo: ${error.message || 'archivo inválido'}`);
  } finally {
    event.target.value = '';
  }
};

const exportTemplate = async (item) => {
  if (!item) return;

  const payload = {
    name: item.name || 'Plantilla exportada',
    description: item.description || '',
    status: item.status || 'draft',
    dimensions: item.dimensions || { width: 794, height: 1123, unit: 'px' },
    page: item.page || {
      backgroundColor: '#ffffff',
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    canvas: item.canvas || {
      version: 1,
      zoom: 1,
      background: '#ffffff',
    },
    elements: Array.isArray(item.elements) ? item.elements : [],
    metadata: {
      ...(item.metadata || {}),
      schemaVersion: 1,
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = buildExportFileName(item.name || 'plantilla');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const openEditor = (templateId) => {
  if (!templateId) return;
  router.push(`/templates/${templateId}/edit`);
};

const deleteItem = async (templateId) => {
  try {
    await deleteTemplate(templateId);
    notificationStore.setNotification({
      message: message.value,
      code: code.value,
      mode: 'automatic',
    });
    await loadTemplates();
  } catch (error) {
    notificationStore.setNotification({
      message:
        error.response?.data?.message || error.message || 'No se pudo eliminar la plantilla.',
      code: error.response?.data?.code || 'EXXX',
      mode: 'automatic',
    });
  }
};

const loadTemplates = async () => {
  await listTemplates({ page: 1, limit: 10, search: search.value });
};

onMounted(async () => {
  await loadTemplates();
});
</script>

<style scoped>
.metadata-json {
  max-height: 240px;
  overflow-x: hidden;
  overflow-y: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
