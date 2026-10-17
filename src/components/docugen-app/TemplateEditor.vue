<template>
  <div class="editor-root">
    <div v-if="!templateLoaded && !templateLoading" class="editor-load-error">
      <v-card max-width="560" class="pa-6 text-center" rounded="xl">
        <v-icon color="error" size="48">mdi-file-alert-outline</v-icon>
        <h2 class="text-h6 mt-3">No se pudo abrir la plantilla</h2>
        <p class="text-body-2 text-medium-emphasis mt-2">
          {{ templateLoadError || 'La plantilla no está disponible.' }}
        </p>
        <v-btn class="mt-4" color="primary" @click="backToTemplates"> Volver a plantillas </v-btn>
      </v-card>
    </div>

    <div v-if="templateLoaded" class="editor-shell">
    <v-app-bar color="surface" flat class="editor-topbar border-b" density="comfortable">
      <template #prepend>
        <v-btn icon="mdi-arrow-left" variant="text" color="primary" @click="backToTemplates" />
      </template>

        <div class="editor-heading">
        <div class="text-start">
          <div class="text-caption text-medium-emphasis">Plantillas</div>
          <div class="text-subtitle-1 font-weight-bold">
            {{ template.name || 'Nueva plantilla' }}
          </div>
        </div>
          <v-chip
            v-if="hasUnsavedChanges"
            class="editor-dirty-chip"
            color="warning"
            size="small"
            variant="tonal"
          >
            Cambios sin guardar
          </v-chip>
      </div>

      <template #append>
          <div class="editor-actions">
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

            <v-btn
              variant="tonal"
              prepend-icon="mdi-content-save"
              size="small"
              @click="saveTemplate"
            >
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
              <div class="d-flex align-center mb-4">
                <v-btn
                  icon="mdi-chevron-left"
                  variant="text"
                  size="small"
                  aria-label="Ir a Elementos"
                  :disabled="elementSidebarTab === 'elements'"
                  @click="navigateElementSidebar(-1)"
                />
                <v-tabs
                  v-model="elementSidebarTab"
                  class="flex-grow-1 sidebar-section-tabs"
                  :show-arrows="false"
                >
                  <v-tab value="elements" prepend-icon="mdi-shape-outline">Elementos</v-tab>
                  <v-tab value="resources" prepend-icon="mdi-image-multiple-outline"
                    >Recursos</v-tab
                  >
                </v-tabs>
                <v-btn
                  icon="mdi-chevron-right"
                  variant="text"
                  size="small"
                  aria-label="Ir a Recursos"
                  :disabled="elementSidebarTab === 'resources'"
                  @click="navigateElementSidebar(1)"
                />
            </div>

              <v-window v-model="elementSidebarTab" class="sidebar-tab-content">
                <v-window-item value="elements">
                  <div class="sidebar-content-scroll">
            <div class="toolbar-grid">
              <v-btn block draggable="true" color="primary" variant="tonal" @click="addTextElement" @dragstart="startElementToolDrag($event, 'text')">
                <v-icon start icon="mdi-format-text" /> Texto
              </v-btn>
              <v-btn block draggable="true" color="primary" variant="tonal" @click="addTitleElement" @dragstart="startElementToolDrag($event, 'title')">
                <v-icon start icon="mdi-format-header-pound" /> Título
              </v-btn>
              <v-btn block draggable="true" color="primary" variant="tonal" @click="addSubtitleElement" @dragstart="startElementToolDrag($event, 'subtitle')">
                <v-icon start icon="mdi-format-size" /> Subtítulo
              </v-btn>
              <v-btn block draggable="true" color="primary" variant="tonal" @click="addParagraphElement" @dragstart="startElementToolDrag($event, 'paragraph')">
                <v-icon start icon="mdi-format-paragraph" /> Párrafo
              </v-btn>
              <v-btn block draggable="true" color="primary" variant="tonal" @click="addListElement" @dragstart="startElementToolDrag($event, 'list')">
                <v-icon start icon="mdi-format-list-bulleted" /> Lista
              </v-btn>
              <v-btn block draggable="true" color="secondary" variant="tonal" @click="addPlaceholder" @dragstart="startElementToolDrag($event, 'placeholder')">
                        <v-icon start icon="mdi-variable" /> Campo dinámico
              </v-btn>
              <v-btn block draggable="true" color="secondary" variant="tonal" @click="addImageElement" @dragstart="startElementToolDrag($event, 'image')">
                <v-icon start icon="mdi-image" /> Imagen
              </v-btn>
              <v-btn block draggable="true" color="secondary" variant="tonal" @click="addQrElement" @dragstart="startElementToolDrag($event, 'qr')">
                <v-icon start icon="mdi-qrcode" /> QR
              </v-btn>
              <v-btn block draggable="true" color="secondary" variant="tonal" @click="addDateElement" @dragstart="startElementToolDrag($event, 'date')">
                <v-icon start icon="mdi-calendar" /> Fecha
              </v-btn>
              <v-btn block draggable="true" color="warning" variant="tonal" @click="addFooterElement" @dragstart="startElementToolDrag($event, 'footer')">
                <v-icon start icon="mdi-page-layout-footer" /> Pie
              </v-btn>
              <v-btn block draggable="true" color="warning" variant="tonal" @click="addSignatureElement" @dragstart="startElementToolDrag($event, 'signature')">
                <v-icon start icon="mdi-signature-freehand" /> Firma
              </v-btn>
              <v-btn block draggable="true" color="success" variant="tonal" @click="addLineElement" @dragstart="startElementToolDrag($event, 'line')">
                <v-icon start icon="mdi-minus" /> Línea
              </v-btn>
              <v-btn block draggable="true" color="success" variant="tonal" @click="addRectElement" @dragstart="startElementToolDrag($event, 'rect')">
                <v-icon start icon="mdi-rectangle" /> Caja
              </v-btn>
              <v-btn block draggable="true" color="success" variant="tonal" @click="addTableElement" @dragstart="startElementToolDrag($event, 'table')">
                <v-icon start icon="mdi-table" /> Tabla
              </v-btn>
              <v-btn block draggable="true" color="info" variant="tonal" @click="addCheckboxElement" @dragstart="startElementToolDrag($event, 'checkbox')">
                <v-icon start icon="mdi-checkbox-marked-outline" /> Casilla
              </v-btn>
              <v-btn block draggable="true" color="info" variant="tonal" @click="addPageNumberElement" @dragstart="startElementToolDrag($event, 'pageNumber')">
                <v-icon start icon="mdi-numeric" /> Nº página
              </v-btn>
            </div>
                    <div class="text-caption text-medium-emphasis mt-3">
                      Haz clic para agregar un elemento en su posición inicial o arrástralo hasta
                      el lienzo para colocarlo donde quieras.
                    </div>
                  </div>
                </v-window-item>
                <v-window-item value="resources">
                  <div class="sidebar-content-scroll resource-panel">
                    <div class="text-body-2 mb-2">
                      Imágenes estáticas de la plantilla. PNG y JPEG, hasta 2 MB por imagen y 6 MB
                      en total.
                    </div>
                    <input
                      ref="imageResourceInput"
                      class="d-none"
                      type="file"
                      accept="image/png,image/jpeg"
                      @change="handleImageResourceUpload"
                    />
                    <v-btn
                      block
                      color="secondary"
                      variant="tonal"
                      prepend-icon="mdi-upload"
                      class="mb-3"
                      @click="imageResourceInput?.click()"
                    >
                      Subir imagen
                    </v-btn>
                    <div v-if="imageResourceError" class="text-caption text-error mb-2">
                      {{ imageResourceError }}
                    </div>
                    <div v-if="!imageResources.length" class="text-caption text-medium-emphasis">
                      Aún no hay imágenes. Sube recursos y selecciónalos en un elemento imagen.
                    </div>
                    <v-card
                      v-for="resource in imageResources"
                      :key="resource.id"
                      class="pa-2 mb-2"
                      variant="tonal"
                    >
                      <img
                        :src="resource.dataUrl"
                        :alt="resource.name"
                        class="resource-thumbnail mb-2"
                      />
                      <div class="text-body-2 text-truncate" :title="resource.name">
                        {{ resource.name }}
                      </div>
                      <div class="text-caption text-medium-emphasis mb-2">
                        {{ formatResourceSize(resource.size) }}
                      </div>
                      <div class="d-flex ga-1">
                        <v-btn
                          size="small"
                          variant="text"
                          prepend-icon="mdi-image-plus"
                          @click="useImageResource(resource)"
                        >
                          Usar imagen
                        </v-btn>
                        <v-btn
                          icon="mdi-delete-outline"
                          size="small"
                          variant="text"
                          color="error"
                          :aria-label="`Eliminar recurso ${resource.name}`"
                          @click="removeImageResource(resource)"
                        />
                      </div>
                    </v-card>
                  </div>
                </v-window-item>
              </v-window>
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
                    :aria-label="
                      panMode
                        ? 'Desactivar desplazamiento de hoja'
                        : 'Activar desplazamiento de hoja'
                    "
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
                    @dragover.prevent
                    @drop.prevent="dropElementTool"
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
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="#e5e7eb"
                            stroke-width="1"
                          />
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
                          Math.max(
                            0,
                            width - template.page.margin.left - template.page.margin.right
                          )
                      "
                      :height="
                          Math.max(
                            0,
                            height - template.page.margin.top - template.page.margin.bottom
                          )
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
                            v-if="getImageSource(element)"
                            :href="getImageSource(element)"
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
                            :font-family="element.fontFamily || 'Arial, sans-serif'"
                            :font-style="element.italic ? 'italic' : undefined"
                            :text-decoration="element.underline ? 'underline' : undefined"
                          >
                            <tspan
                              v-for="(run, runIndex) in getInlineTextRuns(getElementLabel(element))"
                              :key="`${element.id}-checkbox-${runIndex}`"
                              :font-weight="getRunFontWeight(run)"
                              :font-style="run.italic ? 'italic' : undefined"
                              :text-decoration="run.underlined ? 'underline' : undefined"
                        >
                              {{ run.text }}
                            </tspan>
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
                                :x="
                                  element.x +
                                  ((columnIndex - 1) * element.width) / getTableColumnCount(element)
                                "
                                :y="
                                  element.y +
                                  (rowIndex * element.height) / getTableRows(element).length
                                "
                              :width="element.width / getTableColumnCount(element)"
                              :height="element.height / getTableRows(element).length"
                              fill="none"
                              :stroke="element.stroke || '#cbd5e1'"
                              :stroke-width="element.strokeWidth || 1"
                            />
                            <text
                                :x="
                                  element.x +
                                  ((columnIndex - 1) * element.width) /
                                    getTableColumnCount(element) +
                                  4
                                "
                                :y="
                                  element.y +
                                  (rowIndex * element.height) / getTableRows(element).length +
                                  (element.fontSize || 12)
                                "
                              :font-size="element.fontSize || 12"
                              :fill="element.color || '#111111'"
                              :font-weight="element.fontWeight || 400"
                                :font-family="element.fontFamily || 'Arial, sans-serif'"
                                :font-style="element.italic ? 'italic' : undefined"
                                :text-decoration="element.underline ? 'underline' : undefined"
                              >
                                <tspan
                                  v-for="(run, runIndex) in getInlineTextRuns(
                                    row[columnIndex - 1] || ''
                                  )"
                                  :key="`${element.id}-${rowIndex}-${columnIndex}-${runIndex}`"
                                  :font-weight="getRunFontWeight(run)"
                                  :font-style="run.italic ? 'italic' : undefined"
                                  :text-decoration="run.underlined ? 'underline' : undefined"
                            >
                                  {{ run.text }}
                                </tspan>
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
                            :font-family="element.fontFamily || 'Arial, sans-serif'"
                            :font-style="element.italic ? 'italic' : undefined"
                            :text-decoration="element.underline ? 'underline' : undefined"
                          >
                            <tspan
                              v-for="(run, runIndex) in getInlineTextRuns(getElementLabel(element))"
                              :key="`${element.id}-signature-${runIndex}`"
                              :font-weight="getRunFontWeight(run)"
                              :font-style="run.italic ? 'italic' : undefined"
                              :text-decoration="run.underlined ? 'underline' : undefined"
                        >
                              {{ run.text }}
                            </tspan>
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
                              'placeholder',
                            'date',
                            'pageNumber',
                            'footer',
                          ].includes(element.type)
                        "
                        :x="getAlignedTextX(element)"
                          :y="element.y + Number(element.fontSize || 18)"
                        :text-anchor="getTextAnchor(element)"
                        :font-size="element.fontSize || 18"
                        :fill="element.color || '#111111'"
                        :font-weight="element.fontWeight || 400"
                          :font-family="element.fontFamily || 'Arial, sans-serif'"
                          :font-style="element.italic ? 'italic' : undefined"
                          :text-decoration="element.underline ? 'underline' : undefined"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                          style="cursor: pointer"
                      >
                        <tspan
                          v-for="(line, index) in getWrappedTextLines(element)"
                          :key="`${element.id}-${index}`"
                          :x="getAlignedTextX(element)"
                            :dy="
                              index === 0
                                ? 0
                                : getTextLineHeight(element.fontSize, element.lineSpacing)
                            "
                            :style="
                              element.align === 'justify' &&
                              index < getWrappedTextLines(element).length - 1
                                ? { wordSpacing: `${getJustifiedWordSpacing(line, element)}px` }
                                : undefined
                            "
                        >
                            <tspan
                              v-for="(run, runIndex) in line.runs"
                              :key="`${element.id}-${index}-${runIndex}`"
                              :font-weight="getRunFontWeight(run)"
                              :font-style="run.italic ? 'italic' : undefined"
                              :text-decoration="run.underlined ? 'underline' : undefined"
                            >
                              {{ run.text }}
                            </tspan>
                        </tspan>
                      </text>

                      <text
                        v-else
                        :x="getAlignedTextX(element)"
                          :y="element.y + Number(element.fontSize || 18)"
                        :text-anchor="getTextAnchor(element)"
                        :font-size="element.fontSize || 18"
                        :fill="element.color || '#111111'"
                        :font-weight="element.fontWeight || 400"
                          :font-family="element.fontFamily || 'Arial, sans-serif'"
                          :font-style="element.italic ? 'italic' : undefined"
                          :text-decoration="element.underline ? 'underline' : undefined"
                        @click="selectElement(element)"
                        @contextmenu.prevent="openContextMenu($event, element)"
                        @pointerdown="startDrag($event, element)"
                          style="cursor: pointer"
                      >
                          <tspan
                            v-for="(run, runIndex) in getInlineTextRuns(getElementLabel(element))"
                            :key="`${element.id}-label-${runIndex}`"
                            :font-weight="getRunFontWeight(run)"
                            :font-style="run.italic ? 'italic' : undefined"
                            :text-decoration="run.underlined ? 'underline' : undefined"
                          >
                            {{ run.text }}
                          </tspan>
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
                        <g
                          v-if="!element.locked"
                          :transform="`translate(${Number(element.x || 0) + Number(element.width || 0) / 2} ${Number(element.y || 0) >= 28 ? Number(element.y || 0) - 17 : Number(element.y || 0) + 17})`"
                          pointer-events="all"
                          style="cursor: move"
                          @pointerdown.stop="startElementMoveDrag($event, element)"
                        >
                          <circle r="10" fill="#ffffff" stroke="#2563eb" stroke-width="1.5" />
                          <path
                            d="M0-6v12m0-12-2.5 2.5M0-6l2.5 2.5M0 6l-2.5-2.5M0 6l2.5-2.5M-6 0h12m-12 0 2.5-2.5M-6 0l2.5 2.5M6 0 3.5-2.5M6 0 3.5 2.5"
                            fill="none"
                            stroke="#2563eb"
                            stroke-width="1.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            pointer-events="none"
                          />
                        </g>
                        <template v-if="!element.locked">
                          <rect
                            v-for="handle in resizeHandles"
                            :key="`${element.id}-resize-${handle.position}`"
                            :x="getResizeHandlePosition(element, handle.position).x - 4"
                            :y="getResizeHandlePosition(element, handle.position).y - 4"
                            width="8"
                            height="8"
                            rx="1"
                            fill="#ffffff"
                            stroke="#2563eb"
                            stroke-width="1.5"
                            :style="{ cursor: handle.cursor }"
                            pointer-events="all"
                            @pointerdown.stop="startElementResize($event, element, handle.position)"
                          />
                        </template>
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
                      :prepend-icon="
                        contextMenu.element?.locked ? 'mdi-lock-open-outline' : 'mdi-lock-outline'
                      "
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
              <div class="d-flex align-center mb-4">
                <v-btn
                  icon="mdi-chevron-left"
                  variant="text"
                  size="small"
                  aria-label="Ir a Propiedades"
                  :disabled="sidebarTab === 'properties'"
                  @click="navigateSidebar(-1)"
                />
                <v-tabs
                  v-model="sidebarTab"
                  class="flex-grow-1 sidebar-section-tabs"
                  :show-arrows="false"
                >
                  <v-tab value="properties" prepend-icon="mdi-tune-variant">Propiedades</v-tab>
                  <v-tab value="parameters" prepend-icon="mdi-variable">Parámetros</v-tab>
                </v-tabs>
                <v-btn
                  icon="mdi-chevron-right"
                  variant="text"
                  size="small"
                  aria-label="Ir a Parámetros"
                  :disabled="sidebarTab === 'parameters'"
                  @click="navigateSidebar(1)"
                />
              </div>

              <v-window v-model="sidebarTab" class="sidebar-tab-content">
                <v-window-item value="properties">
                  <div class="sidebar-content-scroll">
                  <div
                    class="properties-section-header d-flex align-center justify-space-between mb-3"
                  >
                    <h4>
                      {{
                        selectedElement
                          ? `Propiedades: ${getElementTypeLabel(selectedElement)}`
                          : 'Propiedades de página'
                      }}
                    </h4>
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
                    <v-textarea
                      v-if="
                        !['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)
                      "
                v-model="selectedElement.text"
                label="Texto / etiqueta"
                density="comfortable"
                      auto-grow
                      rows="2"
                      @update:model-value="handleTextInput"
                      @change="handleTextLayoutChange"
              />
                    <div
                      v-if="TEXT_MARKUP_TYPES.includes(selectedElement.type)"
                      class="text-caption text-medium-emphasis mb-2"
                    >
                      Usa <code>&lt;bold&gt;</code>, <code>&lt;semibold&gt;</code>,
                      <code>&lt;italic&gt;</code> y <code>&lt;underlined&gt;</code> para dar formato
                      a fragmentos.
                    </div>
                    <div
                      v-if="
                        !['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)
                      "
                      class="d-flex flex-column ga-1 mb-3"
                    >
                      <v-btn
                        size="small"
                        variant="tonal"
                        prepend-icon="mdi-variable"
                        @click="insertGeneratedPlaceholder"
                      >
                        Insertar placeholder
                      </v-btn>
                      <div v-if="selectedPlaceholderError" class="text-caption text-error">
                        {{ selectedPlaceholderError }}
                      </div>
                      <div v-else class="text-caption text-medium-emphasis">
                        Puedes escribir <code v-pre>{{ clave }}</code> o insertar una clave única.
                      </div>
                    </div>
                    <v-radio-group
                      v-if="selectedElement.type === 'image'"
                      v-model="selectedElement.imageMode"
                      label="Origen de imagen"
                      inline
                      density="comfortable"
                      hide-details
                      class="mb-3"
                      @update:model-value="setImageMode"
                    >
                      <v-radio label="Dinámica" value="dynamic" />
                      <v-radio label="Estática" value="static" />
                    </v-radio-group>
                    <div
                      v-if="
                        selectedElement.type === 'image' && selectedElement.imageMode === 'static'
                      "
                      class="mb-3"
                    >
                      <div class="text-body-2 mb-2">
                        {{ selectedImageResource?.name || 'Selecciona una imagen de Recursos' }}
                      </div>
                      <v-btn
                        size="small"
                        variant="tonal"
                        prepend-icon="mdi-image-multiple-outline"
                        @click="elementSidebarTab = 'resources'"
                      >
                        Elegir recurso
                      </v-btn>
                    </div>
              <v-text-field
                      v-if="
                        selectedElement.type === 'placeholder' ||
                        (selectedElement.type === 'image' && selectedElement.imageMode !== 'static')
                      "
                v-model="selectedElement.src"
                label="URL / origen"
                      :hint="
                        selectedElement.type === 'image'
                          ? 'En modo dinámico se usa una URL o un dato de imagen enviado al generar.'
                          : undefined
                      "
                      :persistent-hint="selectedElement.type === 'image'"
                density="comfortable"
                      @change="handleImageSourceChange"
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
                  selectedElement.type === 'checkbox'
                "
                v-model="selectedElement.placeholderKey"
                label="Clave del dato"
                :hint="
                  selectedElement.type === 'checkbox'
                    ? 'Clave del valor booleano que determina si la casilla aparece marcada. El texto/etiqueta es independiente.'
                    : 'Clave del valor insertado en este campo dinámico.'
                "
                persistent-hint
                density="comfortable"
                @change="handlePlaceholderKeyChange"
              />

              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.x"
                    label="X"
                    type="number"
                    min="0"
                          :disabled="selectedElement.locked"
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
                          :disabled="selectedElement.locked"
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
                          @change="commitSelectedElementWidth"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="selectedElement.height"
                    label="Alto"
                    type="number"
                          :min="['line', 'separator'].includes(selectedElement.type) ? 0 : 1"
                    :max="height"
                    suffix="px"
                    density="comfortable"
                          @change="commitSelectedElementHeight"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                          v-if="
                            !['rect', 'line', 'separator', 'image', 'qr'].includes(
                              selectedElement.type
                            )
                          "
                  v-model.number="selectedElement.fontSize"
                    label="Tamaño"
                    type="number"
                    suffix="px"
                    density="comfortable"
                          @change="handleTextLayoutChange"
                        />
                      </v-col>
                      <v-col v-if="TEXT_LAYOUT_TYPES.includes(selectedElement.type)" cols="6">
                        <v-text-field
                          v-model.number="selectedElement.lineSpacing"
                          label="Interlineado"
                          type="number"
                          :min="selectedElement.fontSize || 1"
                          suffix="px"
                          density="comfortable"
                          @change="handleTextLayoutChange"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                          v-if="
                            !['rect', 'line', 'separator', 'image', 'qr'].includes(
                              selectedElement.type
                            )
                          "
                    v-model="selectedElement.color"
                    label="Color"
                    type="color"
                    density="comfortable"
                    @change="markDirty"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-3" />

                    <v-checkbox
                      v-if="
                        [
                          'text',
                          'title',
                          'subtitle',
                          'paragraph',
                          'list',
                          'placeholder',
                          'date',
                          'pageNumber',
                          'footer',
                        ].includes(selectedElement.type)
                      "
                      :model-value="selectedElement.autoHeight !== false"
                      label="Expandir altura automáticamente"
                      density="comfortable"
                      hide-details
                      @update:model-value="setTextAutoHeight"
                    />
                    <div
                      v-if="
                        [
                          'text',
                          'title',
                          'subtitle',
                          'paragraph',
                          'list',
                          'placeholder',
                          'date',
                          'pageNumber',
                          'footer',
                        ].includes(selectedElement.type)
                      "
                      class="text-caption text-medium-emphasis mb-3"
                    >
                      El ajuste respeta el ancho, la fuente y los saltos de línea. Puedes cambiar el
                      alto manualmente para desactivarlo.
                    </div>

              <v-select
                      v-if="
                        !['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)
                      "
                v-model="selectedElement.align"
                label="Alineación"
                      :items="[
                        { title: 'Izquierda', value: 'left' },
                        { title: 'Centro', value: 'center' },
                        { title: 'Derecha', value: 'right' },
                        { title: 'Justificada', value: 'justify' },
                      ]"
                density="comfortable"
                @change="markDirty"
              />
              <v-select
                      v-if="
                        !['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)
                      "
                      v-model="selectedElement.fontFamily"
                      label="Tipo de fuente"
                      :items="[
                        { title: 'Arial', value: 'Arial' },
                        { title: 'Times New Roman', value: 'Times New Roman' },
                        { title: 'Courier New', value: 'Courier New' },
                        { title: 'Roboto', value: 'Roboto' },
                        { title: 'Lato', value: 'Lato' },
                        { title: 'Montserrat', value: 'Montserrat' },
                        { title: 'Open Sans', value: 'Open Sans' },
                      ]"
                      density="comfortable"
                      @update:model-value="handleTextLayoutChange"
                    />
                    <div
                      v-if="
                        !['rect', 'line', 'separator', 'image', 'qr'].includes(selectedElement.type)
                      "
                      class="text-caption text-medium-emphasis mb-3"
                    >
                      Roboto, Lato, Montserrat y Open Sans se incrustan en el PDF. Las fuentes
                      estándar se asignan a sus equivalentes PDF.
                    </div>
                    <v-select
                      v-if="TEXT_STYLE_TYPES.includes(selectedElement.type)"
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
                      @update:model-value="handleTextLayoutChange"
                    />
                    <v-checkbox
                      v-if="TEXT_STYLE_TYPES.includes(selectedElement.type)"
                      v-model="selectedElement.italic"
                      label="Cursiva"
                      density="comfortable"
                      hide-details
                      @update:model-value="handleTextLayoutChange"
                    />
                    <v-checkbox
                      v-if="TEXT_STYLE_TYPES.includes(selectedElement.type)"
                      v-model="selectedElement.underline"
                      label="Subrayado"
                      density="comfortable"
                      hide-details
                      @update:model-value="handleTextLayoutChange"
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
                      v-if="
                        ['rect', 'line', 'separator', 'checkbox', 'signature', 'table'].includes(
                          selectedElement.type
                        )
                      "
                v-model="selectedElement.stroke"
                label="Color de borde"
                type="color"
                density="comfortable"
                @change="markDirty"
              />
              <v-text-field
                      v-if="
                        ['rect', 'line', 'separator', 'checkbox', 'signature', 'table'].includes(
                          selectedElement.type
                        )
                      "
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
                label="Nombre de clave"
                hint="Identificador del dato usado como {{clave}} o enviado en los datos de generación."
                persistent-hint
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
                      <v-col
                        v-for="side in ['top', 'right', 'bottom', 'left']"
                        :key="side"
                        cols="6"
                      >
                  <v-text-field
                    v-model.number="template.page.margin[side]"
                          :label="
                            side === 'top'
                              ? 'Superior'
                              : side === 'right'
                                ? 'Derecho'
                                : side === 'bottom'
                                  ? 'Inferior'
                                  : 'Izquierdo'
                          "
                    type="number"
                    min="0"
                    suffix="px"
                    density="comfortable"
                          @change="commitPageSettings"
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
                  </template>
                  </div>
                </v-window-item>
                <v-window-item value="parameters">
                  <div class="sidebar-content-scroll">
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
                          @update:model-value="
                            (value) => setParameterAllowedValues(parameter, value)
                          "
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
                    <div class="text-caption text-medium-emphasis mt-3">
                      Los textos sin <code v-pre>{{ clave }}</code> son estáticos. Selecciona un
                      elemento y usa el icono de enlace para insertar un parámetro dinámico.
              </div>
              </div>
                  </div>
                </v-window-item>
              </v-window>
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

    <v-dialog v-model="templateLoading" persistent width="400">
      <v-card>
        <v-card-text class="pa-8 text-center">
          <v-progress-circular indeterminate color="primary" class="mb-4" />
          <div class="text-subtitle-1 font-weight-bold">Cargando plantilla...</div>
          <div class="text-caption text-medium-emphasis">Por favor espera</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  getTextContentHeight,
  getTextLineHeight,
  parseTextMarkup,
  wrapTextToWidth,
} from '../../helpers/docugen-app/textLayout.js';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-400-italic.css';
import '@fontsource/roboto/latin-600.css';
import '@fontsource/roboto/latin-600-italic.css';
import '@fontsource/roboto/latin-700.css';
import '@fontsource/roboto/latin-700-italic.css';
import '@fontsource/lato/latin-400.css';
import '@fontsource/lato/latin-400-italic.css';
import '@fontsource/lato/latin-700.css';
import '@fontsource/lato/latin-700-italic.css';
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-400-italic.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-600-italic.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-700-italic.css';
import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-400-italic.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-600-italic.css';
import '@fontsource/open-sans/latin-700.css';
import '@fontsource/open-sans/latin-700-italic.css';
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
  metadata: { dynamicParameters: [], resources: [] },
});

