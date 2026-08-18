<template>
  <div class="editor-shell">
    <v-app-bar color="surface" flat class="editor-topbar border-b" density="comfortable">
      <template #prepend>
        <v-btn icon="mdi-arrow-left" variant="text" color="primary" @click="backToTemplates" />
      </template>

      <div class="d-flex align-center ga-3">
        <div class="text-start">
          <div class="text-caption text-medium-emphasis">Plantillas</div>
          <div class="text-subtitle-1 font-weight-bold">
            {{ template.name || 'Nueva plantilla' }}
          </div>
        </div>
      </div>

      <template #append>
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-undo"
            :disabled="history.length <= 1"
            @click="undo"
          >
            Deshacer
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-redo"
            :disabled="future.length === 0"
            @click="redo"
          >
            Rehacer
          </v-btn>

          <div class="zoom-control d-flex align-center ga-1 rounded-pill border px-2 py-1">
            <v-btn icon="mdi-minus" size="x-small" variant="text" @click="zoomOut" />
            <span class="text-caption font-weight-bold">{{ Math.round(zoom * 100) }}%</span>
            <v-btn icon="mdi-plus" size="x-small" variant="text" @click="zoomIn" />
            <v-btn icon="mdi-refresh" size="x-small" variant="text" @click="resetZoom" />
          </div>

          <v-btn variant="tonal" prepend-icon="mdi-content-save" size="small" @click="saveTemplate">
            Guardar
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-file-pdf-box"
            size="small"
            @click="openPresentation"
          >
            Configurar y Generar
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-container fluid class="editor-body pa-4">
      <div class="editor-layout">
        <div class="editor-sidebar">
          <v-card class="panel h-100 sidebar-panel" rounded="xl">
            <div class="panel-header d-flex align-center justify-space-between">
              <h4>Elementos</h4>
              <v-chip color="primary" size="small" variant="tonal">{{
                template.elements.length
              }}</v-chip>
            </div>

            <div class="toolbar-grid">
              <v-btn block color="primary" variant="tonal" @click="addTextElement">
                <v-icon start icon="mdi-format-text" /> Texto
              </v-btn>
              <v-btn block color="primary" variant="tonal" @click="addTitleElement">
                <v-icon start icon="mdi-format-header-pound" /> Título
              </v-btn>
              <v-btn block color="primary" variant="tonal" @click="addSubtitleElement">
                <v-icon start icon="mdi-format-size" /> Subtítulo
              </v-btn>
              <v-btn block color="primary" variant="tonal" @click="addParagraphElement">
                <v-icon start icon="mdi-format-paragraph" /> Párrafo
              </v-btn>
              <v-btn block color="primary" variant="tonal" @click="addListElement">
                <v-icon start icon="mdi-format-list-bulleted" /> Lista
              </v-btn>
              <v-btn block color="secondary" variant="tonal" @click="addPlaceholder">
                <v-icon start icon="mdi-variable" /> Placeholder
              </v-btn>
              <v-btn block color="secondary" variant="tonal" @click="addImageElement">
                <v-icon start icon="mdi-image" /> Imagen
              </v-btn>
              <v-btn block color="secondary" variant="tonal" @click="addQrElement">
                <v-icon start icon="mdi-qrcode" /> QR
              </v-btn>
              <v-btn block color="secondary" variant="tonal" @click="addDateElement">
                <v-icon start icon="mdi-calendar" /> Fecha
              </v-btn>
              <v-btn block color="warning" variant="tonal" @click="addFooterElement">
                <v-icon start icon="mdi-page-layout-footer" /> Pie
              </v-btn>
              <v-btn block color="warning" variant="tonal" @click="addSignatureElement">
                <v-icon start icon="mdi-signature-freehand" /> Firma
              </v-btn>
              <v-btn block color="success" variant="tonal" @click="addLineElement">
                <v-icon start icon="mdi-minus" /> Línea
              </v-btn>
              <v-btn block color="success" variant="tonal" @click="addRectElement">
                <v-icon start icon="mdi-rectangle" /> Caja
              </v-btn>
              <v-btn block color="success" variant="tonal" @click="addTableElement">
                <v-icon start icon="mdi-table" /> Tabla
              </v-btn>
              <v-btn block color="info" variant="tonal" @click="addCheckboxElement">
                <v-icon start icon="mdi-checkbox-marked-outline" /> Check
              </v-btn>
              <v-btn block color="info" variant="tonal" @click="addPageNumberElement">
                <v-icon start icon="mdi-numeric" /> Nº página
              </v-btn>
            </div>
          </v-card>
        </div>

        <div class="editor-stage-col">
          <v-card class="panel stage-panel" rounded="xl">
            <div class="stage-toolbar d-flex justify-space-between align-center">
              <div class="d-flex align-center ga-2 flex-wrap">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ template.dimensions.width }} × {{ template.dimensions.height }}
                </v-chip>
                <v-chip size="small" color="secondary" variant="tonal">
                  {{ template.elements.length }} elementos
                </v-chip>
                <v-chip size="small" color="success" variant="tonal"
                  >Zoom {{ Math.round(zoom * 100) }}%</v-chip
                >
              </div>
              <div class="d-flex align-center ga-2">
                <v-btn
                  icon="mdi-content-copy"
                  variant="text"
                  size="small"
                  :disabled="!selectedElement"
                  @click="duplicateSelectedElement"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  :disabled="!selectedElement"
                  @click="removeSelectedElement"
                />
              </div>
            </div>

            <div class="canvas-shell" @click="closeContextMenu">
              <div class="ruler ruler-horizontal">
                <div
                  v-for="n in 36"
                  :key="`h-${n}`"
                  class="tick"
                  :style="{ left: `${(n - 1) * 30}px` }"
                >
                  <span>{{ (n - 1) * 30 }}</span>
                </div>
              </div>

              <div class="ruler ruler-vertical">
                <div
                  v-for="n in 36"
                  :key="`v-${n}`"
                  class="tick"
                  :style="{ top: `${(n - 1) * 30}px` }"
                >
                  <span>{{ (n - 1) * 30 }}</span>
                </div>
              </div>

              <div ref="pageViewport" class="page-viewport">
                <div
                  class="page-wrapper"
                  :style="{
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `scale(${zoom})`,
                  }"
                >
                  <svg
                    ref="svgRef"
                    :viewBox="`0 0 ${width} ${height}`"
                    class="template-canvas"
                    :style="{ width: `${width}px`, height: `${height}px` }"
                    role="img"
                    aria-label="Vista previa de plantilla"
                    @pointermove="handlePointerMove"
                    @pointerup="stopDrag"
                    @pointerleave="stopDrag"
                    @pointerdown="clearSelectionIfEmpty"
                    @contextmenu.prevent
                  >
                    <defs>
                      <pattern
                        id="editor-grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1" />
                      </pattern>
                    </defs>

                    <rect
                      :width="width"
                      :height="height"
                      fill="#ffffff"
                      stroke="#dfe3ec"
                      stroke-width="2"
                      rx="8"
                    />
                    <rect
                      :width="width"
                      :height="height"
                      fill="url(#editor-grid)"
                      opacity="0.55"
                      rx="8"
                    />

                    <g v-for="element in template.elements" :key="element.id">
                      <rect
                        v-if="element.type === 'rect'"
                        :x="element.x"
                        :y="element.y"
                        :width="element.width"
                        :height="element.height"
                        :fill="element.fill || '#eaf2ff'"
                        :stroke="
                          selectedElement?.id === element.id
                            ? '#2563eb'
                            : element.stroke || '#9ec5fe'
                        "
                        :stroke-width="
                          selectedElement?.id === element.id ? 2 : element.strokeWidth || 1
                        "
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer"
                      />

                      <line
                        v-else-if="element.type === 'line' || element.type === 'separator'"
                        :x1="element.x"
                        :y1="element.y"
                        :x2="Number(element.x) + Number(element.width || 120)"
                        :y2="Number(element.y) + Number(element.height || 0)"
                        :stroke="
                          selectedElement?.id === element.id
                            ? '#2563eb'
                            : element.stroke || '#9ec5fe'
                        "
                        :stroke-width="
                          selectedElement?.id === element.id ? 2 : element.strokeWidth || 1
                        "
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer"
                      />

                      <g
                        v-else-if="element.type === 'image'"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer"
                      >
                        <rect
                          :x="element.x"
                          :y="element.y"
                          :width="element.width"
                          :height="element.height"
                          fill="#f8fafc"
                          stroke="#94a3b8"
                          stroke-width="1.5"
                          stroke-dasharray="6 6"
                          rx="6"
                        />

                        <image
                          v-if="!isImagePlaceholder(element)"
                          :href="element.src"
                          :x="element.x"
                          :y="element.y"
                          :width="element.width"
                          :height="element.height"
                          preserveAspectRatio="xMidYMid meet"
                        />

                        <text
                          :x="element.x + element.width / 2"
                          :y="element.y + element.height / 2"
                          text-anchor="middle"
                          dominant-baseline="middle"
                          font-size="12"
                          font-weight="700"
                          fill="#475569"
                        >
                          {{ getImagePlaceholderLabel(element) }}
                        </text>
                      </g>

                      <g
                        v-else-if="element.type === 'qr'"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer"
                      >
                        <rect
                          :x="element.x"
                          :y="element.y"
                          :width="element.width"
                          :height="element.height"
                          fill="#f8fafc"
                          stroke="#94a3b8"
                          stroke-width="1.5"
                          stroke-dasharray="6 6"
                          rx="6"
                        />
                        <text
                          :x="element.x + element.width / 2"
                          :y="element.y + element.height / 2"
                          text-anchor="middle"
                          dominant-baseline="middle"
                          font-size="12"
                          font-weight="700"
                          fill="#475569"
                        >
                          {{ getQrPlaceholderLabel(element) }}
                        </text>
                      </g>

                      <g
                        v-else-if="element.type === 'checkbox'"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer"
                      >
                        <rect
                          :x="element.x"
                          :y="element.y"
                          :width="element.width || 18"
                          :height="element.height || 18"
                          :fill="element.fill || '#ffffff'"
                          :stroke="
                            selectedElement?.id === element.id
                              ? '#2563eb'
                              : element.stroke || '#94a3b8'
                          "
                          stroke-width="2"
                          rx="4"
                        />
                        <path
                          v-if="element.checked !== false"
                          :d="`M ${element.x + 4} ${element.y + 10} L ${element.x + 7} ${element.y + 13} L ${element.x + 14} ${element.y + 5}`"
                          fill="none"
                          stroke="#18a957"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>

                      <text
                        v-else-if="
                          [
                            'paragraph',
                            'list',
                            'text',
                            'title',
                            'subtitle',
                            'date',
                            'pageNumber',
                            'signature',
                            'footer',
                          ].includes(element.type)
                        "
                        :x="element.x"
                        :y="element.y + (element.height || 20) / 2"
                        :font-size="element.fontSize || 18"
                        :fill="
                          selectedElement?.id === element.id
                            ? '#1d4ed8'
                            : element.color || '#111111'
                        "
                        :font-weight="selectedElement?.id === element.id ? 800 : 700"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer; font-family: 'Inter', sans-serif"
                      >
                        <tspan
                          v-for="(line, index) in getWrappedTextLines(element)"
                          :key="`${element.id}-${index}`"
                          :x="element.x"
                          :dy="index === 0 ? 0 : Number(element.fontSize || 18) * 1.35"
                        >
                          {{ line }}
                        </tspan>
                      </text>

                      <text
                        v-else
                        :x="element.x"
                        :y="element.y + (element.height || 20) / 2"
                        :font-size="element.fontSize || 18"
                        :fill="
                          selectedElement?.id === element.id
                            ? '#1d4ed8'
                            : element.color || '#111111'
                        "
                        :font-weight="selectedElement?.id === element.id ? 800 : 700"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer; font-family: 'Inter', sans-serif"
                      >
                        {{ getElementLabel(element) }}
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            <div
              v-if="contextMenu.visible"
              class="context-menu"
              :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
            >
              <v-card class="pa-2" rounded="lg" border>
                <div class="context-menu-list">
                  <v-btn
                    block
                    variant="text"
                    prepend-icon="mdi-content-copy"
                    size="small"
                    @click="duplicateSelectedElement"
                  >
                    Duplicar
                  </v-btn>
                  <v-btn
                    block
                    variant="text"
                    prepend-icon="mdi-content-duplicate"
                    size="small"
                    @click="copySelectedElement"
                  >
                    Copiar
                  </v-btn>
                  <v-btn
                    block
                    variant="text"
                    prepend-icon="mdi-delete"
                    size="small"
                    color="error"
                    @click="removeSelectedElement"
                  >
                    Eliminar
                  </v-btn>
                </div>
              </v-card>
            </div>
          </v-card>
        </div>

        <div class="editor-sidebar">
          <v-card class="panel h-100" rounded="xl">
            <div class="panel-header d-flex align-center justify-space-between">
              <h4>Propiedades</h4>
              <v-btn
                v-if="selectedElement"
                size="small"
                variant="text"
                color="error"
                @click="removeSelectedElement"
              >
                Eliminar
              </v-btn>
            </div>

            <template v-if="selectedElement">
              <v-text-field
                v-model="selectedElement.text"
                label="Texto / etiqueta"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-if="['image', 'qr', 'placeholder'].includes(selectedElement.type)"
                v-model="selectedElement.src"
                label="URL / origen"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-if="selectedElement.type === 'qr'"
                v-model="selectedElement.qrValue"
                label="Valor del QR"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-if="
                  selectedElement.type === 'placeholder' ||
                  selectedElement.type === 'date' ||
                  selectedElement.type === 'pageNumber'
                "
                v-model="selectedElement.placeholderKey"
                label="Clave del dato"
                density="comfortable"
                @change="markDirty"
              />

              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.x"
                    label="X"
                    type="number"
                    density="comfortable"
                    @change="markDirty"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.y"
                    label="Y"
                    type="number"
                    density="comfortable"
                    @change="markDirty"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.width"
                    label="Ancho"
                    type="number"
                    density="comfortable"
                    @change="markDirty"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.height"
                    label="Alto"
                    type="number"
                    density="comfortable"
                    @change="markDirty"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.fontSize"
                    label="Tamaño"
                    type="number"
                    density="comfortable"
                    @change="markDirty"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="selectedElement.color"
                    label="Color"
                    type="color"
                    density="comfortable"
                    @change="markDirty"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-3" />

              <v-select
                v-model="selectedElement.align"
                label="Alineación"
                :items="['left', 'center', 'right']"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-model="selectedElement.stroke"
                label="Color de borde"
                type="color"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-model.number="selectedElement.strokeWidth"
                label="Grosor de borde"
                type="number"
                density="comfortable"
                @change="markDirty"
              />
            </template>

            <template v-else>
              <v-text-field
                v-model="template.name"
                label="Nombre"
                density="comfortable"
                @change="markDirty"
              />
              <v-textarea
                v-model="template.description"
                label="Descripción"
                rows="3"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-model.number="template.dimensions.width"
                label="Ancho"
                type="number"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-model.number="template.dimensions.height"
                label="Alto"
                type="number"
                density="comfortable"
                @change="markDirty"
              />
              <v-select
                v-model="template.status"
                label="Estado"
                :items="['draft', 'published', 'archived']"
                density="comfortable"
                @change="markDirty"
              />

              <v-divider class="my-3" />

              <div class="panel-helper">
                <div class="text-caption text-medium-emphasis mb-2">Parámetros dinámicos</div>
                <div v-if="dynamicParameters.length" class="d-flex flex-column ga-2 mb-3">
                  <div
                    v-for="(parameter, index) in dynamicParameters"
                    :key="parameter.key || index"
                    class="d-flex ga-2 align-center"
                  >
                    <v-text-field
                      v-model="parameter.key"
                      label="Nombre"
                      density="compact"
                      hide-details
                      @blur="normalizeDynamicParameter(parameter)"
                    />
                    <v-select
                      v-model="parameter.type"
                      label="Tipo"
                      :items="[
                        'text',
                        'textarea',
                        'number',
                        'date',
                        'boolean',
                        'image',
                        'qr',
                        'email',
                        'url',
                      ]"
                      density="compact"
                      hide-details
                    />
                    <v-checkbox v-model="parameter.required" hide-details density="compact" />
                  </div>
                </div>
                <v-btn class="mt-2" size="small" variant="tonal" @click="addDynamicParameter">
                  Añadir parámetro
                </v-btn>
              </div>

              <v-divider class="my-3" />

              <div class="panel-helper">
                <div class="text-caption text-medium-emphasis mb-2">Campos dinámicos</div>
                <v-chip-group column>
                  <v-chip size="small" label @click="insertPlaceholder('cliente_nombre')"
                    >cliente_nombre</v-chip
                  >
                  <v-chip size="small" label @click="insertPlaceholder('empresa')">empresa</v-chip>
                  <v-chip size="small" label @click="insertPlaceholder('cliente_id')"
                    >cliente_id</v-chip
                  >
                  <v-chip size="small" label @click="insertPlaceholder('fecha')">fecha</v-chip>
                  <v-chip size="small" label @click="insertPlaceholder('codigo')">codigo</v-chip>
                </v-chip-group>
              </div>
            </template>
          </v-card>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTemplates } from '../../composables/docugen-app/useTemplates.js';

