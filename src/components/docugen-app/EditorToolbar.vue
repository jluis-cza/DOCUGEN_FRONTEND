<template>
  <v-app-bar color="surface" flat class="editor-topbar border-b" density="comfortable">
    <template #prepend>
      <v-btn icon="mdi-arrow-left" variant="text" color="primary" @click="$emit('back')" />
    </template>

    <div class="editor-heading">
      <div class="text-start">
        <div class="text-caption text-medium-emphasis">Plantillas</div>
        <div class="text-subtitle-1 font-weight-bold">{{ templateName || 'Nueva plantilla' }}</div>
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
          :disabled="!canUndo"
          @click="$emit('undo')"
        >
          Deshacer
        </v-btn>
        <v-btn
          size="small"
          variant="text"
          prepend-icon="mdi-redo"
          :disabled="!canRedo"
          @click="$emit('redo')"
        >
          Rehacer
        </v-btn>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-content-save"
          size="small"
          :loading="isSaving"
          :disabled="isSaving || isConfiguring"
          @click="$emit('save')"
        >
          Guardar
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-file-pdf-box"
          size="small"
          :loading="isConfiguring"
          :disabled="isSaving || isConfiguring"
          @click="$emit('configure')"
        >
          Configurar y Generar
        </v-btn>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup>
defineProps({
  templateName: { type: String, default: '' },
  hasUnsavedChanges: { type: Boolean, default: false },
  canUndo: { type: Boolean, default: false },
  canRedo: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false },
  isConfiguring: { type: Boolean, default: false },
});

defineEmits(['back', 'undo', 'redo', 'save', 'configure']);
</script>
