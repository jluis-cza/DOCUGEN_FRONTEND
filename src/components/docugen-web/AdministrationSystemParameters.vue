<!-- frontend/src/views/SystemParametersView.vue -->
<template>
  <v-container fluid>
    <!-- Title -->
    <div class="text-left">
      <h3>Parámetros del sistema</h3>
    </div>
    <!-- Table -->
    <div>
      <v-card class="my-4">
        <v-data-table
          :headers="headers"
          :items="systemParameters"
          :loading="system_parameters_loading"
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
              :model-value="item.status === 'followed'"
              color="primary"
              :label="
                item.status === 'followed'
                  ? 'Dejar de monitorear'
                  : item.status === 'unfollowed'
                    ? 'Monitorear'
                    : ''
              "
              inset
              density="compact"
              hide-details
              @update:modelValue="(value) => onSwitchStatus(value, item)"
            ></v-switch>
          </template>
        </v-data-table>
      </v-card>
    </div>
    <!-- Notifications -->
    <div>
      <v-card v-if="!(system_parameters_success ?? true)">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          @click="system_parameters_actions.systemParametersGetter()"
          style="cursor: pointer"
        >
          Error: {{ system_parameters_message }}
          <br />
          <small>Haz clic para reintentar</small>
        </v-alert>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSystemParameters } from '../../composables/docugen-web/useSystemParameters.js';
import { useSystemParameter } from '../../composables/docugen-web/useSystemParameter.js';
import { useTablesStore } from '../../stores/tablesStore.js';

// Table headers
const headers = [
  {
    title: 'Nombre',
    key: 'alias',
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
const sortBy = ref([{ key: 'alias', order: 'asc' }]);
const status = (itemStatus) => {
  return {
    color: itemStatus === 'followed' ? 'success' : itemStatus === 'unfollowed' ? 'error' : 'info',
    text:
      itemStatus === 'followed'
        ? 'Monitoreando'
        : itemStatus === 'unfollowed'
          ? 'No monitoreado'
          : 'Sin estado',
  };
};
const tablesStore = useTablesStore();
const tableId = 1;
const {
  systemParameters,
  message: system_parameters_message,
  actions: system_parameters_actions,
  loading: system_parameters_loading,
  success: system_parameters_success,
} = useSystemParameters();
const { actions: system_parameter_actions } = useSystemParameter();

const onSwitchStatus = async (value, item) => {
  const status = value ? 'followed' : 'unfollowed';
  const id = item._id;
  const payload = { status };
  await system_parameter_actions.systemParameterSetter(id, { data: payload });
};

watch(sortBy, (newValue, oldValue) => {
  tablesStore.setTable(tableId, {
    sort: { by: newValue[0].key, order: newValue[0].order },
  });
});

onMounted(async () => {
  await system_parameters_actions.systemParametersGetter();
});
</script>

<style scoped></style>