const route = useRoute();
const router = useRouter();
const templateId = computed(() => route.params.templateId);
const { getTemplate, updateTemplate, renderTemplate } = useTemplates();

const baseTemplate = () => ({
  _id: '',
  name: 'Nueva plantilla',
  description: '',
  status: 'draft',
  dimensions: { width: 794, height: 1123, unit: 'px' },
  page: { backgroundColor: '#ffffff', margin: { top: 40, right: 40, bottom: 40, left: 40 } },
  canvas: { version: 1, zoom: 1, background: '#ffffff' },
  elements: [],
  metadata: { dynamicParameters: [] },
});

const template = ref(baseTemplate());
const selectedElement = ref(null);
const dragState = ref(null);
const svgRef = ref(null);
const pageViewport = ref(null);
const width = ref(794);
const height = ref(1123);
const zoom = ref(1);
const history = ref([]);
const future = ref([]);
const contextMenu = ref({ visible: false, x: 0, y: 0, element: null });

const serializeTemplate = () =>
  JSON.stringify({
    name: template.value.name,
    description: template.value.description,
    status: template.value.status,
    dimensions: template.value.dimensions,
    elements: template.value.elements,
    metadata: template.value.metadata,
  });

const applySnapshot = (snapshot) => {
  if (!snapshot) return;
  try {
    const nextState = JSON.parse(snapshot);
    template.value = {
      ...template.value,
      ...nextState,
      dimensions: nextState.dimensions || template.value.dimensions,
      elements: nextState.elements || [],
    };
    width.value = Number(template.value.dimensions.width || 794);
    height.value = Number(template.value.dimensions.height || 1123);
    if (!template.value.elements.some((item) => item.id === selectedElement.value?.id)) {
      selectedElement.value = template.value.elements[0] || null;
    }
  } catch (error) {
    console.warn('Snapshot inválido', error);
  }
};