const template = ref(baseTemplate());
const templateLoaded = ref(false);
const templateLoading = ref(true);
const templateLoadError = ref('');
const selectedElement = ref(null);
const sidebarTab = ref('properties');
const elementSidebarTab = ref('elements');
const pendingDropPosition = ref(null);
const imageResourceInput = ref(null);
const imageResourceError = ref('');
const dragState = ref(null);
const resizeHandles = [
  { position: 'nw', cursor: 'nwse-resize' },
  { position: 'n', cursor: 'ns-resize' },
  { position: 'ne', cursor: 'nesw-resize' },
  { position: 'e', cursor: 'ew-resize' },
  { position: 'se', cursor: 'nwse-resize' },
  { position: 's', cursor: 'ns-resize' },
  { position: 'sw', cursor: 'nesw-resize' },
  { position: 'w', cursor: 'ew-resize' },
];
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
const MAX_IMAGE_RESOURCE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_RESOURCES_BYTES = 6 * 1024 * 1024;

const imageResources = computed(() =>
  Array.isArray(template.value.metadata?.resources) ? template.value.metadata.resources : []
);
const selectedImageResource = computed(() =>
  imageResources.value.find((resource) => resource.id === selectedElement.value?.resourceId)
);

const navigateSidebar = (direction) => {
  sidebarTab.value = direction < 0 ? 'properties' : 'parameters';
};

