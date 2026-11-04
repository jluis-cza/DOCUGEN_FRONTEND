<template>
  <div class="stage-toolbar d-flex justify-space-between align-center">
    <div class="canvas-guides-control">
      <v-checkbox
        :model-value="showGrid"
        label="Cuadrícula"
        density="compact"
        color="primary"
        hide-details
        title="Mostrar u ocultar la cuadrícula de referencia"
        @update:model-value="$emit('update:showGrid', $event)"
      />
      <v-checkbox
        :model-value="showMargins"
        label="Márgenes"
        density="compact"
        color="primary"
        hide-details
        title="Mostrar u ocultar la guía de márgenes"
        @update:model-value="$emit('update:showMargins', $event)"
      />
    </div>
    <div class="d-flex align-center ga-1">
      <v-btn
        icon="mdi-minus"
        size="small"
        variant="text"
        aria-label="Reducir zoom"
        title="Reducir zoom"
        @click="$emit('zoom-out')"
      />
      <span class="zoom-percentage" aria-live="polite">{{ Math.round(zoom * 100) }}%</span>
      <v-btn
        icon="mdi-plus"
        size="small"
        variant="text"
        aria-label="Aumentar zoom"
        title="Aumentar zoom"
        @click="$emit('zoom-in')"
      />
      <v-divider vertical class="mx-1" />
      <v-btn
        size="small"
        :icon="panMode ? 'mdi-hand-back-right' : 'mdi-hand-back-right-outline'"
        variant="text"
        :color="panMode ? 'primary' : undefined"
        :aria-pressed="panMode"
        :aria-label="
          panMode ? 'Desactivar desplazamiento de hoja' : 'Activar desplazamiento de hoja'
        "
        title="Modo para mover la hoja"
        @click="$emit('update:panMode', !panMode)"
      />
      <v-btn
        icon="mdi-fit-to-page-outline"
        size="small"
        variant="text"
        aria-label="Restablecer vista de hoja"
        title="Restablecer vista de hoja"
        @click="$emit('reset-zoom')"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  showGrid: { type: Boolean, default: true },
  showMargins: { type: Boolean, default: true },
  panMode: { type: Boolean, default: false },
  zoom: { type: Number, default: 1 },
});

defineEmits([
  'update:showGrid',
  'update:showMargins',
  'update:panMode',
  'zoom-out',
  'zoom-in',
  'reset-zoom',
]);
</script>
