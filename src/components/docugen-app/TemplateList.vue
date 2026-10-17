<template>
  <v-container fluid>
    <div class="d-flex flex-wrap justify-space-between align-center ga-2 mb-4">
      <div>
        <h3>Plantillas</h3>
      </div>
      <div class="d-flex flex-wrap ga-2 template-list-header-actions">
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

    <v-dialog v-model="importDialogOpen" max-width="560" persistent>
      <v-card>
        <v-card-title>Importar plantilla como copia</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="importName"
            label="Nombre de la copia"
            :rules="[templateNameRule]"
            :error-messages="importError ? [importError] : []"
            maxlength="120"
            counter="120"
            autofocus
            :disabled="importing"
            @update:model-value="importError = ''"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="importing" @click="closeImportDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="importing"
            :disabled="!isValidTemplateName(importName)"
            @click="submitTemplateImport"
          >
            Importar copia
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card class="mb-4 pa-2">
      <div class="d-flex flex-wrap ga-3 align-center">
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
        class="responsive-actions-table"
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
          <div class="table-row-actions d-flex ga-2">
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
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-cog-outline"
                  append-icon="mdi-chevron-down"
                >
                  Actualizar plantilla
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item
                  prepend-icon="mdi-rename-box"
                  title="Actualizar nombre"
                  @click="openRenameDialog(item)"
                />
                <v-list-item
                  prepend-icon="mdi-swap-horizontal"
                  title="Actualizar estado"
                  @click="openStatusDialog(item)"
                />
                <v-list-item
                  prepend-icon="mdi-delete-outline"
                  title="Eliminar"
                  class="text-error"
                  @click="openDeleteDialog(item)"
                />
              </v-list>
            </v-menu>
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
          <v-text-field
            v-model="form.name"
            label="Nombre de la plantilla"
            :rules="[templateNameRule]"
            maxlength="120"
            counter="120"
          />
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

    <v-dialog v-model="renameDialogOpen" max-width="480" persistent>
      <v-card>
        <v-card-title>Actualizar nombre de plantilla</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="renameName"
            label="Nombre de la plantilla"
            :rules="[templateNameRule]"
            :error-messages="renameError ? [renameError] : []"
            maxlength="120"
            counter="120"
            autofocus
            :disabled="renaming"
            @update:model-value="renameError = ''"
          />
          <div class="text-caption text-medium-emphasis">
            El nombre debe ser único en tu cuenta. Se permiten letras, números y puntuación común,
            excepto caracteres de ruta y control.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="renaming" @click="closeRenameDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="renaming"
            :disabled="
              !isValidTemplateName(renameName) ||
              renameName.trim() === selectedTemplateForRename?.name
            "
            @click="confirmRename"
          >
            Guardar nombre
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

    <v-dialog v-model="deleteDialogOpen" max-width="480" persistent>
      <v-card>
        <v-card-title class="text-error">Eliminar plantilla</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar la plantilla
          <strong>{{ selectedTemplateForDelete?.name }}</strong
          >? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="deleting" @click="closeDeleteDialog">Cancelar</v-btn>
          <v-btn color="error" variant="text" :loading="deleting" @click="confirmDelete">
            Eliminar plantilla
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
const deleteDialogOpen = ref(false);
const deleting = ref(false);
const selectedTemplateForDelete = ref(null);
const importDialogOpen = ref(false);
const importing = ref(false);
const importName = ref('');
const importError = ref('');
const pendingImport = ref(null);
const renameDialogOpen = ref(false);
const renaming = ref(false);
const renameName = ref('');
const renameError = ref('');
const selectedTemplateForRename = ref(null);
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

const isValidTemplateName = (value) => {
  if (typeof value !== 'string') return false;
  const name = value.normalize('NFC').trim();
  return name.length >= 2 && name.length <= 120 && !/[\p{C}\p{Zl}\p{Zp}<>:"/\\|?*]/u.test(name);
};
const templateNameRule = (value) =>
  isValidTemplateName(value) ||
  'Usa entre 2 y 120 caracteres; no se permiten caracteres de control ni <>:"/\\|?*.';

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
    isValidTemplateName(form.value.name) &&
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
    const template = await getTemplate(item._id, { includeContent: true });
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
    pendingImport.value = normalized;
    importName.value = normalized.name;
    importError.value = '';
    importDialogOpen.value = true;
  } catch (error) {
    notificationStore.setNotification({
      message: `No se pudo preparar la plantilla para importar. Motivo: ${error.message || 'archivo inválido'}`,
      code: error.response?.data?.code || 'EXXX',
      mode: 'automatic',
    });
  } finally {
    event.target.value = '';
  }
};