const normalizeDynamicParameter = (parameter) => {
  if (!parameter || !parameter.key) return;

  const key = parameter.key.trim().replace(/\s+/g, '_');
  if (!key) return;

  parameter.key = key;
  parameter.label = parameter.label || key;
  parameter.type = parameter.type || 'text';
  parameter.required = Boolean(parameter.required);
  parameter.description = parameter.description || '';
};

const buildDynamicKey = (type) => {
  const label = type === 'image' ? 'imagen' : type === 'qr' ? 'qr' : 'param';
  const current = template.value.elements.filter((element) => element.type === type);
  const nextIndex = current.length + 1;
  return `${label}${nextIndex}`;
};

const dynamicParameters = computed({
  get: () => {
    const values = Array.isArray(template.value?.metadata?.dynamicParameters)
      ? template.value.metadata.dynamicParameters
      : [];
    return values;
  },
  set: (value) => {
    template.value.metadata = {
      ...(template.value.metadata || {}),
      dynamicParameters: value,
    };
  },
});

const addDynamicParameter = () => {
  const current = Array.isArray(template.value.metadata?.dynamicParameters)
    ? template.value.metadata.dynamicParameters
    : [];

  const next = [
    ...current,
    {
      key: `param_${current.length + 1}`,
      label: `param_${current.length + 1}`,
      type: 'text',
      required: true,
    },
  ];
  template.value.metadata = {
    ...(template.value.metadata || {}),
    dynamicParameters: next,
  };
  pushHistory();
};

