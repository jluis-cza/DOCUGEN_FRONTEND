<template>
  <div class="toolbar-grid">
    <v-btn
      v-for="tool in tools"
      :key="tool.type"
      block
      draggable="true"
      :color="tool.color"
      variant="tonal"
      @click="$emit('add-element', tool.type)"
      @dragstart="$emit('start-drag', $event, tool.type)"
    >
      <v-icon start :icon="tool.icon" />
      {{ tool.label }}
    </v-btn>
  </div>
  <div class="text-caption text-medium-emphasis mt-3">
    Haz clic para agregar un elemento en su posición inicial o arrástralo hasta el lienzo para
    colocarlo donde quieras.
  </div>
</template>

<script setup>
const tools = [
  { type: 'text', label: 'Texto', icon: 'mdi-format-text', color: 'primary' },
  { type: 'title', label: 'Título', icon: 'mdi-format-header-pound', color: 'primary' },
  { type: 'subtitle', label: 'Subtítulo', icon: 'mdi-format-size', color: 'primary' },
  { type: 'paragraph', label: 'Párrafo', icon: 'mdi-format-paragraph', color: 'primary' },
  { type: 'list', label: 'Lista', icon: 'mdi-format-list-bulleted', color: 'primary' },
  { type: 'placeholder', label: 'Campo dinámico', icon: 'mdi-variable', color: 'secondary' },
  { type: 'image', label: 'Imagen', icon: 'mdi-image', color: 'secondary' },
  { type: 'qr', label: 'QR', icon: 'mdi-qrcode', color: 'secondary' },
  { type: 'date', label: 'Fecha', icon: 'mdi-calendar', color: 'secondary' },
  { type: 'footer', label: 'Pie', icon: 'mdi-page-layout-footer', color: 'warning' },
  { type: 'signature', label: 'Firma', icon: 'mdi-signature-freehand', color: 'warning' },
  { type: 'line', label: 'Línea', icon: 'mdi-minus', color: 'success' },
  { type: 'rect', label: 'Caja', icon: 'mdi-rectangle', color: 'success' },
  { type: 'table', label: 'Tabla', icon: 'mdi-table', color: 'success' },
  { type: 'checkbox', label: 'Casilla', icon: 'mdi-checkbox-marked-outline', color: 'info' },
  { type: 'pageNumber', label: 'Nº página', icon: 'mdi-numeric', color: 'info' },
];

defineEmits(['add-element', 'start-drag']);
</script>

<style scoped>
.toolbar-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 0 0 auto;
}

.toolbar-grid :deep(.v-btn) {
  justify-content: flex-start;
  padding-inline: 12px;
  border-radius: 12px;
  min-height: 42px;
  font-weight: 600;
  cursor: grab;
}

.toolbar-grid :deep(.v-btn:active) {
  cursor: grabbing;
}
</style>