const navigateElementSidebar = (direction) => {
  elementSidebarTab.value = direction < 0 ? 'elements' : 'resources';
};

function getPlaceholderValidationError(elements = template.value.elements) {
  const metadataKeys = new Set();
  for (const parameter of template.value.metadata.dynamicParameters || []) {
    const key = String(parameter?.key || '').trim();
    if (!key) continue;
    if (!/^[A-Za-z0-9_.-]+$/.test(key) || key === 'page_number') {
      return `La clave de parámetro "${key}" no es válida o está reservada.`;
    }
    if (metadataKeys.has(key)) return `El placeholder "${key}" está definido más de una vez.`;
    metadataKeys.add(key);
  }

  for (const element of elements) {
    const explicitKey = String(element.placeholderKey || '').trim();
    if (explicitKey) {
      if (!/^[A-Za-z0-9_.-]+$/.test(explicitKey)) {
        return `La clave "${explicitKey}" tiene un identificador inválido.`;
      }
      if (explicitKey === 'page_number' && element.type !== 'pageNumber') {
        return 'El identificador "page_number" está reservado para la numeración de páginas.';
      }
    }

    const fields = ['text', 'src', 'qrValue'];
    for (const field of fields) {
      const content = element[field];
      if (typeof content !== 'string') continue;

      const tokens = [...content.matchAll(/\{\{([^{}]*)\}\}/g)];
      for (const token of tokens) {
        const key = token[1].trim();
        if (!/^[A-Za-z0-9_.-]+$/.test(key)) {
          return `El placeholder "${token[0]}" tiene un identificador inválido. Usa letras, números, ".", "_" o "-".`;
        }
        if (key === 'page_number' && element.type !== 'pageNumber') {
          return 'El identificador "page_number" está reservado para la numeración de páginas.';
        }
      }

      const contentWithoutTokens = content.replace(/\{\{[^{}]*\}\}/g, '');
      if (contentWithoutTokens.includes('{{') || contentWithoutTokens.includes('}}')) {
        return 'Hay un placeholder incompleto. Debe tener el formato {{clave}}.';
      }
    }
  }

  return '';
}

