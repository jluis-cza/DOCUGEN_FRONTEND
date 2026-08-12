<template>
  <div class="editor-shell">
    <v-app-bar color="surface" flat class="editor-topbar border-b" density="comfortable">
      <template #prepend>
        <v-btn icon="mdi-arrow-left" variant="text" color="primary" @click="backToTemplates" />
      </template>

      <div class="d-flex align-center ga-3">
        <div>
          <div class="text-caption text-medium-emphasis">Plantillas</div>
          <div class="text-subtitle-1 font-weight-bold">
            {{ template.name || 'Nueva plantilla' }}
          </div>
        </div>
      </div>

      <template #append>
        <div class="d-flex align-center ga-2">
          <v-btn variant="tonal" prepend-icon="mdi-content-save" @click="saveTemplate"
            >Guardar</v-btn
          >
          <v-btn color="primary" prepend-icon="mdi-file-pdf-box" @click="renderPdf"
            >Generar PDF</v-btn
          >
          <v-btn
            variant="text"
            color="error"
            prepend-icon="mdi-exit-to-app"
            @click="backToTemplates"
          >
            Salir
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-container fluid class="editor-body pa-4">
      <div class="editor-layout">
        <div class="editor-sidebar">
          <v-card class="panel h-100" rounded="xl">
            <div class="panel-header">
              <h4>Elementos</h4>
            </div>

            <div class="toolbar-stack">
              <v-btn block color="primary" variant="tonal" @click="addTextElement">
                <v-icon start icon="mdi-format-text" /> Texto
              </v-btn>
              <v-btn block color="primary" variant="tonal" @click="addTitleElement">
                <v-icon start icon="mdi-format-header-pound" /> Título
              </v-btn>
              <v-btn block color="primary" variant="tonal" @click="addParagraphElement">
                <v-icon start icon="mdi-format-paragraph" /> Párrafo
              </v-btn>
              <v-btn block color="primary" variant="tonal" @click="addPlaceholder">
                <v-icon start icon="mdi-variable" /> Placeholder
              </v-btn>
            </div>

            <v-divider class="my-3" />

            <div v-if="selectedElement" class="property-stack">
              <v-text-field v-model="selectedElement.text" label="Texto" density="comfortable" />
              <v-text-field
                v-model.number="selectedElement.x"
                label="X"
                type="number"
                density="comfortable"
              />
              <v-text-field
                v-model.number="selectedElement.y"
                label="Y"
                type="number"
                density="comfortable"
              />
              <v-text-field
                v-model.number="selectedElement.width"
                label="Ancho"
                type="number"
                density="comfortable"
              />
              <v-text-field
                v-model.number="selectedElement.height"
                label="Alto"
                type="number"
                density="comfortable"
              />
              <v-text-field
                v-model.number="selectedElement.fontSize"
                label="Tamaño"
                type="number"
                density="comfortable"
              />
              <v-text-field
                v-model="selectedElement.color"
                label="Color"
                type="color"
                density="comfortable"
              />
            </div>
          </v-card>
        </div>

        <div class="editor-stage-col">
          <v-card class="panel stage-panel" rounded="xl">
            <div class="stage-toolbar">
              <div class="d-flex align-center ga-2">
                <v-chip size="small" color="primary" variant="tonal"
                  >{{ template.dimensions.width }} × {{ template.dimensions.height }}</v-chip
                >
                <v-chip size="small" color="secondary" variant="tonal"
                  >{{ template.elements.length }} elementos</v-chip
                >
              </div>
            </div>

            <div class="canvas-wrap">
              <svg
                ref="svgRef"
                :viewBox="`0 0 ${width} ${height}`"
                class="template-canvas"
                role="img"
                aria-label="Vista previa de plantilla"
                @pointermove="handlePointerMove"
                @pointerup="stopDrag"
                @pointerleave="stopDrag"
                @pointerdown="clearSelectionIfEmpty"
              >
                <rect
                  :width="width"
                  :height="height"
                  fill="#ffffff"
                  stroke="#dfe3ec"
                  stroke-width="2"
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
                      selectedElement?.id === element.id ? '#2563eb' : element.stroke || '#9ec5fe'
                    "
                    :stroke-width="
                      selectedElement?.id === element.id ? 2 : element.strokeWidth || 1
                    "
                    @click="selectElement(element)"
                    @pointerdown="startDrag($event, element)"
                    style="cursor: pointer"
                  />

                  <text
                    v-else
                    :x="element.x"
                    :y="element.y + element.height / 2"
                    :font-size="element.fontSize || 18"
                    :fill="
                      selectedElement?.id === element.id ? '#1d4ed8' : element.color || '#111111'
                    "
                    :font-weight="selectedElement?.id === element.id ? 800 : 700"
                    @click="selectElement(element)"
                    @pointerdown="startDrag($event, element)"
                    style="cursor: pointer; font-family: 'Inter', sans-serif"
                  >
                    {{ getElementLabel(element) }}
                  </text>
                </g>
              </svg>
            </div>
          </v-card>
        </div>

        <div class="editor-sidebar">
          <v-card class="panel h-100" rounded="xl">
            <div class="panel-header">
              <h4>Propiedades</h4>
            </div>

            <v-text-field v-model="template.name" label="Nombre" density="comfortable" />
            <v-textarea
              v-model="template.description"
              label="Descripción"
              rows="3"
              density="comfortable"
            />
            <v-text-field
              v-model.number="template.dimensions.width"
              label="Ancho"
              type="number"
              density="comfortable"
            />
            <v-text-field
              v-model.number="template.dimensions.height"
              label="Alto"
              type="number"
              density="comfortable"
            />
            <v-select
              v-model="template.status"
              label="Estado"
              :items="['draft', 'published']"
              density="comfortable"
            />
          </v-card>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTemplates } from '../../composables/docugen-app/useTemplates.js';

