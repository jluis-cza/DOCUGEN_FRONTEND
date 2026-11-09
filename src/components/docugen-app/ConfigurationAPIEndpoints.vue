<template>
  <v-card class="elevation-1">
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-api" color="primary" />
      </template>
      <v-card-title>Endpoints de generación</v-card-title>
    </v-card-item>

    <v-card-text>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Estos endpoints usan la <code>API_BASE_URL</code> configurada y requieren un token API
        válido en el encabezado Authorization.
      </p>

      <v-list density="compact" class="rounded border">
        <v-list-item v-for="endpoint in endpoints" :key="endpoint.path">
          <template #prepend>
            <v-chip size="x-small" label :color="endpoint.method === 'GET' ? 'info' : 'success'">
              {{ endpoint.method }}
            </v-chip>
          </template>
          <v-list-item-title class="font-family-monospace">{{ endpoint.path }}</v-list-item-title>
          <v-list-item-subtitle>{{ endpoint.description }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <div class="d-flex justify-end align-center ga-1 mt-2">
        <v-btn
          icon="mdi-help-circle-outline"
          color="primary"
          variant="text"
          size="small"
          density="compact"
          aria-label="Ayuda sobre endpoints de generación"
          title="Ayuda sobre endpoints de generación"
          :to="{ path: '/manual', hash: '#generacion-mediante-api' }"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const endpoints = [
  {
    method: 'GET',
    path: '/app/documents/availability',
    description: 'Comprueba si la generación está habilitada para la cuenta.',
  },
  {
    method: 'GET',
    path: '/app/templates',
    description: 'Lista las plantillas disponibles para la cuenta.',
  },
  {
    method: 'GET',
    path: '/app/templates/:template_id',
    description: 'Consulta el detalle de una plantilla.',
  },
  {
    method: 'GET',
    path: '/app/templates/:template_id/parameters',
    description: 'Obtiene los campos dinámicos que se usan en los datos de generación.',
  },
  {
    method: 'POST',
    path: '/app/documents/generate',
    description: 'Genera un documento individual en PDF.',
  },
  {
    method: 'POST',
    path: '/app/documents/bulk-generate',
    description: 'Genera documentos en lote (hasta 100 por solicitud).',
  },
];
</script>