function getRulerStep(zoomLevel) {
  const targetStep = 60 / zoomLevel;
  const magnitude = 10 ** Math.floor(Math.log10(targetStep));
  const normalized = targetStep / magnitude;
  const multiple = normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : 5;
  return multiple * magnitude;
}

function getVisibleRulerTicks(offset, zoomLevel, viewportLength) {
  const step = getRulerStep(zoomLevel);
  const firstValue = Math.floor((-rulerOrigin - offset) / (zoomLevel * step)) * step;
  const lastValue = Math.ceil((viewportLength - rulerOrigin - offset) / (zoomLevel * step)) * step;
  const count = Math.max(0, Math.min(500, Math.floor((lastValue - firstValue) / step) + 1));

  return Array.from({ length: count }, (_, index) => ({
    value: Number((firstValue + index * step).toFixed(6)),
  }));
}

const horizontalRulerTicks = computed(() =>
  getVisibleRulerTicks(panOffset.value.x, zoom.value, canvasShellSize.value.width)
);
const verticalRulerTicks = computed(() =>
  getVisibleRulerTicks(panOffset.value.y, zoom.value, canvasShellSize.value.height)
);
const hasUnsavedChanges = computed(() => serializeTemplate() !== savedSnapshot.value);
const selectedPlaceholderError = computed(() =>
  selectedElement.value ? getPlaceholderValidationError([selectedElement.value]) : ''
);
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
    { name: 'Oficio', width: 215.9, height: 330.2 },
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

const serializeHistoryState = () =>
  JSON.stringify({
    document: JSON.parse(serializeTemplate()),
    selectedElementId: selectedElement.value?.id || null,
    pageSelected: pageSelected.value,
  });

