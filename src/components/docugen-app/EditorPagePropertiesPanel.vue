<template>
  <div>
    <v-text-field
      v-model="template.name"
      label="Nombre de clave"
      hint="Identificador del dato usado como {{clave}} o enviado en los datos de generación."
      persistent-hint
      density="comfortable"
      @change="$emit('dirty')"
    />
    <v-text-field
      v-model="template.page.backgroundColor"
      label="Fondo de página"
      type="color"
      density="comfortable"
      @update:model-value="$emit('dirty')"
    />
    <v-textarea
      v-model="template.description"
      label="Descripción"
      rows="3"
      density="comfortable"
      @change="$emit('dirty')"
    />
    <div class="text-caption text-medium-emphasis mb-1">Márgenes (px)</div>
    <v-row dense>
      <v-col v-for="side in pageSides" :key="side" cols="6">
        <v-text-field
          v-model.number="template.page.margin[side]"
          :label="pageSideLabels[side]"
          type="number"
          min="0"
          suffix="px"
          density="comfortable"
          @change="$emit('page-settings-change')"
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
      @change="$emit('page-dimensions-change')"
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
      @change="$emit('page-dimensions-change')"
    />
    <v-select
      v-model="template.status"
      label="Estado"
      :items="statusOptions"
      item-title="title"
      item-value="value"
      density="comfortable"
      @change="$emit('dirty')"
    />
  </div>
</template>

<script setup>
defineProps({
  template: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
});

defineEmits(['dirty', 'page-settings-change', 'page-dimensions-change']);

const pageSides = ['top', 'right', 'bottom', 'left'];
const pageSideLabels = {
  top: 'Superior',
  right: 'Derecho',
  bottom: 'Inferior',
  left: 'Izquierdo',
};
</script>