const route = useRoute();
const router = useRouter();
const templateId = computed(() => route.params.templateId);
const { getTemplate, updateTemplate, renderTemplate } = useTemplates();

const backToTemplates = () => {
  router.push('/dashboard/templates');
};

const template = ref({
  _id: '',
  name: 'Nueva plantilla',
  description: '',
  dimensions: { width: 794, height: 1123 },
  elements: [],
});

const selectedElement = ref(null);
const dragState = ref(null);
const svgRef = ref(null);
const width = ref(794);
const height = ref(1123);

const loadTemplate = async () => {
  const item = await getTemplate(templateId.value);
  template.value = {
    ...item,
    dimensions: item.dimensions || { width: 794, height: 1123 },
    elements: item.elements || [],
  };
  width.value = template.value.dimensions.width;
  height.value = template.value.dimensions.height;
};

const ensureElement = (element) => {
  if (!selectedElement.value || selectedElement.value.id !== element.id) {
    selectedElement.value = element;
  }
};

const addTextElement = () => {
  const element = {
    id: `text-${Date.now()}`,
    type: 'text',
    x: 40,
    y: 60 + template.value.elements.length * 20,
    width: 180,
    height: 30,
    text: 'Texto',
    fontSize: 18,
    color: '#111111',
  };
  template.value.elements.push(element);
  selectedElement.value = element;
};

const addTitleElement = () => {
  const element = {
    id: `title-${Date.now()}`,
    type: 'title',
    x: 40,
    y: 60 + template.value.elements.length * 20,
    width: 240,
    height: 40,
    text: 'Título',
    fontSize: 28,
    color: '#111111',
  };
  template.value.elements.push(element);
  selectedElement.value = element;
};

const addParagraphElement = () => {
  const element = {
    id: `paragraph-${Date.now()}`,
    type: 'paragraph',
    x: 40,
    y: 60 + template.value.elements.length * 20,
    width: 250,
    height: 40,
    text: 'Párrafo',
    fontSize: 16,
    color: '#222222',
  };
  template.value.elements.push(element);
  selectedElement.value = element;
};

const addPlaceholder = () => {
  const element = {
    id: `placeholder-${Date.now()}`,
    type: 'placeholder',
    x: 40,
    y: 60 + template.value.elements.length * 20,
    width: 180,
    height: 30,
    text: '{{cliente_nombre}}',
    placeholderKey: 'cliente_nombre',
    fontSize: 16,
    color: '#333333',
  };
  template.value.elements.push(element);
  selectedElement.value = element;
};

const selectElement = (element) => {
  selectedElement.value = element;
};

const clearSelectionIfEmpty = (event) => {
  if (event.target === event.currentTarget) {
    selectedElement.value = null;
  }
};

const startDrag = (event, element) => {
  event.preventDefault();
  event.stopPropagation();
  selectElement(element);

  const svg = svgRef.value;
  if (!svg) return;

  svg.setPointerCapture?.(event.pointerId);

  const rect = svg.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * width.value;
  const y = ((event.clientY - rect.top) / rect.height) * height.value;

  dragState.value = {
    id: element.id,
    offsetX: x - element.x,
    offsetY: y - element.y,
  };
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
};

const getElementLabel = (element) => {
  if (!element) return '';
  return element.placeholderKey ? `{{${element.placeholderKey}}}` : element.text || '';
};

const saveTemplate = async () => {
  await updateTemplate(templateId.value, {
    name: template.value.name,
    description: template.value.description,
    dimensions: template.value.dimensions,
    elements: template.value.elements,
  });
};

const renderPdf = async () => {
  const result = await renderTemplate({
    templateId: templateId.value,
    metadata: { documentName: template.value.name },
    data: {
      cliente_nombre: 'Luis',
      empresa: 'Docugen',
    },
  });
  if (result?.url) {
    window.open(result.url, '_blank');
  }
};

onMounted(async () => {
  await loadTemplate();
});
</script>

<style scoped>
.editor-shell {
  min-height: calc(100vh - 96px);
  background: linear-gradient(180deg, #f5f7ff 0%, #eef3fb 100%);
}

.editor-topbar {
  position: sticky;
  top: 0;
  z-index: 4;
}

.editor-body {
  height: calc(100vh - 140px);
}

.editor-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 280px;
  gap: 16px;
}

.editor-sidebar,
.editor-stage-col {
  min-height: 0;
  height: 100%;
}

.panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(29, 78, 216, 0.08);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  padding: 18px;
}

.panel-header {
  margin-bottom: 16px;
}

.toolbar-stack,
.property-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stage-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.stage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
}

.canvas-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f8fafc, #edf3ff);
  overflow: auto;
}

.template-canvas {
  width: min(100%, 740px);
  height: auto;
  background: white;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  border-radius: 16px;
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
