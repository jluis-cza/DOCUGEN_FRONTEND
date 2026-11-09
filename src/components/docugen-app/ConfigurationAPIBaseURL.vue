<template>
  <v-card class="elevation-1">
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-web" color="primary" />
      </template>
      <v-card-title>Configuración de API Base URL</v-card-title>
    </v-card-item>

    <v-card-text>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Usa esta URL como base para las llamadas a la API de DOCUGEN.
      </p>

      <div class="text-caption text-medium-emphasis mb-2">API_BASE_URL</div>
      <div class="d-flex align-center ga-2 mb-4">
        <v-text-field
          :model-value="apiBaseUrl || 'https://tu-dominio/api/v1'"
          readonly
          variant="outlined"
          hide-details
          class="font-family-monospace"
        />
        <v-btn
          icon="mdi-content-copy"
          aria-label="Copiar API_BASE_URL"
          variant="tonal"
          :disabled="!apiBaseUrl"
          @click="copyToClipboard(apiBaseUrl || 'https://tu-dominio/api/v1')"
        />
      </div>

      <div class="d-flex justify-end align-center ga-1 mt-2">
        <v-btn
          icon="mdi-help-circle-outline"
          color="primary"
          variant="text"
          size="small"
          density="compact"
          aria-label="Ayuda sobre API Base URL"
          title="Ayuda sobre API Base URL"
          :to="{ path: '/manual', hash: '#api-base-url' }"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { UtilsService } from '@/services/UtilsService.js';
import { useNotificationStore } from '@/stores/utils/notificationStore.js';

const apiBaseUrl = ref('');
const notificationStore = useNotificationStore();

const copyWithFallback = (value) => {
  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  try {
    input.select();
    if (!document.execCommand('copy')) {
      throw new Error('El navegador no pudo copiar la URL.');
    }
  } finally {
    input.remove();
  }
};

const loadApiBaseUrl = async () => {
  apiBaseUrl.value = '';

  try {
    const response = await UtilsService.getRoutesInfo();
    const configuredApiBaseUrl = response.data?.data?.apiBaseUrl;
    if (!configuredApiBaseUrl) {
      return;
    }

    const parsedUrl = new URL(configuredApiBaseUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('BACKEND_URL must use HTTP or HTTPS.');
    }

    apiBaseUrl.value = parsedUrl.toString().replace(/\/+$/, '');
  } catch (error) {
    console.error('Unable to load public backend URL for API Base URL configuration.', error);
  }
};

const copyToClipboard = async (value) => {
  if (!value) return;

  try {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        copyWithFallback(value);
      }
    } else {
      copyWithFallback(value);
    }
    notificationStore.setNotification({
      message: 'API_BASE_URL copiada al portapapeles.',
      code: 'S0000',
      mode: 'short',
    });
  } catch (error) {
    notificationStore.setNotification({
      message: error.message || 'No se pudo copiar API_BASE_URL.',
      code: 'EXXX',
      mode: 'persistent',
    });
  }
};

onMounted(() => {
  loadApiBaseUrl();
});
</script>