const syncDynamicParametersFromTemplate = () => {
  const source = Array.isArray(template.value?.metadata?.dynamicParameters)
    ? template.value.metadata.dynamicParameters
    : [];
  const map = new Map();

  source.forEach((item) => {
    if (!item?.key) return;
    const key = item.key.trim().replace(/\s+/g, '_');
    if (!key) return;
    map.set(key, {
      ...item,
      key,
      label: item.label || key,
      type: item.type || 'text',
      required: Boolean(item.required),
    });
  });

  template.value.elements.forEach((element) => {
    const keyFromPlaceholder = (element.placeholderKey || '').trim().replace(/\s+/g, '_');
    if (keyFromPlaceholder && !map.has(keyFromPlaceholder)) {
      map.set(keyFromPlaceholder, {
        key: keyFromPlaceholder,
        label: keyFromPlaceholder,
        type:
          element.type === 'qr'
            ? 'qr'
            : element.type === 'image'
              ? 'image'
              : element.type === 'date'
                ? 'date'
                : 'text',
        required: true,
      });
    }

    const candidateText = [
      element.text || '',
      element.qrValue || '',
      element.src || '',
      element.placeholderKey || '',
    ].join(' ');
    const matches = candidateText.match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g) || [];
    matches.forEach((match) => {
      const key = match.replace(/[{}]/g, '').trim().replace(/\s+/g, '_');
      if (!key || map.has(key)) return;
      map.set(key, {
        key,
        label: key,
        type:
          element.type === 'qr'
            ? 'qr'
            : element.type === 'image'
              ? 'image'
              : element.type === 'date'
                ? 'date'
                : 'text',
        required: true,
      });
    });
  });

  const next = [...map.values()].sort((a, b) => String(a.key).localeCompare(String(b.key)));
  template.value.metadata = {
    ...(template.value.metadata || {}),
    dynamicParameters: next,
  };
};

