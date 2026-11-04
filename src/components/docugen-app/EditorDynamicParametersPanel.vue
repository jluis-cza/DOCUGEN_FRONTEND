<template>
  <div class="sidebar-content-scroll">
    <div class="panel-helper">
      <div class="text-caption text-medium-emphasis mb-2">Parámetros dinámicos</div>
      <div v-if="parameters.length" class="d-flex flex-column ga-2 mb-3">
        <v-card
          v-for="(parameter, index) in parameters"
          :key="parameter.key || index"
          class="pa-2"
          variant="tonal"
        >
          <v-text-field
            :model-value="parameter.key"
            label="Nombre"
            density="compact"
            hide-details
            @update:model-value="(value) => $emit('rename', parameter, value)"
          />
          <v-text-field
            v-model="parameter.label"
            label="Etiqueta del formulario"
            density="compact"
            hide-details
            @update:model-value="$emit('dirty')"
          />
          <v-textarea
            v-model="parameter.description"
            label="Descripción"
            rows="2"
            density="compact"
            hide-details
            @update:model-value="$emit('dirty')"
          />
          <v-text-field
            :model-value="(parameter.allowedValues || []).join(', ')"
            label="Valores permitidos (separados por comas)"
            density="compact"
            hide-details
            @update:model-value="(value) => $emit('update-allowed-values', parameter, value)"
          />
          <div class="d-flex align-center ga-2">
            <v-btn
              icon="mdi-link-variant"
              size="small"
              variant="text"
              :disabled="!selectedElement || selectedElement.type === 'pageNumber'"
              :aria-label="`Vincular parámetro ${parameter.key} al elemento seleccionado`"
              @click="$emit('insert-placeholder', parameter.key)"
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
              @update:model-value="$emit('dirty')"
            />
            <v-checkbox
              v-model="parameter.required"
              label="Requerido"
              hide-details
              density="compact"
              @update:model-value="$emit('dirty')"
            />
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              :aria-label="`Eliminar parámetro ${parameter.key}`"
              @click="$emit('remove', parameter.key)"
            />
          </div>
        </v-card>
      </div>
      <v-btn class="mt-2" size="small" variant="tonal" @click="$emit('add')">
        Añadir parámetro
      </v-btn>
      <div class="text-caption text-medium-emphasis mt-3">
        Los textos sin <code v-pre>{{ clave }}</code> son estáticos. Selecciona un elemento y usa el
        icono de enlace para insertar un parámetro dinámico.
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  parameters: { type: Array, required: true },
  selectedElement: { type: Object, default: null },
});

defineEmits(['rename', 'update-allowed-values', 'dirty', 'insert-placeholder', 'remove', 'add']);
</script>

<style scoped>
.panel-helper {
  margin-top: 8px;
}
</style>
