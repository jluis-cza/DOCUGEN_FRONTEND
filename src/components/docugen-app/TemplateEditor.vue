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

          <v-btn variant="tonal" prepend-icon="mdi-content-save" size="small" @click="saveTemplate">
            Guardar
          </v-btn>
          <v-chip v-if="hasUnsavedChanges" color="warning" size="small" variant="tonal">
            Cambios sin guardar
          </v-chip>
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
          <v-card ref="stagePanel" class="panel stage-panel" rounded="xl">
            <div class="stage-toolbar d-flex justify-space-between align-center">
              <div class="canvas-guides-control">
                <v-checkbox
                  v-model="showGrid"
                  label="Cuadrícula"
                  density="compact"
                  color="primary"
                  hide-details
                  title="Mostrar u ocultar la cuadrícula de referencia"
                />
                <v-checkbox
                  v-model="showMargins"
                  label="Márgenes"
                  density="compact"
                  color="primary"
                  hide-details
                  title="Mostrar u ocultar la guía de márgenes"
                />
              </div>
              <div class="d-flex align-center ga-1">
                <v-btn
                  icon="mdi-minus"
                  size="small"
                  variant="text"
                  aria-label="Reducir zoom"
                  title="Reducir zoom"
                  @click="zoomOut"
                />
                <span class="zoom-percentage" aria-live="polite">
                  {{ Math.round(zoom * 100) }}%
                </span>
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  variant="text"
                  aria-label="Aumentar zoom"
                  title="Aumentar zoom"
                  @click="zoomIn"
                />
                <v-divider vertical class="mx-1" />
                <v-btn
                  size="small"
                  :icon="panMode ? 'mdi-hand-back-right' : 'mdi-hand-back-right-outline'"
                  variant="text"
                  :color="panMode ? 'primary' : undefined"
                  :aria-pressed="panMode"
                  :aria-label="panMode ? 'Desactivar desplazamiento de hoja' : 'Activar desplazamiento de hoja'"
                  title="Modo para mover la hoja"
                  @click="panMode = !panMode"
                />
                <v-btn
                  icon="mdi-fit-to-page-outline"
                  size="small"
                  variant="text"
                  aria-label="Restablecer vista de hoja"
                  title="Restablecer vista de hoja"
                  @click="resetZoom"
                />
              </div>
            </div>

            <div
              ref="canvasShell"
              class="canvas-shell"
              :class="{ 'page-is-panning': pagePanDrag }"
              @click="closeContextMenu"
              @wheel="handleCanvasWheel"
            >
              <div
                class="ruler ruler-horizontal"
                title="Regla en píxeles CSS; 96 px equivalen a 1 pulgada"
              >
                <div
                  v-for="tick in horizontalRulerTicks"
                  :key="`h-${tick.value}`"
                  class="tick"
                  :style="{ left: `${rulerOrigin + panOffset.x + tick.value * zoom}px` }"
                >
                  <span>{{ tick.value }}</span>
                </div>
              </div>

              <div
                class="ruler ruler-vertical"
                title="Regla en píxeles CSS; 96 px equivalen a 1 pulgada"
              >
                <div
                  v-for="tick in verticalRulerTicks"
                  :key="`v-${tick.value}`"
                  class="tick"
                  :style="{ top: `${rulerOrigin + panOffset.y + tick.value * zoom}px` }"
                >
                  <span>{{ tick.value }}</span>
                </div>
              </div>

              <div ref="pageViewport" class="page-viewport">
                <div
                  class="page-wrapper"
                  :style="{
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                  }"
                >
                  <svg
                    ref="svgRef"
                    :viewBox="`0 0 ${width} ${height}`"
                    class="template-canvas"
                    :class="{ 'page-pan-active': panMode || pagePanDrag }"
                    :style="{ width: `${width}px`, height: `${height}px` }"
                    role="img"
                    aria-label="Vista previa de plantilla"
                    @pointermove="handlePointerMove"
                    @pointerup="stopDrag"
                    @pointercancel="stopDrag"
                    @pointerdown.capture="handleCanvasPointerDown"
                    @pointerdown="clearSelectionIfEmpty"
                    @contextmenu.prevent
                  >
                    <defs>
                      <pattern
                        v-if="showGrid"
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
                      :fill="template.page?.backgroundColor || '#ffffff'"
                      stroke="#dfe3ec"
                      stroke-width="2"
                      @click.stop="selectPage"
                    />
                    <rect
                      v-if="showMargins && template.page?.margin"
                      :x="template.page.margin.left"
                      :y="template.page.margin.top"
                      :width="
                        Math.max(0, width - template.page.margin.left - template.page.margin.right)
                      "
                      :height="
                        Math.max(0, height - template.page.margin.top - template.page.margin.bottom)
                      "
                      fill="none"
                      stroke="#94a3b8"
                      stroke-width="1"
                      stroke-dasharray="6 6"
                      pointer-events="none"
                    />
                    <rect
                      v-if="showGrid"
                      :width="width"
                      :height="height"
                      fill="url(#editor-grid)"
                      opacity="0.55"
                      @click.stop="selectPage"
                    />

                    <g
                      v-for="element in template.elements"
                      :key="element.id"
                      :opacity="element.opacity ?? 1"
                      :transform="
                        element.rotation
                          ? `rotate(${element.rotation} ${Number(element.x) + Number(element.width || 0) / 2} ${Number(element.y) + Number(element.height || 0) / 2})`
                          : undefined
                      "
                    >
                      <rect
                        v-if="element.type === 'rect'"
                        :x="element.x"
                        :y="element.y"
                        :width="element.width"
                        :height="element.height"
                        :fill="element.fill || '#eaf2ff'"
                        :stroke="element.stroke || '#9ec5fe'"
                        :stroke-width="element.strokeWidth || 1"
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
                        :stroke="element.stroke || '#9ec5fe'"
                        :stroke-width="element.strokeWidth || 1"
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
                          v-if="isImagePlaceholder(element)"
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
                          :stroke="element.stroke || '#94a3b8'"
                          :stroke-width="element.strokeWidth || 2"
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
                        <text
                          :x="Number(element.x) + Number(element.width || 18) + 8"
                          :y="Number(element.y) + Number(element.fontSize || 12) + 2"
                          :font-size="element.fontSize || 12"
                          :fill="element.color || '#111111'"
                        >
                          {{ getElementLabel(element) }}
                        </text>
                      </g>

                      <g
                        v-else-if="element.type === 'table'"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer"
                      >
                        <g
                          v-for="(row, rowIndex) in getTableRows(element)"
                          :key="`${element.id}-row-${rowIndex}`"
                        >
                          <g
                            v-for="columnIndex in getTableColumnCount(element)"
                            :key="`${element.id}-${rowIndex}-${columnIndex}`"
                          >
                            <rect
                              :x="element.x + ((columnIndex - 1) * element.width) / getTableColumnCount(element)"
                              :y="element.y + (rowIndex * element.height) / getTableRows(element).length"
                              :width="element.width / getTableColumnCount(element)"
                              :height="element.height / getTableRows(element).length"
                              fill="none"
                              :stroke="element.stroke || '#cbd5e1'"
                              :stroke-width="element.strokeWidth || 1"
                            />
                            <text
                              :x="element.x + ((columnIndex - 1) * element.width) / getTableColumnCount(element) + 4"
                              :y="element.y + (rowIndex * element.height) / getTableRows(element).length + (element.fontSize || 12)"
                              :font-size="element.fontSize || 12"
                              :fill="element.color || '#111111'"
                              :font-weight="element.fontWeight || 400"
                            >
                              {{ row[columnIndex - 1] || '' }}
                            </text>
                          </g>
                        </g>
                      </g>

                      <g
                        v-else-if="element.type === 'signature'"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer"
                      >
                        <line
                          :x1="element.x"
                          :y1="element.y"
                          :x2="Number(element.x) + Number(element.width)"
                          :y2="element.y"
                          :stroke="element.stroke || '#111827'"
                          :stroke-width="element.strokeWidth || 1"
                        />
                        <text
                          :x="getAlignedTextX(element)"
                          :y="element.y + (element.fontSize || 12) + 12"
                          :text-anchor="getTextAnchor(element)"
                          :font-size="element.fontSize || 12"
                          :fill="element.color || '#111111'"
                          :font-weight="element.fontWeight || 400"
                        >
                          {{ getElementLabel(element) }}
                        </text>
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
                            'footer',
                          ].includes(element.type)
                        "
                        :x="getAlignedTextX(element)"
                        :y="element.y + (element.height || 20) / 2"
                        :text-anchor="getTextAnchor(element)"
                        :font-size="element.fontSize || 18"
                        :fill="element.color || '#111111'"
                        :font-weight="element.fontWeight || 400"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer; font-family: 'Inter', sans-serif"
                      >
                        <tspan
                          v-for="(line, index) in getWrappedTextLines(element)"
                          :key="`${element.id}-${index}`"
                          :x="getAlignedTextX(element)"
                          :dy="index === 0 ? 0 : Number(element.fontSize || 18) * 1.35"
                        >
                          {{ line }}
                        </tspan>
                      </text>

                      <text
                        v-else
                        :x="getAlignedTextX(element)"
                        :y="element.y + (element.height || 20) / 2"
                        :text-anchor="getTextAnchor(element)"
                        :font-size="element.fontSize || 18"
                        :fill="element.color || '#111111'"
                        :font-weight="element.fontWeight || 400"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                        style="cursor: pointer; font-family: 'Inter', sans-serif"
                      >
                        {{ getElementLabel(element) }}
                      </text>

                      <g
                        v-if="selectedElement?.id === element.id"
                        class="element-selection"
                        pointer-events="none"
                      >
                        <rect
                          :x="Number(element.x || 0) - 4"
                          :y="Number(element.y || 0) - 4"
                          :width="Math.max(Number(element.width || 0), 8) + 8"
                          :height="Math.max(Number(element.height || 0), 8) + 8"
                          rx="2"
                          fill="#3b82f6"
                          fill-opacity="0.06"
                          stroke="#2563eb"
                          stroke-width="1.5"
                          stroke-dasharray="5 3"
                        />
                        <circle
                          :cx="Number(element.x || 0) - 4"
                          :cy="Number(element.y || 0) - 4"
                          r="3"
                          fill="#ffffff"
                          stroke="#2563eb"
                          stroke-width="1.5"
                        />
                        <circle
                          :cx="Number(element.x || 0) + Number(element.width || 0) + 4"
                          :cy="Number(element.y || 0) - 4"
                          r="3"
                          fill="#ffffff"
                          stroke="#2563eb"
                          stroke-width="1.5"
                        />
                        <circle
                          :cx="Number(element.x || 0) - 4"
                          :cy="Number(element.y || 0) + Number(element.height || 0) + 4"
                          r="3"
                          fill="#ffffff"
                          stroke="#2563eb"
                          stroke-width="1.5"
                        />
                        <circle
                          :cx="Number(element.x || 0) + Number(element.width || 0) + 4"
                          :cy="Number(element.y || 0) + Number(element.height || 0) + 4"
                          r="3"
                          fill="#ffffff"
                          stroke="#2563eb"
                          stroke-width="1.5"
                        />
                      </g>
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
                    :prepend-icon="contextMenu.element?.locked ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                    size="small"
                    @click="toggleSelectedElementLock"
                  >
                    {{ contextMenu.element?.locked ? 'Desbloquear' : 'Bloquear' }}
                  </v-btn>
                  <v-btn
                    block
                    variant="text"
                    prepend-icon="mdi-arrange-bring-to-front"
                    size="small"
                    @click="reorderSelectedElement('front')"
                  >
                    Traer al frente
                  </v-btn>
                  <v-btn
                    block
                    variant="text"
                    prepend-icon="mdi-arrange-send-to-back"
                    size="small"
                    @click="reorderSelectedElement('back')"
                  >
                    Enviar al fondo
                  </v-btn>
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
          <v-card class="panel h-100 properties-panel" rounded="xl">
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
                v-if="!['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)"
                v-model="selectedElement.text"
                label="Texto / etiqueta"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-if="['image', 'placeholder'].includes(selectedElement.type)"
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
                selectedElement.type === 'pageNumber' ||
                selectedElement.type === 'checkbox'
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
                    min="0"
                    suffix="px"
                    density="comfortable"
                    @change="commitSelectedElementGeometry"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.y"
                    label="Y"
                    type="number"
                    min="0"
                    suffix="px"
                    density="comfortable"
                    @change="commitSelectedElementGeometry"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.width"
                    label="Ancho"
                    type="number"
                    min="1"
                    :max="width"
                    suffix="px"
                    density="comfortable"
                    @change="commitSelectedElementGeometry"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.height"
                    label="Alto"
                    type="number"
                    min="1"
                    :max="height"
                    suffix="px"
                    density="comfortable"
                    @change="commitSelectedElementGeometry"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                  v-if="!['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)"
                  v-model.number="selectedElement.fontSize"
                    label="Tamaño"
                    type="number"
                    suffix="px"
                    density="comfortable"
                    @change="markDirty"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-if="!['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)"
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
                v-if="!['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)"
                v-model="selectedElement.align"
                label="Alineación"
                :items="['left', 'center', 'right']"
                density="comfortable"
                @change="markDirty"
              />
              <v-select
                v-if="['text', 'title', 'subtitle', 'paragraph', 'list', 'placeholder', 'date', 'pageNumber', 'signature', 'footer', 'table', 'checkbox'].includes(selectedElement.type)"
                v-model="selectedElement.fontWeight"
                label="Grosor de fuente"
                :items="[
                  { title: 'Normal', value: '400' },
                  { title: 'Seminegrita', value: '600' },
                  { title: 'Negrita', value: '700' },
                ]"
                item-title="title"
                item-value="value"
                density="comfortable"
                @update:model-value="markDirty"
              />
              <v-text-field
                v-if="['rect', 'checkbox'].includes(selectedElement.type)"
                v-model="selectedElement.fill"
                label="Relleno"
                type="color"
                density="comfortable"
                @update:model-value="markDirty"
              />
              <v-checkbox
                v-if="selectedElement.type === 'checkbox'"
                v-model="selectedElement.checked"
                label="Marcada"
                density="comfortable"
                hide-details
                @update:model-value="markDirty"
              />
              <v-text-field
                v-model.number="selectedElement.rotation"
                label="Rotación"
                type="number"
                suffix="°"
                density="comfortable"
                @update:model-value="markDirty"
              />
              <v-slider
                v-model.number="selectedElement.opacity"
                label="Opacidad"
                min="0"
                max="1"
                step="0.05"
                thumb-label
                density="comfortable"
                @update:model-value="markDirty"
              />
              <v-text-field
                v-if="['rect', 'line', 'separator', 'checkbox', 'signature', 'table'].includes(selectedElement.type)"
                v-model="selectedElement.stroke"
                label="Color de borde"
                type="color"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-if="['rect', 'line', 'separator', 'checkbox', 'signature', 'table'].includes(selectedElement.type)"
                v-model.number="selectedElement.strokeWidth"
                label="Grosor de borde"
                type="number"
                density="comfortable"
                @change="markDirty"
              />
              <v-checkbox
                v-model="selectedElement.locked"
                label="Bloquear posición"
                density="comfortable"
                hide-details
                @update:model-value="markDirty"
              />
            </template>

            <template v-else>
              <v-text-field
                v-model="template.name"
                label="Nombre"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                v-model="template.page.backgroundColor"
                label="Fondo de página"
                type="color"
                density="comfortable"
                @update:model-value="markDirty"
              />
              <v-textarea
                v-model="template.description"
                label="Descripción"
                rows="3"
                density="comfortable"
                @change="markDirty"
              />
              <div class="text-caption text-medium-emphasis mb-1">Márgenes (px)</div>
              <v-row dense>
                <v-col v-for="side in ['top', 'right', 'bottom', 'left']" :key="side" cols="6">
                  <v-text-field
                    v-model.number="template.page.margin[side]"
                    :label="side === 'top' ? 'Superior' : side === 'right' ? 'Derecho' : side === 'bottom' ? 'Inferior' : 'Izquierdo'"
                    type="number"
                    min="0"
                    suffix="px"
                    density="comfortable"
                    @update:model-value="markDirty"
                  />
                </v-col>
              </v-row>
              <v-text-field
                v-model.number="template.dimensions.width"
                label="Ancho (px)"
                type="number"
                min="100"
                max="5000"
                step="1"
                hint="Entre 100 y 5000 px"
                persistent-hint
                density="comfortable"
                @change="commitPageDimensions"
              />
              <v-text-field
                v-model.number="template.dimensions.height"
                label="Alto (px)"
                type="number"
                min="100"
                max="5000"
                step="1"
                hint="Entre 100 y 5000 px"
                persistent-hint
                density="comfortable"
                @change="commitPageDimensions"
              />
              <v-select
                v-model="template.status"
                label="Estado"
                :items="TEMPLATE_STATUS_OPTIONS"
                item-title="title"
                item-value="value"
                density="comfortable"
                @change="markDirty"
              />

              <v-divider class="my-3" />

              <div class="panel-helper">
                <div class="text-caption text-medium-emphasis mb-2">Parámetros dinámicos</div>
                <div v-if="dynamicParameters.length" class="d-flex flex-column ga-2 mb-3">
                  <v-card
                    v-for="(parameter, index) in dynamicParameters"
                    :key="parameter.key || index"
                    class="pa-2"
                    variant="tonal"
                  >
                    <v-text-field
                      :model-value="parameter.key"
                      label="Nombre"
                      density="compact"
                      hide-details
                      @update:model-value="(value) => renameDynamicParameter(parameter, value)"
                    />
                    <v-text-field
                      v-model="parameter.label"
                      label="Etiqueta del formulario"
                      density="compact"
                      hide-details
                      @update:model-value="markDirty"
                    />
                    <v-textarea
                      v-model="parameter.description"
                      label="Descripción"
                      rows="2"
                      density="compact"
                      hide-details
                      @update:model-value="markDirty"
                    />
                    <v-text-field
                      :model-value="(parameter.allowedValues || []).join(', ')"
                      label="Valores permitidos (separados por comas)"
                      density="compact"
                      hide-details
                      @update:model-value="(value) => setParameterAllowedValues(parameter, value)"
                    />
                    <div class="d-flex align-center ga-2">
                      <v-btn
                        icon="mdi-link-variant"
                        size="small"
                        variant="text"
                        :disabled="!selectedElement || selectedElement.type === 'pageNumber'"
                        :aria-label="`Vincular parámetro ${parameter.key} al elemento seleccionado`"
                        @click="insertPlaceholder(parameter.key)"
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
                        @update:model-value="markDirty"
                      />
                      <v-checkbox
                        v-model="parameter.required"
                        label="Requerido"
                        hide-details
                        density="compact"
                        @update:model-value="markDirty"
                      />
                      <v-btn
                        icon="mdi-delete-outline"
                        size="small"
                        variant="text"
                        color="error"
                        :aria-label="`Eliminar parámetro ${parameter.key}`"
                        @click="removeDynamicParameter(parameter.key)"
                      />
                    </div>
                  </v-card>
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

      <v-card class="editor-status-bar" rounded="lg" variant="tonal" role="status">
        <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-cursor-default">
          {{ selectedItemStatus }}
        </v-chip>
        <v-chip size="small" variant="tonal" prepend-icon="mdi-shape-outline">
          {{ template.elements.length }} elementos
        </v-chip>
        <v-chip size="small" variant="tonal" prepend-icon="mdi-file-document-outline">
          {{ pageSizeStatus }}
        </v-chip>
        <v-chip size="small" variant="tonal" prepend-icon="mdi-magnify">
          Zoom {{ Math.round(zoom * 100) }}%
        </v-chip>
        <span class="ruler-conversion" title="Conversión CSS estándar a 96 puntos por pulgada">
          Regletas: px · 96 px = 1 pulgada
        </span>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { useTemplates } from '../../composables/docugen-app/useTemplates.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';