const pushHistory = () => {
  const snapshot = serializeTemplate();
  if (!history.value.length || history.value[history.value.length - 1] !== snapshot) {
    history.value.push(snapshot);
    if (history.value.length > 40) history.value.shift();
  }
  future.value = [];
};

const markDirty = () => {
  pushHistory();
};

const undo = () => {
  if (history.value.length <= 1) return;
  const current = history.value.pop();
  future.value.push(current);
  applySnapshot(history.value[history.value.length - 1]);
};

const redo = () => {
  if (!future.value.length) return;
  const next = future.value.pop();
  history.value.push(next);
  applySnapshot(next);
};

const getWrappedTextLines = (element) => {
  const baseText = String(element?.text || '').replace(/\r\n/g, '\n');
  if (!baseText && element?.type !== 'paragraph' && element?.type !== 'list') {
    return [getElementLabel(element) || ''];
  }

  const fontSize = Number(element?.fontSize || 16);
  const maxWidth = Math.max(80, Number(element?.width || 180));
  const charsPerLine = Math.max(12, Math.floor(maxWidth / (fontSize * 0.62)));
  const maxLines = Math.max(
    1,
    Math.floor((Number(element?.height || 60) || 60) / (fontSize * 1.35))
  );

  const chunks = [];
  const paragraphs = baseText.split(/\n/);

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = '';

    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= charsPerLine) {
        current = candidate;
        return;
      }

      if (current) {
        chunks.push(current);
      }
      current = word;
    });

    if (current) {
      chunks.push(current);
    }
  });

  const lines = chunks.length ? chunks : [''];
  const fitted = lines.slice(0, maxLines);
  return fitted.length ? fitted : [''];
};

const fitPageToViewport = () => {
  if (!pageViewport.value) return;

  const padding = 48;
  const viewportWidth = Math.max(320, pageViewport.value.clientWidth - padding);
  const viewportHeight = Math.max(220, pageViewport.value.clientHeight - padding);
  const nextZoom = Math.min(viewportWidth / width.value, viewportHeight / height.value, 1);
  zoom.value = Number(Math.max(0.25, nextZoom).toFixed(2));
};

const zoomIn = () => {
  zoom.value = Math.min(2, Number((zoom.value + 0.1).toFixed(2)));
};

