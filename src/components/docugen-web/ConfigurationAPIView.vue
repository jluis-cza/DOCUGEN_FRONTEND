<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-4">Configuración API</h1>

    <v-tabs :model-value="activeTab" class="mb-4" @update:model-value="navigateToTab">
      <v-tab value="tokens" prepend-icon="mdi-key-link">Tokens de API</v-tab>
      <v-tab value="base-url" prepend-icon="mdi-web">API Base URL</v-tab>
      <v-tab value="endpoints" prepend-icon="mdi-api">Endpoints</v-tab>
    </v-tabs>

    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const activeTab = computed(() => {
  if (route.path.endsWith('/base-url')) return 'base-url';
  if (route.path.endsWith('/endpoints')) return 'endpoints';
  return 'tokens';
});

const navigateToTab = (tab) => {
  router.push({
    name: {
      'base-url': 'api-configuration-base-url',
      endpoints: 'api-configuration-endpoints',
      tokens: 'api-configuration-tokens',
    }[tab],
  });
};
</script>
