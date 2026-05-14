<template>
  <!-- Title -->
  <div class="text-left">
    <h3>Servicios</h3>
  </div>
  <!-- Table -->
  <div class="my-4">
    <v-card>
      <v-data-table
        :items="services"
        :headers="headers"
        :loading="loading"
        v-model:sort-by="sortBy"
        hide-default-footer
      >
        <template #[`item.status`]="{ item }">
          <v-chip :color="status(item.status).color" variant="flat" size="small">{{
            status(item.status).text
          }}</v-chip>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-switch
            :model-value="item.status === 'running'"
            color="primary"
            :label="
              item.status === 'running'
                ? 'Desactivar servicio'
                : item.status === 'stopped'
                  ? 'Activar servicio'
                  : ''
            "
            inset
            density="compact"
            hide-details
            :disabled="switchingItemId === item._id"
            @update:modelValue="
              (value) => {
                onSwitchStatus(value, item);
              }
            "
          ></v-switch>
        </template>
      </v-data-table>
    </v-card>
  </div>
  <!-- Notifications -->
  <div>
    <v-card v-if="!(success ?? true)">
      <v-alert
        type="error"
        variant="tonal"
        icon="mdi-alert-circle"
        @click="actions.servicesGetter()"
        style="cursor: pointer"
      >
        Error: {{ message }}
        <br />
        <small>Haz clic para reintentar</small>
      </v-alert>
    </v-card>
  </div>
  <DialogBox />
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import DialogBox from '../DialogBox.vue';
import { useServices } from '../../composables/docugen-web/useServices.js';
import { useService } from '../../composables/docugen-web/useService.js';
import { useTablesStore } from '../../stores/tablesStore.js';
import { useDialogBoxStore } from '../../stores/dialogBoxStore.js';

const headers = [
  {
    title: 'Nombre',
    key: 'name',
    align: 'start',
    sortable: true,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
  {
    title: 'Estado',
    key: 'status',
    align: 'start',
    sortable: true,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
  {
    title: 'Acciones',
    key: 'actions',
    align: 'start',
    sortable: false,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
];
const sortBy = ref([{ key: 'name', order: 'asc' }]);
const switchingItemId = ref(null);
const dialogBoxStore = useDialogBoxStore();
const tablesStore = useTablesStore();
const tableId = 3;
const { services, actions, loading, success, message, code } = useServices();
const { service, actions: service_actions } = useService();

const status = (itemStatus) => {
  return {
    color: itemStatus === 'running' ? 'success' : itemStatus === 'stopped' ? 'error' : 'info',
    text:
      itemStatus === 'running'
        ? 'En servicio'
        : itemStatus === 'stopped'
          ? 'Fuera de servicio'
          : 'Sin estado',
  };
};

const onSwitchStatus = async (value, item) => {
  try {
    if (switchingItemId.value === item._id) return;
    switchingItemId.value = item._id;
    const status = value ? 'running' : 'stopped';
    if (status === 'stopped') {
      const dialogBoxData = {
        title: 'Desactivación del servicio',
        icon: 'mdi-power-off',
        text: `¿Está seguro de poner fuera de servicio la ${item.name}?`,
        actions: [
          { name: 'Aceptar', key: 'y' },
          { name: 'Cancelar', key: 'n' },
        ],
      };
      item.status = null; // waiting entry
      const selectedActionKey = await dialogBoxStore.openDialogBox(dialogBoxData);
      dialogBoxStore.resetDialogBox();
      if (selectedActionKey === 'n') {
        item.status = 'running';
        switchingItemId.value = null;
        return;
      }
    }
    // Setting the service
    const id = item._id;
    const payload = { status };
    await service_actions.serviceSetter(id, { data: payload });
  } catch (err) {
    console.log('Error switching the status', err);
  } finally {
    switchingItemId.value = null;
  }
};

watch(sortBy, (newValue, oldValue) => {
  tablesStore.setTable(tableId, {
    sort: { by: newValue[0].key, order: newValue[0].order },
  });
});

onMounted(async () => {
  await actions.servicesGetter();
});
</script>

<style scoped></style>