const zoomOut = () => {
  zoom.value = Math.max(0.25, Number((zoom.value - 0.1).toFixed(2)));
};

const resetZoom = () => {
  fitPageToViewport();
};

const backToTemplates = () => router.push('/dashboard/templates');

const loadTemplate = async () => {
  if (!templateId.value) return;

  try {
    const item = await getTemplate(templateId.value);
    const normalizedItem = item && typeof item === 'object' ? item : {};

    template.value = {
      ...baseTemplate(),
      ...normalizedItem,
      dimensions: normalizedItem.dimensions || { width: 794, height: 1123, unit: 'px' },
      page: normalizedItem.page || {
        backgroundColor: '#ffffff',
        margin: { top: 40, right: 40, bottom: 40, left: 40 },
      },
      canvas: normalizedItem.canvas || { version: 1, zoom: 1, background: '#ffffff' },
      elements: Array.isArray(normalizedItem.elements) ? normalizedItem.elements : [],
      metadata: {
        ...(normalizedItem.metadata || {}),
        dynamicParameters: Array.isArray(normalizedItem.metadata?.dynamicParameters)
          ? normalizedItem.metadata.dynamicParameters
          : [],
      },
    };

    syncDynamicParametersFromTemplate();

    width.value = Number(template.value.dimensions.width || 794);
    height.value = Number(template.value.dimensions.height || 1123);
    history.value = [serializeTemplate()];
    future.value = [];
    selectedElement.value = template.value.elements[0] || null;
  } catch (error) {
    console.error('No se pudo cargar la plantilla:', error);
    template.value = baseTemplate();
    selectedElement.value = null;
  }
};

const makeElement = (type, extra = {}) => {
  const generatedKey = type === 'image' || type === 'qr' ? buildDynamicKey(type) : undefined;
  const base = {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    x: 40,
    y: 60 + template.value.elements.length * 22,
    width: 180,
    height: 40,
    text: 'Texto',
    fontSize: 16,
    color: '#111111',
    fill: '#ffffff',
    stroke: '#94a3b8',
    strokeWidth: 1,
    opacity: 1,
    checked: true,
    align: 'left',
    ...(type === 'image' ? { placeholderKey: generatedKey, src: `{{${generatedKey}}}` } : {}),
    ...(type === 'qr' ? { placeholderKey: generatedKey, qrValue: `{{${generatedKey}}}` } : {}),
    ...extra,
  };

  template.value.elements.push(base);
  selectedElement.value = base;
  syncDynamicParametersFromTemplate();
  pushHistory();
};

const addTextElement = () =>
  makeElement('text', { text: 'Texto', x: 50, y: 80, width: 220, height: 30, fontSize: 18 });
const addTitleElement = () =>
  makeElement('title', {
    text: 'Título',
    x: 50,
    y: 110,
    width: 280,
    height: 42,
    fontSize: 28,
    fontWeight: '700',
  });
const addSubtitleElement = () =>
  makeElement('subtitle', {
    text: 'Subtítulo',
    x: 50,
    y: 165,
    width: 300,
    height: 30,
    fontSize: 20,
    fontWeight: '600',
  });
const addParagraphElement = () =>
  makeElement('paragraph', {
    text: 'Párrafo de ejemplo.',
    x: 50,
    y: 200,
    width: 300,
    height: 60,
    fontSize: 16,
  });
const addListElement = () =>
  makeElement('list', {
    text: '• Elemento de lista',
    x: 50,
    y: 270,
    width: 240,
    height: 28,
    fontSize: 15,
  });
const addPlaceholder = () =>
  makeElement('placeholder', {
    text: '{{cliente_nombre}}',
    placeholderKey: 'cliente_nombre',
    x: 50,
    y: 330,
    width: 220,
    height: 30,
    fontSize: 16,
  });
const addImageElement = () => {
  const key = buildDynamicKey('image');
  makeElement('image', {
    placeholderKey: key,
    src: `{{${key}}}`,
    x: 50,
    y: 380,
    width: 180,
    height: 110,
  });
};
const addQrElement = () => {
  const key = buildDynamicKey('qr');
  makeElement('qr', {
    placeholderKey: key,
    qrValue: `{{${key}}}`,
    x: 50,
    y: 520,
    width: 110,
    height: 110,
  });
};
const addDateElement = () =>
  makeElement('date', {
    text: '{{fecha}}',
    placeholderKey: 'fecha',
    x: 50,
    y: 640,
    width: 180,
    height: 24,
    fontSize: 14,
  });
const addFooterElement = () =>
  makeElement('footer', {
    text: 'Documento generado por Docugen • {{fecha}}',
    x: 60,
    y: 1060,
    width: 660,
    height: 24,
    align: 'center',
    color: '#6b7280',
    fontSize: 11,
  });
const addSignatureElement = () =>
  makeElement('signature', {
    text: 'Firma autorizada',
    x: 520,
    y: 980,
    width: 220,
    height: 32,
    stroke: '#374151',
    fontSize: 12,
  });