import { TEMPLATE_STATUS_OPTIONS } from '../../helpers/docugen-app/templateStatus.js';

const route = useRoute();
const router = useRouter();
const templateId = computed(() => route.params.templateId);
const notificationStore = useNotificationStore();
const { getTemplate, updateTemplate, renderTemplate, message, code } = useTemplates();

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
const canvasShell = ref(null);
const stagePanel = ref(null);
const canvasShellSize = ref({ width: 0, height: 0 });
const width = ref(794);
const height = ref(1123);
const zoom = ref(1);
const panOffset = ref({ x: 0, y: 0 });
const pagePanDrag = ref(null);
const panMode = ref(false);
const pageSelected = ref(false);
const showGrid = ref(true);
const showMargins = ref(true);
const history = ref([]);
const future = ref([]);
const contextMenu = ref({ visible: false, x: 0, y: 0, element: null });
const savedSnapshot = ref('');
const rulerOrigin = 28;

function getRulerStep(zoomLevel) {
  const targetStep = 60 / zoomLevel;
  const magnitude = 10 ** Math.floor(Math.log10(targetStep));
  const normalized = targetStep / magnitude;
  const multiple = normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : 5;
  return multiple * magnitude;
}

function getVisibleRulerTicks(offset, zoomLevel, viewportLength) {
  const step = getRulerStep(zoomLevel);
  const firstValue =
    Math.floor((-rulerOrigin - offset) / (zoomLevel * step)) * step;
  const lastValue =
    Math.ceil((viewportLength - rulerOrigin - offset) / (zoomLevel * step)) * step;
  const count = Math.max(0, Math.min(500, Math.floor((lastValue - firstValue) / step) + 1));

  return Array.from({ length: count }, (_, index) => ({
    value: Number((firstValue + index * step).toFixed(6)),
  }));
}

