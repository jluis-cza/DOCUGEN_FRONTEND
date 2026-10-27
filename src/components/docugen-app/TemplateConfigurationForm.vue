<template>
  <v-card-text class="config-content pa-4">
    <div v-if="viewMode === 'form'" class="form-view">
      <div v-if="!parameters.length" class="text-center pa-8">
        <v-icon size="48" class="text-disabled mb-4">mdi-information-outline</v-icon>
        <div class="text-subtitle-2 text-disabled">No hay parámetros dinámicos</div>
        <div class="text-caption text-disabled">Todos los datos son estáticos</div>
      </div>

      <div v-else class="d-flex flex-column ga-4">
        <div v-for="parameter in parameters" :key="parameter.key" class="placeholder-field">
          <v-select
            v-if="parameter.allowedValues?.length"
            :model-value="values[parameter.key] ?? ''"
            :items="parameter.allowedValues"
            :label="parameter.label || parameter.key"
            :error="!!errors[parameter.key]"
            :error-messages="errors[parameter.key] ? [errors[parameter.key]] : []"
            :hint="parameter.description || `Usado en: ${parameter.elementType}`"
            persistent-hint
            density="comfortable"
            variant="outlined"
            @update:model-value="emitValue(parameter.key, $event)"
          />
          <v-checkbox
            v-else-if="parameter.type === 'boolean'"
            :model-value="values[parameter.key] === true || values[parameter.key] === 'true'"
            :label="parameter.label || parameter.key"
            :error="!!errors[parameter.key]"
            :error-messages="errors[parameter.key] ? [errors[parameter.key]] : []"
            :hint="parameter.description || `Usado en: ${parameter.elementType}`"
            persistent-hint
            density="comfortable"
            @update:model-value="emitValue(parameter.key, $event)"
          />
          <div v-else-if="parameter.type === 'image'" class="d-flex flex-column ga-2">
            <v-text-field
              :model-value="values[parameter.key] ?? ''"
              :label="parameter.label || parameter.key"
              autocomplete="off"
              :error="!!errors[parameter.key]"
              :error-messages="errors[parameter.key] ? [errors[parameter.key]] : []"
              hint="Imagen dinámica: pega una URL HTTP(S), un data URL o Base64 PNG/JPEG. También puedes cargar un archivo."
              persistent-hint
              density="comfortable"
              variant="outlined"
              @update:model-value="emitValue(parameter.key, $event)"
            />
            <input
              :ref="(element) => $emit('set-image-file-input-ref', parameter.key, element)"
              class="d-none"
              type="file"
              accept="image/png,image/jpeg"
              @change="$emit('image-file-selected', parameter.key, $event)"
            />
            <div class="d-flex align-center ga-2">
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                prepend-icon="mdi-upload"
                @click="$emit('request-image-file', parameter.key)"
              >
                Subir imagen dinámica · {{ parameter.label || parameter.key }}
              </v-btn>
              <span class="text-caption text-medium-emphasis">PNG/JPEG · máx. 2 MB</span>
            </div>
            <v-img
              v-if="String(values[parameter.key] || '').startsWith('data:image/')"
              :src="values[parameter.key]"
              max-width="120"
              max-height="80"
              class="rounded border"
              cover
            />
          </div>
          <v-textarea
            v-else-if="parameter.type === 'textarea'"
            :model-value="values[parameter.key] ?? ''"
            :label="parameter.label || parameter.key"
            :error="!!errors[parameter.key]"
            :error-messages="errors[parameter.key] ? [errors[parameter.key]] : []"
            :hint="parameter.description || `Usado en: ${parameter.elementType}`"
            persistent-hint
            density="comfortable"
            variant="outlined"
            @update:model-value="emitValue(parameter.key, $event)"
          />
          <v-text-field
            v-else
            :model-value="values[parameter.key] || ''"
            :label="parameter.label || parameter.key"
            :type="
              ['number', 'date', 'email', 'url'].includes(parameter.type) ? parameter.type : 'text'
            "
            :error="!!errors[parameter.key]"
            :error-messages="errors[parameter.key] ? [errors[parameter.key]] : []"
            density="comfortable"
            variant="outlined"
            :hint="
              parameter.description ||
              (parameter.example
                ? `Ejemplo: ${parameter.example}`
                : `Usado en: ${parameter.elementType}`)
            "
            persistent-hint
            @update:model-value="emitValue(parameter.key, $event)"
          />
        </div>
      </div>
    </div>

    <div v-else class="json-view">
      <div class="text-caption text-medium-emphasis mb-2">
        Edita el JSON de los parámetros directamente:
      </div>
      <v-textarea
        :model-value="jsonString"
        label="Datos (JSON)"
        rows="12"
        density="compact"
        variant="outlined"
        font-family="monospace"
        class="font-mono"
        @update:model-value="$emit('update:jsonString', $event)"
        @blur="$emit('sync-json')"
      />
      <div v-if="jsonError" class="text-caption text-error mt-2">{{ jsonError }}</div>
    </div>
  </v-card-text>

  <div v-if="Object.keys(errors).length" class="validation-summary">
    <v-alert type="warning" density="compact" class="ma-4">
      <div class="text-subtitle-2 font-weight-bold mb-2">Campos incompletos:</div>
      <ul class="pl-5">
        <li v-for="(error, key) in errors" :key="key" class="text-caption">
          <strong>{{ key }}:</strong> {{ error }}
        </li>
      </ul>
    </v-alert>
  </div>
</template>

<script setup>
const props = defineProps({
  parameters: { type: Array, default: () => [] },
  values: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) },
  viewMode: { type: String, default: 'form' },
  jsonString: { type: String, default: '{}' },
  jsonError: { type: String, default: null },
});

const emit = defineEmits([
  'update:value',
  'update:jsonString',
  'sync-json',
  'set-image-file-input-ref',
  'image-file-selected',
  'request-image-file',
]);

const emitValue = (key, value) => {
  emit('update:value', { key, value });
};
</script>