const addLineElement = () =>
  makeElement('line', { x: 50, y: 930, width: 680, height: 0, stroke: '#cbd5e1', strokeWidth: 2 });
const addRectElement = () =>
  makeElement('rect', {
    x: 50,
    y: 760,
    width: 220,
    height: 120,
    fill: '#eef6ff',
    stroke: '#9ec5fe',
    strokeWidth: 1,
  });
const addTableElement = () =>
  makeElement('table', {
    text: 'Columna A | Columna B',
    x: 50,
    y: 900,
    width: 300,
    height: 80,
    fontSize: 12,
  });
const addCheckboxElement = () =>
  makeElement('checkbox', {
    text: 'Aceptado',
    checked: true,
    x: 50,
    y: 820,
    width: 18,
    height: 18,
    stroke: '#1f9d55',
  });
const addPageNumberElement = () =>
  makeElement('pageNumber', {
    text: 'Página {{page_number}}',
    placeholderKey: 'page_number',
    x: 660,
    y: 1090,
    width: 80,
    height: 20,
    align: 'right',
    fontSize: 10,
  });

const insertPlaceholder = (key) => {
  if (!selectedElement.value) return;

  if (
    [
      'text',
      'title',
      'subtitle',
      'paragraph',
      'list',
      'date',
      'pageNumber',
      'signature',
      'footer',
    ].includes(selectedElement.value.type)
  ) {
    const value = selectedElement.value.text
      ? `${selectedElement.value.text} {{${key}}}`
      : `{{${key}}}`;
    selectedElement.value.text = value;
  }

  if (selectedElement.value.type === 'placeholder') {
    selectedElement.value.placeholderKey = key;
    selectedElement.value.text = `{{${key}}}`;
  }

  if (selectedElement.value.type === 'image') {
    selectedElement.value.placeholderKey = key;
    selectedElement.value.src = `{{${key}}}`;
  }

  if (selectedElement.value.type === 'qr') {
    selectedElement.value.placeholderKey = key;
    selectedElement.value.qrValue = `{{${key}}}`;
  }

  syncDynamicParametersFromTemplate();
  pushHistory();
};

const selectElement = (element) => {
  selectedElement.value = element;
};

const clearSelectionIfEmpty = (event) => {
  if (event.target === event.currentTarget) {
    selectedElement.value = null;
    closeContextMenu();
  }
};

const openContextMenu = (event, element) => {
  selectElement(element);
  contextMenu.value = {
    visible: true,
    x: event.clientX - 24,
    y: event.clientY - 12,
    element,
  };
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

const duplicateSelectedElement = () => {
  if (!selectedElement.value) return;
  const clone = JSON.parse(JSON.stringify(selectedElement.value));
  clone.id = `${clone.type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  clone.x += 24;
  clone.y += 24;
  template.value.elements.push(clone);
  selectedElement.value = clone;
  pushHistory();
  closeContextMenu();
};

const copySelectedElement = () => {
  if (!selectedElement.value) return;
  const clone = JSON.parse(JSON.stringify(selectedElement.value));
  clone.id = `${clone.type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  clone.x += 18;
  clone.y += 18;
  template.value.elements.push(clone);
  selectedElement.value = clone;
  pushHistory();
  closeContextMenu();
};

const removeSelectedElement = () => {
  if (!selectedElement.value) return;
  template.value.elements = template.value.elements.filter(
    (element) => element.id !== selectedElement.value.id
  );
  selectedElement.value = template.value.elements[0] || null;
  syncDynamicParametersFromTemplate();
  pushHistory();
  closeContextMenu();
};

const startDrag = (event, element) => {
  event.preventDefault();
  event.stopPropagation();
  selectElement(element);

  const svg = svgRef.value;
  if (!svg) return;

  const rect = svg.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * width.value;
  const y = ((event.clientY - rect.top) / rect.height) * height.value;

  dragState.value = {
    id: element.id,
    offsetX: x - element.x,
    offsetY: y - element.y,
  };

  pushHistory();
};

const handlePointerMove = (event) => {
  if (!dragState.value || !svgRef.value) return;

  const svg = svgRef.value;
  const rect = svg.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * width.value;
  const y = ((event.clientY - rect.top) / rect.height) * height.value;

  const current = template.value.elements.find((element) => element.id === dragState.value.id);
  if (!current) return;

  current.x = Math.max(0, x - dragState.value.offsetX);
  current.y = Math.max(0, y - dragState.value.offsetY);
};

const stopDrag = (event) => {
  if (event?.pointerId !== undefined && svgRef.value?.hasPointerCapture?.(event.pointerId)) {
    svgRef.value.releasePointerCapture(event.pointerId);
  }
  dragState.value = null;
  pushHistory();
};

const isImagePlaceholder = (element) => {
  if (!element) return true;
  const value = String(element.src || '');
  return !value || value.includes('{{') || value.startsWith('data:image/svg+xml');
};

const getImagePlaceholderLabel = (element) => {
  if (!element) return '<imagen>';
  const key =
    element.placeholderKey ||
    String(element.src || '').match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/)?.[1];
  return key ? `<${key}>` : '<imagen>';
};

const getQrPlaceholderLabel = (element) => {
  if (!element) return '<qr>';
  const key =
    element.placeholderKey ||
    String(element.qrValue || '').match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/)?.[1];
  return key ? `<${key}>` : '<qr>';
};