const applySnapshot = (snapshot) => {
  if (!snapshot) return;
  try {
    const parsedSnapshot = JSON.parse(snapshot);
    const nextState = parsedSnapshot.document || parsedSnapshot;
    template.value = {
      ...template.value,
      ...nextState,
      dimensions: nextState.dimensions || template.value.dimensions,
      elements: nextState.elements || [],
    };
    width.value = Number(template.value.dimensions.width || 794);
    height.value = Number(template.value.dimensions.height || 1123);
    template.value.elements.forEach(adjustTextElementHeight);
    const selectedId = parsedSnapshot.document
      ? parsedSnapshot.selectedElementId
      : selectedElement.value?.id;
    selectedElement.value = template.value.elements.find((item) => item.id === selectedId) || null;
    pageSelected.value = Boolean(parsedSnapshot.pageSelected) && !selectedElement.value;
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
  const nextKey = String(value || '')
    .trim()
    .replace(/\s+/g, '_');
  if (!/^[A-Za-z0-9_.-]+$/.test(nextKey) || nextKey === 'page_number') return;
  if (
    template.value.metadata.dynamicParameters.some(
      (item) => item !== parameter && item.key === nextKey
    )
  ) {
    return;
  }
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
  template.value.metadata.dynamicParameters = (
    template.value.metadata.dynamicParameters || []
  ).filter((parameter) => parameter.key !== key);
  syncDynamicParametersFromTemplate();
  pushHistory();
};

const buildDynamicKey = (type) => {
  const label = type === 'image' ? 'imagen' : type === 'qr' ? 'qr' : 'param';
  const existingKeys = new Set([
    ...template.value.elements.map((element) => element.placeholderKey),
    ...(template.value.metadata.dynamicParameters || []).map((parameter) => parameter.key),
  ]);
  template.value.elements.forEach((element) => {
    for (const value of [element.text, element.src, element.qrValue]) {
      if (typeof value !== 'string') continue;
      for (const match of value.matchAll(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g)) {
        existingKeys.add(match[1]);
      }
    }
  });
  let nextIndex = 1;
  while (existingKeys.has(`${label}${nextIndex}`)) nextIndex += 1;
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
  const key = buildDynamicKey('text');

  const next = [
    ...current,
    {
      key,
      label: key,
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

const inferParameterType = (element) => {
  if (element?.type === 'checkbox') return 'boolean';
  if (element?.type === 'date') return 'date';
  if (element?.type === 'image') return 'image';
  if (element?.type === 'qr') return 'qr';
  if (['paragraph', 'list', 'footer'].includes(element?.type)) return 'textarea';
  return 'text';
};

const inferPlaceholderType = (element, field) => {
  if (field === 'text' && element?.type === 'checkbox') return 'text';
  if (field === 'src' && element?.type === 'image') return 'image';
  if (field === 'qrValue' && element?.type === 'qr') return 'qr';
  return inferParameterType(element);
};

const syncDynamicParametersFromTemplate = () => {
  const source = Array.isArray(template.value?.metadata?.dynamicParameters)
    ? template.value.metadata.dynamicParameters
    : [];
  const map = new Map();
  const referencedKeys = new Set();

  template.value.elements.forEach((element) => {
    if (element.placeholderKey) referencedKeys.add(element.placeholderKey.trim());
    for (const field of ['text', 'src', 'qrValue']) {
      const matches = String(element[field] || '').match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g) || [];
      matches.forEach((match) => referencedKeys.add(match.replace(/[{}]/g, '').trim()));
    }
  });

  source.forEach((item) => {
    if (!item?.key) return;
    const key = item.key.trim().replace(/\s+/g, '_');
    if (!key || key === 'page_number') return;
    if (item.source === 'placeholder' && !referencedKeys.has(key)) return;
    map.set(key, {
      ...item,
      key,
      label: item.label || key,
      type: item.type || inferParameterType({ type: item.elementType }),
      required: Boolean(item.required),
    });
  });

  template.value.elements.forEach((element) => {
    if (element.type === 'pageNumber') return;

    const keyFromPlaceholder = (element.placeholderKey || '').trim().replace(/\s+/g, '_');
    if (element.type === 'image' && keyFromPlaceholder && map.has(keyFromPlaceholder)) {
      map.get(keyFromPlaceholder).type = 'image';
    }
    if (keyFromPlaceholder && !map.has(keyFromPlaceholder)) {
      map.set(keyFromPlaceholder, {
        key: keyFromPlaceholder,
        label: keyFromPlaceholder,
        type: inferParameterType(element),
        required: true,
        source: 'placeholder',
      });
    }

    for (const field of ['text', 'src', 'qrValue']) {
      const matches = String(element[field] || '').match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g) || [];
    matches.forEach((match) => {
      const key = match.replace(/[{}]/g, '').trim().replace(/\s+/g, '_');
        if (field === 'src' && element.type === 'image' && map.has(key)) {
          map.get(key).type = 'image';
          return;
        }
      if (!key || map.has(key)) return;
      map.set(key, {
        key,
        label: key,
          type: inferPlaceholderType(element, field),
        required: true,
          source: 'placeholder',
      });
    });
    }
  });

  const next = [...map.values()].sort((a, b) => String(a.key).localeCompare(String(b.key)));
  template.value.metadata = {
    ...(template.value.metadata || {}),
    dynamicParameters: next,
  };
};

const pushHistory = () => {
  const snapshot = serializeHistoryState();
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
  const baseText = String(element?.text || getElementLabel(element) || '');
  const fontSize = Number(element?.fontSize || 16);
  const maxWidth = Math.max(1, Number(element?.width || 180));
  const measureText = (text, run = {}) => {
    if (typeof document !== 'undefined' && !textMeasureContext) {
      textMeasureContext = document.createElement('canvas').getContext('2d');
    }
    if (!textMeasureContext) return Array.from(text).length * fontSize * 0.55;
    const configuredWeight = Number(element.fontWeight);
    const baseWeight = Number.isFinite(configuredWeight) ? configuredWeight : 400;
    const weight = run.bold ? 700 : run.semibold ? 600 : baseWeight;
    const fontStyle = run.italic || element.italic ? 'italic ' : '';
    textMeasureContext.font = `${fontStyle}${weight} ${fontSize}px "${element.fontFamily || 'Arial'}"`;
    return textMeasureContext.measureText(text).width;
  };
  const lines = wrapTextToWidth(baseText, maxWidth, measureText);
  if (element.autoHeight !== false) return lines;

  const maxLines = Math.max(
    1,
    Math.floor(Number(element?.height || 1) / getTextLineHeight(fontSize, element.lineSpacing))
  );
  const fitted = lines.slice(0, maxLines);
  return fitted.length ? fitted : [''];
};

let textMeasureContext;
const TEXT_LAYOUT_TYPES = [
  'text',
  'title',
  'subtitle',
  'paragraph',
  'list',
  'placeholder',
  'date',
  'pageNumber',
  'footer',
];
const TEXT_STYLE_TYPES = [...TEXT_LAYOUT_TYPES, 'checkbox', 'signature', 'table'];
const TEXT_MARKUP_TYPES = TEXT_STYLE_TYPES;
const getInlineTextRuns = (value) => parseTextMarkup(value);
const getRunFontWeight = (run) => (run.bold ? 700 : run.semibold ? 600 : undefined);

const adjustTextElementHeight = (element) => {
  if (!element || !TEXT_LAYOUT_TYPES.includes(element.type) || element.autoHeight === false) return;
  const lineCount = getWrappedTextLines(element).length;
  const requiredHeight = getTextContentHeight(
    lineCount,
    element.fontSize || 16,
    element.lineSpacing
  );
  const availableHeight = Math.max(1, height.value - Number(element.y || 0));
  element.height = Math.max(Number(element.height || 1), Math.min(requiredHeight, availableHeight));
};

const getJustifiedWordSpacing = (line, element) => {
  const spaces = (line.text.match(/\s/g) || []).length;
  if (!spaces || typeof document === 'undefined') return 0;

  if (!textMeasureContext) {
    textMeasureContext = document.createElement('canvas').getContext('2d');
    }
  if (!textMeasureContext) return 0;

  const configuredWeight = Number(element.fontWeight);
  const baseWeight = Number.isFinite(configuredWeight) ? configuredWeight : 400;
  const lineWidth = line.runs.reduce((width, run) => {
    const weight = run.bold ? 700 : run.semibold ? 600 : baseWeight;
    const fontStyle = run.italic || element.italic ? 'italic ' : '';
    textMeasureContext.font = `${fontStyle}${weight} ${Number(element.fontSize || 18)}px "${element.fontFamily || 'Arial'}"`;
    return width + textMeasureContext.measureText(run.text).width;
  }, 0);
  const remainingWidth = Number(element.width || 0) - lineWidth;
  return Math.max(0, remainingWidth / spaces);
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
  if (templateLoaded.value && hasUnsavedChanges.value && !(await saveTemplate())) return;
  router.push('/dashboard/templates');
};

const loadTemplate = async () => {
  if (!templateId.value) {
    templateLoadError.value = 'No se encontró el identificador de la plantilla.';
    templateLoading.value = false;
    return;
  }

  try {
    const item = await getTemplate(templateId.value, { includeContent: true });
    if (!item?._id) throw new Error('La plantilla no existe o no tienes permisos.');
    const normalizedItem = item && typeof item === 'object' ? item : {};

    template.value = {
      ...baseTemplate(),
      ...normalizedItem,
      dimensions: normalizedItem.dimensions || { width: 794, height: 1123, unit: 'px' },
      page: {
        backgroundColor: normalizedItem.page?.backgroundColor || '#ffffff',
        margin: {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40,
          ...(normalizedItem.page?.margin || {}),
        },
      },
      canvas: normalizedItem.canvas || { version: 1, zoom: 1, background: '#ffffff' },
      elements: Array.isArray(normalizedItem.elements) ? normalizedItem.elements : [],
      metadata: {
        ...(normalizedItem.metadata || {}),
        dynamicParameters: Array.isArray(normalizedItem.metadata?.dynamicParameters)
          ? normalizedItem.metadata.dynamicParameters
          : [],
        resources: Array.isArray(normalizedItem.metadata?.resources)
          ? normalizedItem.metadata.resources
          : [],
      },
    };

    template.value.elements.forEach((element) => {
      if (element.type === 'date') element.placeholderKey = '';
      if (element.type === 'image' && !element.imageMode) {
        element.imageMode =
          element.resourceId || String(element.src || '').startsWith('resource:')
            ? 'static'
            : 'dynamic';
        if (element.imageMode === 'static' && !element.resourceId) {
          element.resourceId = String(element.src || '').replace(/^resource:/, '');
        }
      }
      if (TEXT_LAYOUT_TYPES.includes(element.type) && element.autoHeight === undefined) {
        element.autoHeight = true;
      }
      if (TEXT_LAYOUT_TYPES.includes(element.type) && !Number(element.lineSpacing)) {
        element.lineSpacing = getTextLineHeight(element.fontSize);
      }
    });
    syncDynamicParametersFromTemplate();

    width.value = Number(template.value.dimensions.width || 794);
    height.value = Number(template.value.dimensions.height || 1123);
    await nextTick();
    if (document.fonts?.ready) await document.fonts.ready;
    template.value.elements.forEach(adjustTextElementHeight);
    selectedElement.value = template.value.elements[0] || null;
    pageSelected.value = false;
    history.value = [serializeHistoryState()];
    future.value = [];
    savedSnapshot.value = serializeTemplate();
    templateLoaded.value = true;
  } catch (error) {
    console.error('No se pudo cargar la plantilla:', error);
    templateLoadError.value =
      error.response?.data?.message || error.message || 'Error desconocido cargando plantilla.';
  } finally {
    templateLoading.value = false;
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
    ...(TEXT_LAYOUT_TYPES.includes(type) ? { autoHeight: true } : {}),
    fontSize: 16,
    color: '#111111',
    fill: '#ffffff',
    stroke: '#94a3b8',
    strokeWidth: 1,
    opacity: 1,
    checked: true,
    align: 'left',
    fontFamily: 'Arial',
    italic: false,
    underline: false,
    ...(type === 'image'
      ? {
          imageMode: 'dynamic',
          placeholderKey: generatedKey,
          resourceId: '',
          src: `{{${generatedKey}}}`,
        }
      : {}),
    ...(type === 'qr' ? { placeholderKey: generatedKey, qrValue: `{{${generatedKey}}}` } : {}),
    ...extra,
  };
  if (TEXT_LAYOUT_TYPES.includes(type) && !Number(base.lineSpacing)) {
    base.lineSpacing = getTextLineHeight(base.fontSize);
  }

  template.value.elements.push(base);
  selectedElement.value = base;
  if (pendingDropPosition.value) {
    adjustTextElementHeight(base);
    base.x = pendingDropPosition.value.x - Number(base.width || 0) / 2;
    base.y = pendingDropPosition.value.y - Number(base.height || 0) / 2;
    constrainElementToPage(base);
  }
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
const addPlaceholder = () => {
  const key = buildDynamicKey('text');
  makeElement('text', {
    text: `{{${key}}}`,
    placeholderKey: key,
    x: 50,
    y: 330,
    width: 220,
    height: 30,
    fontSize: 16,
  });
};
const addImageElement = () => {
  const key = buildDynamicKey('image');
  makeElement('image', {
    imageMode: 'dynamic',
    placeholderKey: key,
    src: `{{${key}}}`,
    x: 50,
    y: 380,
    width: 180,
    height: 110,
  });
};

const setImageMode = (mode) => {
  if (selectedElement.value?.type !== 'image') return;

  if (mode === 'static') {
    selectedElement.value.imageMode = 'static';
    selectedElement.value.placeholderKey = '';
    selectedElement.value.resourceId = '';
    selectedElement.value.src = '';
  } else {
    const key = selectedElement.value.placeholderKey || buildDynamicKey('image');
    selectedElement.value.imageMode = 'dynamic';
    selectedElement.value.resourceId = '';
    selectedElement.value.placeholderKey = key;
    selectedElement.value.src = `{{${key}}}`;
  }
  syncDynamicParametersFromTemplate();
  pushHistory();
};

const handleImageSourceChange = () => {
  const element = selectedElement.value;
  if (!element) return;
  if (element.type === 'image' && element.imageMode !== 'static') {
    const placeholder = String(element.src || '').match(/^\s*\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}\s*$/);
    element.placeholderKey = placeholder?.[1] || '';
  }
  syncDynamicParametersFromTemplate();
  markDirty();
};

const formatResourceSize = (size) =>
  size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('No se pudo leer el archivo de imagen.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () =>
      reject(reader.error || new Error('No se pudo leer el archivo de imagen.'));
    reader.readAsDataURL(file);
  });

const handleImageResourceUpload = async (event) => {
  const file = event.target.files?.[0];
  imageResourceError.value = '';
  if (!file) return;

  const supportedTypes = ['image/png', 'image/jpeg'];
  if (!supportedTypes.includes(file.type)) {
    imageResourceError.value = 'Formato no compatible. Sube una imagen PNG o JPEG.';
    event.target.value = '';
    return;
  }
  if (file.size > MAX_IMAGE_RESOURCE_BYTES) {
    imageResourceError.value = 'La imagen supera el límite de 2 MB.';
    event.target.value = '';
    return;
  }
  const currentSize = imageResources.value.reduce(
    (total, resource) => total + Number(resource.size || 0),
    0
  );
  if (currentSize + file.size > MAX_IMAGE_RESOURCES_BYTES) {
    imageResourceError.value =
      'Los recursos de imagen de la plantilla no pueden superar 6 MB en total.';
    event.target.value = '';
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const id = `image-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    template.value.metadata.resources = [
      ...imageResources.value,
      { id, name: file.name.slice(0, 120), mimeType: file.type, size: file.size, dataUrl },
    ];
    imageResourceError.value = '';
    pushHistory();
  } catch (error) {
    imageResourceError.value = error.message || 'No se pudo cargar el recurso de imagen.';
  } finally {
    event.target.value = '';
  }
};

const useImageResource = (resource) => {
  if (selectedElement.value?.type !== 'image') {
    makeElement('image', {
      imageMode: 'static',
      placeholderKey: '',
      resourceId: resource.id,
      src: `resource:${resource.id}`,
      x: 50,
      y: 80,
      width: 180,
      height: 110,
    });
    return;
  }

  selectedElement.value.imageMode = 'static';
  selectedElement.value.placeholderKey = '';
  selectedElement.value.resourceId = resource.id;
  selectedElement.value.src = `resource:${resource.id}`;
  syncDynamicParametersFromTemplate();
  pushHistory();
};

const removeImageResource = (resource) => {
  const isInUse = template.value.elements.some(
    (element) => element.type === 'image' && element.resourceId === resource.id
  );
  if (isInUse) {
    imageResourceError.value = `No se puede eliminar "${resource.name}" mientras esté asignada a un elemento imagen.`;
    return;
  }
  template.value.metadata.resources = imageResources.value.filter(
    (item) => item.id !== resource.id
  );
  imageResourceError.value = '';
  pushHistory();
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
    x: 50,
    y: 640,
    width: 180,
    height: 24,
    fontSize: 14,
  });
const getDefaultFooterLayout = () => {
  const pageWidth = Number(template.value.dimensions.width || width.value);
  const pageHeight = Number(template.value.dimensions.height || height.value);
  const margin = template.value.page?.margin || {};
  const left = Number(margin.left ?? 40);
  const right = Number(margin.right ?? 40);
  const bottom = Number(margin.bottom ?? 40);
  const contentWidth = Math.max(1, pageWidth - left - right);
  const pageNumberWidth = Math.min(100, contentWidth * 0.3);
  const gap = Math.min(12, contentWidth * 0.05);
  const y = Math.max(0, pageHeight - bottom - 36);

  return {
    footer: {
      x: left,
      y,
      width: Math.max(1, contentWidth - pageNumberWidth - gap),
    },
    pageNumber: {
      x: left + contentWidth - pageNumberWidth,
      y,
      width: pageNumberWidth,
    },
  };
};
const addFooterElement = () =>
  makeElement('footer', {
    text: 'Documento generado por Docugen • {{fecha}}',
    ...getDefaultFooterLayout().footer,
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
    ...getDefaultFooterLayout().pageNumber,
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
    const token = `{{${key}}}`;
    const currentText = selectedElement.value.text || '';
    if (!currentText.includes(token)) {
      selectedElement.value.text = currentText ? `${currentText} ${token}` : token;
    }
  }

  if (selectedElement.value.type === 'placeholder') {
    selectedElement.value.placeholderKey = key;
    selectedElement.value.text = `{{${key}}}`;
  }

  if (selectedElement.value.type === 'checkbox') {
    selectedElement.value.placeholderKey = key;
    if (parameter) parameter.type = 'boolean';
  }

  if (selectedElement.value.type === 'date') {
    selectedElement.value.text = `{{${key}}}`;
    if (parameter) parameter.type = 'date';
  }

  if (selectedElement.value.type === 'image') {
    selectedElement.value.placeholderKey = key;
    selectedElement.value.src = `{{${key}}}`;
    if (parameter) parameter.type = 'image';
  }

  if (selectedElement.value.type === 'qr') {
    selectedElement.value.placeholderKey = key;
    selectedElement.value.qrValue = `{{${key}}}`;
  }

  if (parameter) parameter.type = inferParameterType(selectedElement.value);
  syncDynamicParametersFromTemplate();
  pushHistory();
};

const handleTextInput = () => {
  if (selectedElement.value) adjustTextElementHeight(selectedElement.value);
  syncDynamicParametersFromTemplate();
};

const handlePlaceholderKeyChange = () => {
  syncDynamicParametersFromTemplate();
  markDirty();
};

const handleTextLayoutChange = () => {
  if (selectedElement.value) adjustTextElementHeight(selectedElement.value);
  markDirty();
};

const setTextAutoHeight = (enabled) => {
  if (!selectedElement.value) return;
  selectedElement.value.autoHeight = Boolean(enabled);
  if (enabled) adjustTextElementHeight(selectedElement.value);
  markDirty();
};

const insertGeneratedPlaceholder = () => {
  if (!selectedElement.value) return;
  const key = buildDynamicKey('text');
  const token = `{{${key}}}`;
  const currentText = String(selectedElement.value.text || '');
  selectedElement.value.text = currentText
    ? `${currentText}${/\s$/.test(currentText) ? '' : ' '}${token}`
    : token;
  adjustTextElementHeight(selectedElement.value);
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
  const allowsZeroHeight = ['line', 'separator'].includes(element.type);
  element.height = allowsZeroHeight
    ? Math.max(0, Math.min(Number(element.height) || 0, pageHeight))
    : Math.max(1, Math.min(Number(element.height) || 1, pageHeight));

  const rotation = Number(element.rotation);
  const radians = ((Number.isFinite(rotation) ? rotation : 0) * Math.PI) / 180;
  const getRotatedBounds = () => ({
    width:
      Math.abs(element.width * Math.cos(radians)) + Math.abs(element.height * Math.sin(radians)),
    height:
      Math.abs(element.width * Math.sin(radians)) + Math.abs(element.height * Math.cos(radians)),
  });
  let rotatedBounds = getRotatedBounds();
  if (rotatedBounds.width > pageWidth || rotatedBounds.height > pageHeight) {
    const scale = Math.min(pageWidth / rotatedBounds.width, pageHeight / rotatedBounds.height);
    element.width = Math.max(1, element.width * scale);
    element.height = allowsZeroHeight
      ? element.height * scale
      : Math.max(1, element.height * scale);
    rotatedBounds = getRotatedBounds();
  }
  const x = Number(element.x);
  const y = Number(element.y);
  const centerX = (Number.isFinite(x) ? x : 0) + element.width / 2;
  const centerY = (Number.isFinite(y) ? y : 0) + element.height / 2;
  const boundedCenterX = Math.max(
    rotatedBounds.width / 2,
    Math.min(centerX, pageWidth - rotatedBounds.width / 2)
  );
  const boundedCenterY = Math.max(
    rotatedBounds.height / 2,
    Math.min(centerY, pageHeight - rotatedBounds.height / 2)
  );
  element.x = Math.max(0, boundedCenterX - element.width / 2);
  element.y = Math.max(0, boundedCenterY - element.height / 2);
};

const commitSelectedElementGeometry = () => {
  if (!selectedElement.value) return;
  constrainElementToPage(selectedElement.value);
  markDirty();
};

const commitSelectedElementWidth = () => {
  if (!selectedElement.value) return;
  constrainElementToPage(selectedElement.value);
  adjustTextElementHeight(selectedElement.value);
  markDirty();
};

const commitSelectedElementHeight = () => {
  if (!selectedElement.value) return;
  selectedElement.value.autoHeight = false;
  constrainElementToPage(selectedElement.value);
  markDirty();
};

const commitPageDimensions = () => {
  template.value.dimensions.width = Math.round(
    Math.max(100, Math.min(5000, Number(template.value.dimensions.width) || 794))
  );
  template.value.dimensions.height = Math.round(
    Math.max(100, Math.min(5000, Number(template.value.dimensions.height) || 1123))
  );
  commitPageSettings(false);
  template.value.elements.forEach((element) => {
    constrainElementToPage(element);
    adjustTextElementHeight(element);
  });
  markDirty();
};

const commitPageSettings = (recordHistory = true) => {
  const margin = template.value.page.margin;
  for (const side of ['top', 'right', 'bottom', 'left']) {
    margin[side] = Math.max(0, Math.floor(Number(margin[side]) || 0));
  }
  margin.left = Math.min(margin.left, template.value.dimensions.width - 1);
  margin.right = Math.min(margin.right, template.value.dimensions.width - margin.left - 1);
  margin.top = Math.min(margin.top, template.value.dimensions.height - 1);
  margin.bottom = Math.min(margin.bottom, template.value.dimensions.height - margin.top - 1);
  if (recordHistory) markDirty();
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

const startElementToolDrag = (event, type) => {
  if (!event.dataTransfer) return;
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/x-docugen-element', type);

  const sourceIcon = event.currentTarget.querySelector('.v-icon');
  if (!sourceIcon) return;

  const dragImage = document.createElement('div');
  const icon = sourceIcon.cloneNode(true);
  const iconColor = getComputedStyle(sourceIcon).color;

  dragImage.setAttribute('aria-hidden', 'true');
  Object.assign(dragImage.style, {
    position: 'fixed',
    left: `${event.clientX}px`,
    top: `${event.clientY}px`,
    width: '56px',
    height: '56px',
    display: 'grid',
    placeItems: 'center',
    color: iconColor,
    background: '#fff',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.18)',
    pointerEvents: 'none',
    zIndex: '9999',
  });
  Object.assign(icon.style, { fontSize: '32px', width: '32px', height: '32px' });
  dragImage.appendChild(icon);
  document.body.appendChild(dragImage);
  event.dataTransfer.setDragImage(dragImage, 28, 28);
  setTimeout(() => dragImage.remove(), 0);
};

const dropElementTool = (event) => {
  const type = event.dataTransfer?.getData('application/x-docugen-element');
  const svg = svgRef.value;
  if (!type || !svg) return;

  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const addElement = {
    text: addTextElement,
    title: addTitleElement,
    subtitle: addSubtitleElement,
    paragraph: addParagraphElement,
    list: addListElement,
    placeholder: addPlaceholder,
    image: addImageElement,
    qr: addQrElement,
    date: addDateElement,
    footer: addFooterElement,
    signature: addSignatureElement,
    line: addLineElement,
    rect: addRectElement,
    table: addTableElement,
    checkbox: addCheckboxElement,
    pageNumber: addPageNumberElement,
  }[type];
  if (!addElement) return;

  pendingDropPosition.value = {
    x: ((event.clientX - rect.left) / rect.width) * width.value,
    y: ((event.clientY - rect.top) / rect.height) * height.value,
  };
  try {
    addElement();
  } finally {
    pendingDropPosition.value = null;
  }
};

const startDrag = (event, element) => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  selectElement(element);
  if (element.locked) return;

  const svg = svgRef.value;
  if (!svg) return;
  svg.setPointerCapture?.(event.pointerId);

  const rect = svg.getBoundingClientRect();
  const x = Math.max(
    0,
    Math.min(((event.clientX - rect.left) / rect.width) * width.value, width.value)
  );
  const y = Math.max(
    0,
    Math.min(((event.clientY - rect.top) / rect.height) * height.value, height.value)
  );

  dragState.value = {
    mode: 'move',
    id: element.id,
    offsetX: x - element.x,
    offsetY: y - element.y,
  };

  pushHistory();
};

const getResizeHandlePosition = (element, position) => {
  const x = Number(element.x || 0) - 4;
  const y = Number(element.y || 0) - 4;
  const elementWidth = Math.max(Number(element.width || 0), 8) + 8;
  const elementHeight = Math.max(Number(element.height || 0), 8) + 8;
  const positions = {
    nw: { x, y },
    n: { x: x + elementWidth / 2, y },
    ne: { x: x + elementWidth, y },
    e: { x: x + elementWidth, y: y + elementHeight / 2 },
    se: { x: x + elementWidth, y: y + elementHeight },
    s: { x: x + elementWidth / 2, y: y + elementHeight },
    sw: { x, y: y + elementHeight },
    w: { x, y: y + elementHeight / 2 },
  };
  return positions[position] || positions.se;
};

const startElementMoveDrag = (event, element) => {
  startDrag(event, element);
};

const startElementResize = (event, element, handle) => {
  if (event.button !== 0 || element.locked) return;
  event.preventDefault();
  event.stopPropagation();
  selectElement(element);

  const svg = svgRef.value;
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  svg.setPointerCapture?.(event.pointerId);

  dragState.value = {
    mode: 'resize',
    id: element.id,
    handle,
    startX: ((event.clientX - rect.left) / rect.width) * width.value,
    startY: ((event.clientY - rect.top) / rect.height) * height.value,
    x: Number(element.x || 0),
    y: Number(element.y || 0),
    width: Number(element.width || 0),
    height: Number(element.height || 0),
    rotation: Number(element.rotation || 0),
  };
  pushHistory();
  if (TEXT_LAYOUT_TYPES.includes(element.type)) element.autoHeight = false;
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

  if (dragState.value.mode === 'resize') {
    const drag = dragState.value;
    const pageDeltaX = x - drag.startX;
    const pageDeltaY = y - drag.startY;
    const radians = (drag.rotation * Math.PI) / 180;
    const deltaX = pageDeltaX * Math.cos(radians) + pageDeltaY * Math.sin(radians);
    const deltaY = -pageDeltaX * Math.sin(radians) + pageDeltaY * Math.cos(radians);
    const minSize = 8;
    const resizeLeft = drag.handle.includes('w');
    const resizeRight = drag.handle.includes('e');
    const resizeTop = drag.handle.includes('n');
    const resizeBottom = drag.handle.includes('s');

    if (resizeLeft) {
      current.width = Math.max(minSize, drag.width - deltaX);
      current.x = drag.x + drag.width - current.width;
    } else if (resizeRight) {
      current.width = Math.max(minSize, drag.width + deltaX);
    }
    if (resizeTop) {
      current.height = Math.max(minSize, drag.height - deltaY);
      current.y = drag.y + drag.height - current.height;
    } else if (resizeBottom) {
      current.height = Math.max(minSize, drag.height + deltaY);
    }
    return;
  }

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
  const nextZoom = Math.max(0.25, Math.min(2, previousZoom * Math.exp(-event.deltaY * 0.0015)));
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
  if (hadElementDrag) {
    const element = template.value.elements.find((item) => item.id === dragState.value?.id);
    if (element) constrainElementToPage(element);
  }
  dragState.value = null;
  if (hadElementDrag) pushHistory();
};

const isImagePlaceholder = (element) => {
  return !getImageSource(element);
};

const getImageSource = (element) => {
  if (!element) return '';
  if (element.imageMode === 'static' || element.resourceId) {
    return (
      imageResources.value.find((resource) => resource.id === element.resourceId)?.dataUrl || ''
    );
  }
  const source = String(element.src || '');
  return source && !source.includes('{{') ? source : '';
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

const getElementTypeLabel = (element) => {
  const labels = {
    text: 'Texto',
    title: 'Título',
    subtitle: 'Subtítulo',
    paragraph: 'Párrafo',
    list: 'Lista',
    image: 'Imagen',
    placeholder: 'Placeholder',
    date: 'Fecha',
    pageNumber: 'Número de página',
    rect: 'Rectángulo',
    line: 'Línea',
    footer: 'Pie de página',
    qr: 'Código QR',
    signature: 'Firma',
    separator: 'Separador',
    table: 'Tabla',
    checkbox: 'Casilla',
  };
  return labels[element?.type] || 'Elemento';
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

const getTableRows = (element) =>
  String(element.text || '')
    .split('\n')
    .map((row) => row.split('|'));

const getTableColumnCount = (element) =>
  Math.max(1, ...getTableRows(element).map((row) => row.length));

const saveTemplate = async () => {
  if (!templateLoaded.value) return false;

  const placeholderError = getPlaceholderValidationError();
  if (placeholderError) {
    notificationStore.setNotification({
      message: placeholderError,
      code: 'W0003',
      mode: 'persistent',
    });
    return false;
  }

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
    history.value = [serializeHistoryState()];
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
  if (!templateLoaded.value) return;
  if (getPlaceholderValidationError()) {
    await saveTemplate();
    return;
  }
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
  if (!templateLoaded.value || !hasUnsavedChanges.value) return true;
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
.editor-root {
  width: 100%;
}

.editor-load-error {
  display: grid;
  min-height: 60vh;
  place-items: center;
  padding: 24px;
}

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

.editor-topbar :deep(.v-toolbar__prepend) {
  margin-inline-end: 0;
}

.editor-heading {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  align-items: center;
  gap: 18px;
  margin-left: clamp(32px, 12.5vw, 180px);
}

.editor-dirty-chip {
  flex: 0 0 auto;
  font-size: 0.75rem;
  font-weight: 500;
}

.editor-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
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
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
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

.properties-section-header h4 {
  margin: 0;
}

.sidebar-section-tabs :deep(.v-slide-group__prev),
.sidebar-section-tabs :deep(.v-slide-group__next) {
  display: none;
}

.sidebar-section-tabs :deep(.v-tab) {
  min-height: 40px;
  border-radius: 10px;
  color: rgb(var(--v-theme-on-surface-variant));
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.sidebar-section-tabs :deep(.v-tab--selected) {
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.12);
  font-weight: 600;
}

.sidebar-section-tabs :deep(.v-tab__slider) {
  display: none;
}

.sidebar-tab-content {
  flex: 1 1 auto;
  min-height: 0;
}

.sidebar-tab-content :deep(.v-window__container),
.sidebar-tab-content :deep(.v-window-item) {
  height: 100%;
  min-height: 0;
}

.sidebar-content-scroll {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 6px;
}

.resource-panel {
  max-height: none;
}

.resource-thumbnail {
  display: block;
  width: 100%;
  height: 120px;
  object-fit: contain;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
}

.toolbar-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 0 0 auto;
}

.toolbar-grid .v-btn {
  justify-content: flex-start;
  padding-inline: 12px;
  border-radius: 12px;
  min-height: 42px;
  font-weight: 600;
  cursor: grab;
}

.toolbar-grid .v-btn:active {
  cursor: grabbing;
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
  .editor-heading {
    gap: 10px;
  }

  .editor-actions {
    gap: 4px;
  }

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
    max-height: none;
  }

  .sidebar-tab-content {
    flex: none;
  }

  .sidebar-tab-content :deep(.v-window__container),
  .sidebar-tab-content :deep(.v-window-item) {
    height: auto;
  }

  .sidebar-content-scroll {
    height: auto;
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