const horizontalRulerTicks = computed(() =>
  getVisibleRulerTicks(
    panOffset.value.x,
    zoom.value,
    canvasShellSize.value.width
  )
);
const verticalRulerTicks = computed(() =>
  getVisibleRulerTicks(
    panOffset.value.y,
    zoom.value,
    canvasShellSize.value.height
  )
);
const hasUnsavedChanges = computed(() => serializeTemplate() !== savedSnapshot.value);
const selectedItemStatus = computed(() => {
  if (!selectedElement.value) return 'Hoja';
  const elementTypes = {
    text: 'Texto',
    title: 'Título',
    subtitle: 'Subtítulo',
    paragraph: 'Párrafo',
    list: 'Lista',
    image: 'Imagen',
    placeholder: 'Placeholder',
    date: 'Fecha',
    pageNumber: 'Número de página',
    rect: 'Caja',
    line: 'Línea',
    footer: 'Pie',
    qr: 'Código QR',
    signature: 'Firma',
    separator: 'Separador',
    table: 'Tabla',
    checkbox: 'Casilla',
  };
  const elementIndex = template.value.elements.findIndex(
    (element) => element.id === selectedElement.value.id
  );
  return `${elementTypes[selectedElement.value.type] || 'Elemento'}${elementIndex >= 0 ? ` #${elementIndex + 1}` : ''}`;
});
const pageSizeStatus = computed(() => {
  const pageWidth = Number(template.value.dimensions.width || width.value);
  const pageHeight = Number(template.value.dimensions.height || height.value);
  const widthMm = (pageWidth * 25.4) / 96;
  const heightMm = (pageHeight * 25.4) / 96;
  const namedSizes = [
    { name: 'A0', width: 841, height: 1189 },
    { name: 'A1', width: 594, height: 841 },
    { name: 'A2', width: 420, height: 594 },
    { name: 'A3', width: 297, height: 420 },
    { name: 'A4', width: 210, height: 297 },
    { name: 'A5', width: 148, height: 210 },
    { name: 'Carta', width: 215.9, height: 279.4 },
    { name: 'Legal', width: 215.9, height: 355.6 },
    { name: 'Tabloide', width: 279.4, height: 431.8 },
  ];
  const matchedSize = namedSizes.find(
    (size) =>
      (Math.abs(widthMm - size.width) <= 1.5 && Math.abs(heightMm - size.height) <= 1.5) ||
      (Math.abs(widthMm - size.height) <= 1.5 && Math.abs(heightMm - size.width) <= 1.5)
  );

  return `${matchedSize?.name || 'Personalizada'} · ${pageWidth} × ${pageHeight} px · ${widthMm.toFixed(1)} × ${heightMm.toFixed(1)} mm · ${(pageWidth / 96).toFixed(2)} × ${(pageHeight / 96).toFixed(2)} pulg.`;
});