const getElementLabel = (element) => {
  if (!element) return '';
  if (element.type === 'placeholder')
    return element.placeholderKey ? `{{${element.placeholderKey}}}` : element.text || 'Placeholder';
  if (element.type === 'footer') return element.text || 'Pie de página';
  if (element.type === 'image') return getImagePlaceholderLabel(element);
  if (element.type === 'qr') return getQrPlaceholderLabel(element);
  if (element.type === 'line') return 'Línea';
  if (element.type === 'signature') return element.text || 'Firma';
  if (element.type === 'checkbox') return element.text || 'Casilla';
  if (element.type === 'date') return element.text || '{{fecha}}';
  if (element.type === 'pageNumber') return element.text || 'Página';
  if (element.type === 'table') return element.text || 'Tabla';
  if (element.type === 'list') return element.text || 'Lista';
  return element.placeholderKey ? `{{${element.placeholderKey}}}` : element.text || '';
};

const saveTemplate = async () => {
  await updateTemplate(templateId.value, {
    name: template.value.name,
    description: template.value.description,
    dimensions: template.value.dimensions,
    elements: template.value.elements,
    status: template.value.status,
  });
  history.value = [serializeTemplate()];
  future.value = [];
};

const openPresentation = () => {
  router.push(`/templates/${templateId.value}/present`);
};

watch(
  () => template.value.dimensions.width,
  (value) => {
    width.value = Number(value || 794);
  }
);

watch(
  () => template.value.dimensions.height,
  (value) => {
    height.value = Number(value || 1123);
  }
);

watch([width, height], () => {
  fitPageToViewport();
});

onMounted(async () => {
  await loadTemplate();
  fitPageToViewport();

  if (pageViewport.value && 'ResizeObserver' in window) {
    const observer = new ResizeObserver(() => fitPageToViewport());
    observer.observe(pageViewport.value);
    window.__docugenPageResizeObserver = observer;
  }
});

onBeforeUnmount(() => {
  if (window.__docugenPageResizeObserver) {
    window.__docugenPageResizeObserver.disconnect();
    delete window.__docugenPageResizeObserver;
  }
});
</script>

<style scoped>
.editor-shell {
  min-height: calc(100vh - 96px);
  background: linear-gradient(180deg, #f4f7ff 0%, #eef4fb 100%);
}

.editor-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.editor-body {
  height: calc(100vh - 120px);
  padding-top: 16px;
}

.editor-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 320px;
  gap: 16px;
}

.editor-sidebar,
.editor-stage-col {
  min-height: 0;
  height: 100%;
}

.sidebar-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel {
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  padding: 18px;
}

.panel-header {
  margin-bottom: 16px;
}

.toolbar-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
  min-height: 0;
}

.toolbar-grid .v-btn {
  justify-content: flex-start;
  padding-inline: 12px;
  border-radius: 12px;
  min-height: 42px;
  font-weight: 600;
}

.stage-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.9));
}

.stage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  margin-bottom: 12px;
}

.zoom-control {
  background: rgba(148, 163, 184, 0.08);
}

.canvas-shell {
  position: relative;
  flex: 1;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8fafc, #edf3ff);
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.ruler {
  position: absolute;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.15);
  z-index: 2;
  pointer-events: none;
}

.ruler-horizontal {
  left: 26px;
  right: 18px;
  top: 0;
  height: 24px;
  overflow: hidden;
}

.ruler-vertical {
  left: 0;
  top: 24px;
  bottom: 0;
  width: 24px;
  overflow: hidden;
}

.ruler .tick {
  position: absolute;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: rgba(100, 116, 139, 0.9);
  font-size: 9px;
}

.ruler-horizontal .tick {
  width: 1px;
  height: 100%;
  border-left: 1px solid rgba(148, 163, 184, 0.45);
}

.ruler-horizontal .tick span {
  position: absolute;
  top: 2px;
}

.ruler-vertical .tick {
  width: 100%;
  height: 1px;
  border-top: 1px solid rgba(148, 163, 184, 0.45);
}

.ruler-vertical .tick span {
  position: absolute;
  left: 4px;
}

.page-viewport {
  position: absolute;
  inset: 28px 18px 18px 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.page-wrapper {
  transform-origin: center center;
  transition: transform 0.12s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 794px;
  height: 1123px;
  filter: drop-shadow(0 18px 34px rgba(15, 23, 42, 0.12));
}

.template-canvas {
  display: block;
  width: 794px;
  height: 1123px;
  max-width: none;
  background: white;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
  border-radius: 16px;
}

.context-menu {
  position: absolute;
  z-index: 15;
}

.context-menu-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panel-helper {
  margin-top: 8px;
}

@media (max-width: 960px) {
  .editor-body {
    height: auto;
  }

  .editor-layout {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