const closeImportDialog = () => {
  if (importing.value) return;
  importDialogOpen.value = false;
  pendingImport.value = null;
  importName.value = '';
  importError.value = '';
};

const submitTemplateImport = async () => {
  if (!pendingImport.value || !isValidTemplateName(importName.value) || importing.value) return;

  importing.value = true;
  importError.value = '';
  try {
    await createTemplate({
      ...pendingImport.value,
      name: importName.value.normalize('NFC').trim(),
    });
    importDialogOpen.value = false;
    pendingImport.value = null;
    importName.value = '';
    importError.value = '';
    try {
      await loadTemplates();
      notificationStore.setNotification({
        message: 'Plantilla importada correctamente como una copia nueva.',
        code: code.value || 'S2003',
        mode: 'automatic',
      });
    } catch (error) {
      notificationStore.setNotification({
        message:
          'La copia se importó correctamente, pero no se pudo actualizar la lista. Actualiza la vista para verla.',
        code: error.response?.data?.code || 'EXXX',
        mode: 'automatic',
      });
    }
  } catch (error) {
    importError.value =
      error.response?.data?.message || error.message || 'No se pudo importar la plantilla.';
  } finally {
    importing.value = false;
  }
};

const openRenameDialog = (template) => {
  selectedTemplateForRename.value = template;
  renameName.value = template.name || '';
  renameError.value = '';
  renameDialogOpen.value = true;
};

const closeRenameDialog = () => {
  if (renaming.value) return;
  renameDialogOpen.value = false;
  selectedTemplateForRename.value = null;
  renameName.value = '';
  renameError.value = '';
};

const confirmRename = async () => {
  const template = selectedTemplateForRename.value;
  if (!template || !isValidTemplateName(renameName.value) || renaming.value) return;

  renaming.value = true;
  renameError.value = '';
  try {
    const updated = await updateTemplate(template._id, {
      name: renameName.value.normalize('NFC').trim(),
    });
    template.name = updated.name;
    if (selectedTemplateDetails.value?._id === updated._id) {
      selectedTemplateDetails.value.name = updated.name;
    }
    renameDialogOpen.value = false;
    selectedTemplateForRename.value = null;
    renameName.value = '';
    renameError.value = '';
    notificationStore.setNotification({
      message: message.value,
      code: code.value,
      mode: 'automatic',
    });
  } catch (error) {
    renameError.value =
      error.response?.data?.message || error.message || 'No se pudo actualizar el nombre.';
  } finally {
    renaming.value = false;
  }
};

const exportTemplate = async (item) => {
  if (!item) return;

  try {
    const templateId = item._id || item.id;
    if (!templateId) throw new Error('No se encontró el identificador de la plantilla.');

    const template = await getTemplate(templateId, { includeContent: true });
    if (!Array.isArray(template?.elements)) {
      throw new Error('La plantilla recuperada no incluye su contenido completo.');
    }

    const payload = {
      name: template.name || 'Plantilla exportada',
      description: template.description || '',
      status: template.status || 'draft',
      dimensions: template.dimensions || { width: 794, height: 1123, unit: 'px' },
      page: template.page || {
        backgroundColor: '#ffffff',
        margin: { top: 40, right: 40, bottom: 40, left: 40 },
      },
      canvas: template.canvas || {
        version: 1,
        zoom: 1,
        background: '#ffffff',
      },
      elements: template.elements,
      metadata: {
        ...(template.metadata || {}),
        schemaVersion: 1,
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildExportFileName(template.name || 'plantilla');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    notificationStore.setNotification({
      message:
        error.response?.data?.message || error.message || 'No se pudo exportar la plantilla.',
      code: error.response?.data?.code || 'EXXX',
      mode: 'automatic',
    });
  }
};

const openEditor = (templateId) => {
  if (!templateId) return;
  router.push(`/templates/${templateId}/edit`);
};

const openDeleteDialog = (template) => {
  selectedTemplateForDelete.value = template;
  deleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  if (deleting.value) return;
  deleteDialogOpen.value = false;
  selectedTemplateForDelete.value = null;
};

const confirmDelete = async () => {
  const template = selectedTemplateForDelete.value;
  if (!template || deleting.value) return;

  deleting.value = true;
  try {
    await deleteTemplate(template._id);
    deleteDialogOpen.value = false;
    selectedTemplateForDelete.value = null;
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
  } finally {
    deleting.value = false;
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

.responsive-actions-table :deep(.v-table__wrapper) {
  overflow-x: auto;
}

.table-row-actions {
  width: max-content;
  min-width: 100%;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.table-row-actions .v-btn {
  flex: 0 0 auto;
}

@media (max-width: 600px) {
  .template-list-header-actions {
    width: 100%;
  }

  .template-list-header-actions .v-btn {
    flex: 1 1 auto;
  }
}
</style>