const serializeTemplate = () =>
  JSON.stringify({
    name: template.value.name,
    description: template.value.description,
    status: template.value.status,
    dimensions: template.value.dimensions,
    page: template.value.page,
    canvas: template.value.canvas,
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

const replacePlaceholderKey = (value, oldKey, newKey) => {
  if (typeof value !== 'string' || !oldKey) return value;
  const escapedKey = oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return value.replace(new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g'), `{{${newKey}}}`);
};

const renameDynamicParameter = (parameter, value) => {
  const previousKey = parameter.key;
  const nextKey = String(value || '').trim().replace(/\s+/g, '_');
  parameter.key = nextKey;
  normalizeDynamicParameter(parameter);
  const normalizedKey = parameter.key;
  if (previousKey && normalizedKey && previousKey !== normalizedKey) {
    template.value.elements.forEach((element) => {
      if (element.placeholderKey === previousKey) element.placeholderKey = normalizedKey;
      element.text = replacePlaceholderKey(element.text, previousKey, normalizedKey);
      element.src = replacePlaceholderKey(element.src, previousKey, normalizedKey);
      element.qrValue = replacePlaceholderKey(element.qrValue, previousKey, normalizedKey);
    });
  }
  syncDynamicParametersFromTemplate();
  pushHistory();
};

const setParameterAllowedValues = (parameter, value) => {
  parameter.allowedValues = String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  pushHistory();
};

const removeDynamicParameter = (key) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const placeholderPattern = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g');
  template.value.elements.forEach((element) => {
    if (element.placeholderKey === key) element.placeholderKey = '';
    for (const field of ['text', 'src', 'qrValue']) {
      if (typeof element[field] === 'string') {
        element[field] = element[field].replace(placeholderPattern, '');
      }
    }
  });
  template.value.metadata.dynamicParameters = (template.value.metadata.dynamicParameters || [])
    .filter((parameter) => parameter.key !== key);
  syncDynamicParametersFromTemplate();
  pushHistory();
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
    if (!key || key === 'page_number') return;
    map.set(key, {
      ...item,
      key,
      label: item.label || key,
      type: item.type || 'text',
      required: Boolean(item.required),
    });
  });

  template.value.elements.forEach((element) => {
    if (element.type === 'pageNumber') return;

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

const updateCanvasShellSize = () => {
  if (!canvasShell.value) return;
  canvasShellSize.value = {
    width: canvasShell.value.clientWidth,
    height: canvasShell.value.clientHeight,
  };
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

const constrainPanOffset = (x, y, zoomLevel = zoom.value) => {
  const viewportWidth = Math.max(0, canvasShellSize.value.width - rulerOrigin);
  const viewportHeight = Math.max(0, canvasShellSize.value.height - rulerOrigin);
  const scaledWidth = width.value * zoomLevel;
  const scaledHeight = height.value * zoomLevel;
  const visibleWidth = Math.min(80, scaledWidth / 2);
  const visibleHeight = Math.min(80, scaledHeight / 2);

  return {
    x: Math.max(visibleWidth - scaledWidth, Math.min(x, viewportWidth - visibleWidth)),
    y: Math.max(visibleHeight - scaledHeight, Math.min(y, viewportHeight - visibleHeight)),
  };
};

const centerPageInViewport = () => {
  const viewportWidth = Math.max(0, canvasShellSize.value.width - rulerOrigin);
  const viewportHeight = Math.max(0, canvasShellSize.value.height - rulerOrigin);
  const centered = {
    x: (viewportWidth - width.value * zoom.value) / 2,
    y: (viewportHeight - height.value * zoom.value) / 2,
  };
  panOffset.value = constrainPanOffset(centered.x, centered.y);
};

const fitPageToViewport = () => {
  if (!pageViewport.value) return;

  const viewportWidth = Math.max(320, pageViewport.value.clientWidth - 8);
  const viewportHeight = Math.max(220, pageViewport.value.clientHeight - 8);
  const nextZoom = Math.min(viewportWidth / width.value, viewportHeight / height.value, 1);
  zoom.value = Number(Math.max(0.25, nextZoom).toFixed(2));
};

const zoomIn = () => {
  zoom.value = Math.min(2, Number((zoom.value + 0.1).toFixed(2)));
  panOffset.value = constrainPanOffset(panOffset.value.x, panOffset.value.y);
};

const zoomOut = () => {
  zoom.value = Math.max(0.25, Number((zoom.value - 0.1).toFixed(2)));
  panOffset.value = constrainPanOffset(panOffset.value.x, panOffset.value.y);
};

const resetZoom = () => {
  fitPageToViewport();
  centerPageInViewport();
};

const backToTemplates = async () => {
  if (hasUnsavedChanges.value && !(await saveTemplate())) return;
  router.push('/dashboard/templates');
};

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
    savedSnapshot.value = serializeTemplate();
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
    placeholderKey: '',
    x: 660,
    y: 1090,
    width: 80,
    height: 20,
    align: 'right',
    fontSize: 10,
  });

const insertPlaceholder = (key) => {
  if (!selectedElement.value) return;
  const parameter = template.value.metadata.dynamicParameters?.find((item) => item.key === key);

  if (
    [
      'text',
      'title',
      'subtitle',
      'paragraph',
      'list',
      'date',
      'signature',
      'footer',
      'table',
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

  if (selectedElement.value.type === 'checkbox') {
    selectedElement.value.placeholderKey = key;
    if (parameter) parameter.type = 'boolean';
  }

  if (selectedElement.value.type === 'image') {
    selectedElement.value.placeholderKey = key;
    selectedElement.value.src = `{{${key}}}`;
    if (parameter) parameter.type = 'image';
  }

  if (selectedElement.value.type === 'qr') {
    selectedElement.value.placeholderKey = key;
    selectedElement.value.qrValue = `{{${key}}}`;
    if (parameter) parameter.type = 'qr';
  }

  syncDynamicParametersFromTemplate();
  pushHistory();
};

const selectElement = (element) => {
  pageSelected.value = false;
  selectedElement.value = element;
};

const constrainElementToPage = (element) => {
  const pageWidth = Number(template.value.dimensions.width || width.value);
  const pageHeight = Number(template.value.dimensions.height || height.value);
  element.width = Math.max(1, Math.min(Number(element.width) || 1, pageWidth));
  element.height = Math.max(1, Math.min(Number(element.height) || 1, pageHeight));
  element.x = Math.max(0, Math.min(Number(element.x) || 0, pageWidth - element.width));
  element.y = Math.max(0, Math.min(Number(element.y) || 0, pageHeight - element.height));
};

const commitSelectedElementGeometry = () => {
  if (!selectedElement.value) return;
  constrainElementToPage(selectedElement.value);
  markDirty();
};

const commitPageDimensions = () => {
  template.value.elements.forEach(constrainElementToPage);
  markDirty();
};

const clearSelectionIfEmpty = (event) => {
  if (event.target === event.currentTarget) {
    selectedElement.value = null;
    closeContextMenu();
  }
};

const openContextMenu = (event, element) => {
  selectElement(element);
  const panelRect = stagePanel.value?.$el?.getBoundingClientRect();
  contextMenu.value = {
    visible: true,
    x: Math.max(0, Math.min(event.clientX - (panelRect?.left || 0), (panelRect?.width || 0) - 160)),
    y: Math.max(0, Math.min(event.clientY - (panelRect?.top || 0), (panelRect?.height || 0) - 130)),
    element,
  };
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

const toggleSelectedElementLock = () => {
  if (!selectedElement.value) return;
  selectedElement.value.locked = !selectedElement.value.locked;
  pushHistory();
  closeContextMenu();
};

const reorderSelectedElement = (position) => {
  const elements = template.value.elements;
  const index = elements.findIndex((element) => element.id === selectedElement.value?.id);
  if (index < 0) return;
  const [element] = elements.splice(index, 1);
  elements.splice(position === 'front' ? elements.length : 0, 0, element);
  pushHistory();
  closeContextMenu();
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

const startPagePan = (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (!svgRef.value) return;

  svgRef.value.setPointerCapture?.(event.pointerId);
  pagePanDrag.value = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startPanX: panOffset.value.x,
    startPanY: panOffset.value.y,
  };
};

const handleCanvasPointerDown = (event) => {
  if (event.button === 1 || (event.button === 0 && panMode.value)) {
    startPagePan(event);
  }
};

const startDrag = (event, element) => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  selectElement(element);
  if (element.locked) return;
  constrainElementToPage(element);

  const svg = svgRef.value;
  if (!svg) return;
  svg.setPointerCapture?.(event.pointerId);

  const rect = svg.getBoundingClientRect();
  const x = Math.max(0, Math.min(((event.clientX - rect.left) / rect.width) * width.value, width.value));
  const y = Math.max(0, Math.min(((event.clientY - rect.top) / rect.height) * height.value, height.value));

  dragState.value = {
    id: element.id,
    offsetX: x - element.x,
    offsetY: y - element.y,
  };

  pushHistory();
};

const handlePointerMove = (event) => {
  if (pagePanDrag.value?.pointerId === event.pointerId) {
    const drag = pagePanDrag.value;
    panOffset.value = constrainPanOffset(
      drag.startPanX + event.clientX - drag.startX,
      drag.startPanY + event.clientY - drag.startY
    );
    return;
  }

  if (!dragState.value || !svgRef.value) return;

  const svg = svgRef.value;
  const rect = svg.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * width.value;
  const y = ((event.clientY - rect.top) / rect.height) * height.value;

  const current = template.value.elements.find((element) => element.id === dragState.value.id);
  if (!current) return;

  current.x = Math.max(
    0,
    Math.min(x - dragState.value.offsetX, Math.max(0, width.value - Number(current.width || 0)))
  );
  current.y = Math.max(
    0,
    Math.min(y - dragState.value.offsetY, Math.max(0, height.value - Number(current.height || 0)))
  );
};

const handleCanvasWheel = (event) => {
  if (!pageSelected.value || !event.shiftKey || event.deltaY === 0) return;
  event.preventDefault();

  const previousZoom = zoom.value;
  const nextZoom = Math.max(
    0.25,
    Math.min(2, previousZoom * Math.exp(-event.deltaY * 0.0015))
  );
  if (nextZoom === previousZoom) return;

  const viewportRect = pageViewport.value.getBoundingClientRect();
  const pointerX = event.clientX - viewportRect.left;
  const pointerY = event.clientY - viewportRect.top;
  const pageX = (pointerX - panOffset.value.x) / previousZoom;
  const pageY = (pointerY - panOffset.value.y) / previousZoom;
  zoom.value = Number(nextZoom.toFixed(2));
  panOffset.value = constrainPanOffset(
    pointerX - pageX * zoom.value,
    pointerY - pageY * zoom.value
  );
};

const selectPage = () => {
  pageSelected.value = true;
  selectedElement.value = null;
  closeContextMenu();
};

const stopDrag = (event) => {
  if (event?.pointerId !== undefined && svgRef.value?.hasPointerCapture?.(event.pointerId)) {
    svgRef.value.releasePointerCapture(event.pointerId);
  }
  if (pagePanDrag.value?.pointerId === event?.pointerId) {
    pagePanDrag.value = null;
  }
  const hadElementDrag = Boolean(dragState.value);
  dragState.value = null;
  if (hadElementDrag) pushHistory();
};

const isImagePlaceholder = (element) => {
  if (!element) return true;
  const value = String(element.src || '');
  return !value || value.includes('{{');
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

const getTextAnchor = (element) => {
  if (element.align === 'center') return 'middle';
  if (element.align === 'right') return 'end';
  return 'start';
};

const getAlignedTextX = (element) => {
  const x = Number(element.x || 0);
  const width = Number(element.width || 0);
  if (element.align === 'center') return x + width / 2;
  if (element.align === 'right') return x + width;
  return x;
};

const getTableRows = (element) => String(element.text || '').split('\n').map((row) => row.split('|'));

const getTableColumnCount = (element) =>
  Math.max(1, ...getTableRows(element).map((row) => row.length));

const saveTemplate = async () => {
  try {
    await updateTemplate(templateId.value, {
      name: template.value.name,
      description: template.value.description,
      dimensions: template.value.dimensions,
      page: template.value.page,
      canvas: template.value.canvas,
      elements: template.value.elements,
      metadata: template.value.metadata,
      status: template.value.status,
    });
    history.value = [serializeTemplate()];
    future.value = [];
    savedSnapshot.value = serializeTemplate();
    notificationStore.setNotification({
      message: message.value,
      code: code.value,
      mode: 'automatic',
    });
    return true;
  } catch (error) {
    notificationStore.setNotification({
      message: error.response?.data?.message || error.message || 'No se pudo guardar la plantilla.',
      code: error.response?.data?.code || 'EXXX',
      mode: 'automatic',
    });
    return false;
  }
};

const openPresentation = async () => {
  if (hasUnsavedChanges.value && !(await saveTemplate())) return;
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

onBeforeRouteLeave(() => {
  if (!hasUnsavedChanges.value) return true;
  return window.confirm('Hay cambios sin guardar. ¿Deseas salir sin guardar?');
});

onMounted(async () => {
  await loadTemplate();
  updateCanvasShellSize();
  fitPageToViewport();
  centerPageInViewport();

  if (canvasShell.value && 'ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      updateCanvasShellSize();
      fitPageToViewport();
      centerPageInViewport();
    });
    observer.observe(canvasShell.value);
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
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
  height: calc(100dvh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f4f7ff 0%, #eef4fb 100%);
}

.editor-topbar {
  position: sticky;
  flex: 0 0 auto;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.editor-body {
  flex: 1 1 auto;
  width: 100%;
  height: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.editor-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 320px;
  gap: 16px;
}

.editor-sidebar,
.editor-stage-col {
  min-height: 0;
  height: 100%;
}

.properties-panel {
  overflow-y: auto;
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
  min-height: 0;
  position: relative;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.9));
}

.stage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  margin-bottom: 12px;
}

.canvas-guides-control {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 12px;
}

.canvas-guides-control :deep(.v-selection-control) {
  min-height: 32px;
}

.zoom-percentage {
  min-width: 42px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.canvas-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8fafc, #edf3ff);
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  touch-action: none;
}

.ruler {
  position: absolute;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.15);
  z-index: 2;
  pointer-events: none;
}

.ruler-horizontal {
  left: 0;
  right: 0;
  top: 0;
  height: 28px;
  overflow: hidden;
}

.ruler-vertical {
  left: 0;
  top: 0;
  bottom: 0;
  width: 28px;
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
  inset: 28px 0 0 28px;
  overflow: hidden;
}

.page-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
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
  border-radius: 0;
}

.page-pan-active {
  cursor: grab;
}

.page-pan-active * {
  cursor: grab !important;
}

.page-is-panning {
  cursor: grabbing;
}

.page-is-panning * {
  cursor: grabbing !important;
}

.editor-status-bar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.78);
}

.ruler-conversion {
  margin-left: auto;
  color: rgba(71, 85, 105, 0.9);
  font-size: 11px;
  white-space: nowrap;
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
  .editor-shell {
    height: auto;
    min-height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
    min-height: calc(100dvh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
    overflow: visible;
  }

  .editor-body {
    flex: 1 0 auto;
    height: auto;
    min-height: 0;
  }

  .editor-layout {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .editor-sidebar,
  .editor-stage-col {
    height: auto;
  }

  .sidebar-panel {
    min-height: auto;
  }

  .toolbar-grid {
    flex: none;
    max-height: 35vh;
  }

  .stage-panel {
    height: auto;
  }

  .stage-toolbar {
    flex-wrap: wrap;
    padding: 6px 4px 10px;
  }

  .canvas-guides-control {
    column-gap: 6px;
  }

  .canvas-guides-control :deep(.v-label) {
    font-size: 0.75rem;
  }

  .canvas-shell {
    flex: none;
    height: min(65vh, 700px);
    min-height: 360px;
  }

  .properties-panel {
    overflow: visible;
  }

  .editor-status-bar {
    margin-top: 0;
  }

  .ruler-conversion {
    margin-left: 0;
  }
}

@media (max-width: 600px) {
  .editor-body {
    padding: 12px !important;
  }

  .editor-status-bar {
    align-items: flex-start;
  }

  .editor-status-bar .v-chip {
    max-width: 100%;
  }

  .editor-status-bar .v-chip :deep(.v-chip__content) {
    white-space: normal;
  }

  .ruler-conversion {
    width: 100%;
  }
}
</style>
