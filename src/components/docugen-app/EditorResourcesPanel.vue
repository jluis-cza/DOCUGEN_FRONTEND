<template>
  <div class="sidebar-content-scroll resource-panel">
    <div class="text-body-2 mb-2">
      Imágenes estáticas de la plantilla. PNG y JPEG, hasta 2 MB por imagen y 6 MB en total.
    </div>
    <input
      ref="imageResourceInput"
      class="d-none"
      type="file"
      accept="image/png,image/jpeg"
      @change="$emit('upload', $event)"
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
    <div v-if="error" class="text-caption text-error mb-2">
      {{ error }}
    </div>
    <div v-if="!resources.length" class="text-caption text-medium-emphasis">
      Aún no hay imágenes. Sube recursos y selecciónalos en un elemento imagen.
    </div>
    <v-card v-for="resource in resources" :key="resource.id" class="pa-2 mb-2" variant="tonal">
      <img :src="resource.dataUrl" :alt="resource.name" class="resource-thumbnail mb-2" />
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
          @click="$emit('use-resource', resource)"
        >
          Usar imagen
        </v-btn>
        <v-btn
          icon="mdi-delete-outline"
          size="small"
          variant="text"
          color="error"
          :aria-label="`Eliminar recurso ${resource.name}`"
          @click="$emit('remove-resource', resource)"
        />
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  resources: { type: Array, default: () => [] },
  error: { type: String, default: '' },
});

defineEmits(['upload', 'use-resource', 'remove-resource']);

const imageResourceInput = ref(null);

const formatResourceSize = (size) =>
  size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
</script>

<style scoped>
.sidebar-content-scroll {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 6px;
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
</style>
