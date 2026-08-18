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
          <v-chip :color="statusColor(item.status)" size="small" label> {{ item.status }} </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex ga-2">
            <v-btn color="info" variant="tonal" size="small" @click="openEditor(item._id)">
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
            <v-btn color="secondary" variant="tonal" size="small" @click="exportTemplate(item)">
              Exportar
            </v-btn>
            <v-btn color="error" variant="tonal" size="small" @click="deleteItem(item._id)">
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

            <v-col cols="12" md="4">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Estado</div>
                <v-chip :color="statusColor(selectedTemplateDetails.status)" size="small" label>
                  {{ selectedTemplateDetails.status }}
                </v-chip>
              </v-sheet>
            </v-col>
            <v-col cols="12" md="4">
              <v-sheet border rounded class="pa-3 mb-3">
                <div class="text-caption text-medium-emphasis mb-2">Dimensiones</div>
                <div class="text-body-2">
                  {{ selectedTemplateDetails.dimensions?.width || 0 }} x
                  {{ selectedTemplateDetails.dimensions?.height || 0 }}
                  {{ selectedTemplateDetails.dimensions?.unit || 'px' }}
                </div>
              </v-sheet>
            </v-col>
            <v-col cols="12" md="4">
              <v-sheet border rounded class="pa-3 mb-3">
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
                <code class="text-caption d-block">{{
                  JSON.stringify(selectedTemplateDetails.metadata || {}, null, 2)
                }}</code>
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

    <v-dialog v-model="dialogOpen" max-width="500" persistent>
      <v-card>
        <v-card-title>Crear plantilla</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Nombre de la plantilla" />
          <v-text-field v-model="form.description" label="Descripción" />
          <v-select v-model="form.status" label="Estado" :items="['draft', 'published']" />
          <v-text-field v-model.number="form.dimensions.width" label="Ancho" type="number" />
          <v-text-field v-model.number="form.dimensions.height" label="Alto" type="number" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogOpen = false">Cancelar</v-btn>
          <v-btn color="primary" @click="createNewTemplate">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTemplates } from '../../composables/docugen-app/useTemplates.js';

const router = useRouter();
const {
  templates,
  loading,
  listTemplates,
  createTemplate,
  deleteTemplate,
  getTemplate,
  getTemplateParameters,
} = useTemplates();
const dialogOpen = ref(false);
const detailsDialog = ref(false);
const detailsLoading = ref(false);
const search = ref('');
const importInputRef = ref(null);
const selectedTemplateDetails = ref(null);

const form = ref({
  name: '',
  description: '',
  status: 'draft',
  dimensions: { width: 794, height: 1123 },
});

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Estado', key: 'status' },
  { title: 'Actualizado', key: 'updatedAt' },
  { title: 'Acciones', key: 'actions', sortable: false },
];

const normalizePlaceholderKey = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/^\{\{\s*/, '')
    .replace(/\s*\}\}$/, '')
    .replace(/\s+/g, '_');
};

const statusColor = (status) => {
  return status === 'draft' ? 'warning' : 'success';
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
  dialogOpen.value = true;
};

const createNewTemplate = async () => {
  if (!form.value.name.trim()) return;

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
  await deleteTemplate(templateId);
  await loadTemplates();
};

const loadTemplates = async () => {
  await listTemplates({ page: 1, limit: 10, search: search.value });
};

onMounted(async () => {
  await loadTemplates();
});
</script>
