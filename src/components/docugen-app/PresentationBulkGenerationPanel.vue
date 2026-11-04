<template>
  <v-card class="bulk-panel" rounded="xl">
    <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
      <span>Configuración</span>
      <div class="d-flex align-center ga-2">
        <v-chip size="small" color="primary" variant="tonal">
          {{ bulkRows.length }} / {{ maxDocuments }} documentos
        </v-chip>
        <v-btn
          size="small"
          variant="tonal"
          prepend-icon="mdi-plus"
          :disabled="bulkRows.length >= maxDocuments || isGenerating"
          @click="$emit('add-row')"
        >
          Agregar fila
        </v-btn>
      </div>
    </v-card-title>
    <v-divider />
    <v-card-text class="bulk-table-container pa-4">
      <div v-if="!placeholders.length" class="text-center text-medium-emphasis pa-8">
        La plantilla no tiene parámetros dinámicos; cada fila generará el mismo documento.
      </div>
      <div class="bulk-table-scroll">
        <table class="bulk-table">
          <thead>
            <tr>
              <th>#</th>
              <th v-for="placeholder in placeholders" :key="placeholder.key">
                {{ placeholder.label || placeholder.key }}
                <span v-if="placeholder.required" class="text-error">*</span>
              </th>
              <th class="status-column">Estado</th>
              <th class="row-actions-column" aria-label="Acciones"></th>
              <th class="document-column">Documento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in bulkRows" :key="row.id">
              <td>{{ rowIndex + 1 }}</td>
              <td v-for="placeholder in placeholders" :key="placeholder.key">
                <v-select
                  v-if="placeholder.allowedValues?.length"
                  :model-value="row.data[placeholder.key] ?? ''"
                  :items="placeholder.allowedValues"
                  :error="!!row.errors[placeholder.key]"
                  :error-messages="row.errors[placeholder.key] ? [row.errors[placeholder.key]] : []"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  @update:model-value="(value) => $emit('update-value', row, placeholder, value)"
                />
                <v-checkbox
                  v-else-if="placeholder.type === 'boolean'"
                  :model-value="
                    row.data[placeholder.key] === true || row.data[placeholder.key] === 'true'
                  "
                  :error="!!row.errors[placeholder.key]"
                  density="compact"
                  hide-details
                  @update:model-value="(value) => $emit('update-value', row, placeholder, value)"
                />
                <v-textarea
                  v-else-if="placeholder.type === 'textarea'"
                  :model-value="row.data[placeholder.key] ?? ''"
                  :error="!!row.errors[placeholder.key]"
                  :error-messages="row.errors[placeholder.key] ? [row.errors[placeholder.key]] : []"
                  rows="1"
                  auto-grow
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  @update:model-value="(value) => $emit('update-value', row, placeholder, value)"
                />
                <v-text-field
                  v-else
                  :model-value="row.data[placeholder.key] ?? ''"
                  :type="
                    ['number', 'date', 'email', 'url'].includes(placeholder.type)
                      ? placeholder.type
                      : 'text'
                  "
                  :error="!!row.errors[placeholder.key]"
                  :error-messages="row.errors[placeholder.key] ? [row.errors[placeholder.key]] : []"
                  :placeholder="
                    placeholder.type === 'image' ? 'URL o Base64 PNG/JPEG' : placeholder.key
                  "
                  :append-inner-icon="placeholder.type === 'image' ? 'mdi-upload' : undefined"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  @click:append-inner="$emit('request-image-file', row.id, placeholder.key)"
                  @update:model-value="(value) => $emit('update-value', row, placeholder, value)"
                />
                <input
                  v-if="placeholder.type === 'image'"
                  :ref="
                    (element) => $emit('set-image-file-input-ref', row.id, placeholder.key, element)
                  "
                  class="d-none"
                  type="file"
                  accept="image/png,image/jpeg"
                  @change="(event) => $emit('image-file-selected', row, placeholder, event)"
                />
              </td>
              <td class="status-column">
                <v-tooltip v-if="row.error" :text="row.error">
                  <template #activator="{ props }">
                    <v-chip v-bind="props" size="small" color="error" variant="tonal">
                      <v-icon start icon="mdi-alert-circle-outline" /> Error
                    </v-chip>
                  </template>
                </v-tooltip>
                <v-chip v-else-if="row.url" size="small" color="success" variant="tonal">
                  <v-icon start icon="mdi-check-circle-outline" /> Generado
                </v-chip>
                <v-chip
                  v-else-if="row.status === 'invalid'"
                  size="small"
                  color="warning"
                  variant="tonal"
                >
                  <v-icon start icon="mdi-alert-outline" /> Revisar datos
                </v-chip>
                <v-chip v-else size="small" variant="tonal">Pendiente</v-chip>
              </td>
              <td class="row-actions-column">
                <v-btn
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="text"
                  color="error"
                  aria-label="Eliminar fila"
                  :disabled="bulkRows.length === 1 || isGenerating"
                  @click="$emit('remove-row', row.id)"
                />
              </td>
              <td class="document-column">
                <a
                  v-if="row.url"
                  :href="row.url"
                  target="_blank"
                  rel="noopener"
                  class="text-primary"
                >
                  Ver PDF
                </a>
                <span v-else class="text-medium-emphasis">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="bulkRows.some((row) => Object.keys(row.errors).length)"
        class="text-caption text-error mt-3"
      >
        Corrige los campos marcados antes de generar los documentos.
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  placeholders: { type: Array, required: true },
  bulkRows: { type: Array, required: true },
  maxDocuments: { type: Number, required: true },
  isGenerating: { type: Boolean, required: true },
});

defineEmits([
  'add-row',
  'update-value',
  'request-image-file',
  'set-image-file-input-ref',
  'image-file-selected',
  'remove-row',
]);
</script>

<style scoped>
.bulk-panel {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.bulk-table-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.bulk-table-scroll {
  width: 100%;
  overflow: auto;
}

.bulk-table {
  width: 100%;
  min-width: max-content;
  border-collapse: separate;
  border-spacing: 0;
}

.bulk-table th,
.bulk-table td {
  min-width: 150px;
  padding: 8px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.bulk-table th:first-child,
.bulk-table td:first-child,
.bulk-table .row-actions-column {
  min-width: 48px;
  width: 48px;
}

.bulk-table .status-column,
.bulk-table .document-column {
  min-width: 130px;
}

.bulk-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f8fafc;
}

@media (max-width: 900px) {
  .bulk-panel {
    min-height: 60vh;
  }
}
</style>
