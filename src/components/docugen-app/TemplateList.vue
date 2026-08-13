<template>
  <v-container fluid>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h3>Plantillas</h3>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Crear plantilla
      </v-btn>
    </div>

    <v-card class="mb-4 pa-2">
      <div class="d-flex ga-3 align-center">
        <v-text-field
          v-model="search"
          label="Buscar plantilla"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          @keyup.enter="loadTemplates"
        />
        <v-btn color="primary" @click="loadTemplates" variant="tonal"> Buscar </v-btn>
      </div>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="templates"
        :loading="loading"
        :items-per-page="10"
        :items-per-page-options="[5, 10, 25]"
      >
        <template #[`item.name`]="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip :color="statusColor(item.status)" size="small" label> {{ item.status }} </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex ga-2">
            <v-btn color="info" variant="tonal" size="small" @click="openEditor(item._id)">
              Ver
            </v-btn>
            <v-btn color="error" variant="tonal" size="small" @click="deleteItem(item._id)">
              Eliminar
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="500" persistent>
      <v-card>
        <v-card-title>Crear plantilla</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Nombre de la plantilla" />
          <v-text-field v-model="form.description" label="Descripción" />
          <v-select v-model="form.status" label="Estado" :items="['draft', 'published']" />
          <v-text-field v-model.number="form.dimensions.width" label="Ancho" type="number" />
          <v-text-field v-model.number="form.dimensions.height" label="Alto" type="number" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogOpen = false">Cancelar</v-btn>
          <v-btn color="primary" @click="createNewTemplate">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTemplates } from '../../composables/docugen-app/useTemplates.js';

const router = useRouter();
const { templates, loading, listTemplates, createTemplate, deleteTemplate } = useTemplates();
const dialogOpen = ref(false);
const search = ref('');

const form = ref({
  name: '',
  description: '',
  status: 'draft',
  dimensions: { width: 794, height: 1123 },
});

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Estado', key: 'status' },
  { title: 'Actualizado', key: 'updatedAt' },
  { title: 'Acciones', key: 'actions', sortable: false },
];

const statusColor = (status) => {
  return status === 'draft' ? 'warning' : 'success';
};

const openCreateDialog = () => {
  dialogOpen.value = true;
};

const createNewTemplate = async () => {
  if (!form.value.name.trim()) return;

  const payload = {
    name: form.value.name,
    description: form.value.description,
    status: form.value.status,
    dimensions: {
      width: Number(form.value.dimensions.width),
      height: Number(form.value.dimensions.height),
      unit: 'px',
    },
    elements: [],
    metadata: {},
  };

  const created = await createTemplate(payload);
  dialogOpen.value = false;
  form.value = {
    name: '',
    description: '',
    status: 'draft',
    dimensions: { width: 794, height: 1123 },
  };

  await loadTemplates();
  if (created && created._id) {
    openEditor(created._id);
  }
};

const openEditor = (templateId) => {
  if (!templateId) return;
  router.push(`/templates/${templateId}/edit`);
};

const deleteItem = async (templateId) => {
  await deleteTemplate(templateId);
  await loadTemplates();
};

const loadTemplates = async () => {
  await listTemplates({ page: 1, limit: 10, search: search.value });
};

onMounted(async () => {
  await loadTemplates();
});
</script>
