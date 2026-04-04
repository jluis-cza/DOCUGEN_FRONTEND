<!-- frontend/src/views/SystemParametersView.vue -->
<template>
  <v-container>
    <!-- title -->
    <v-row>
      <v-col cols="12">
        <h4>Parámetros del sistema</h4>
      </v-col>
    </v-row>
    <!-- search bar -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-row no-gutters align="center">
            <v-col>
              <v-text-field
                v-model="params.search"
                label="Buscar parámetro de sistema"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
                :loading="system_parameters_loading"
                @keyup.enter="onSearchClick"
                @click:clear="onClearSearch"
              ></v-text-field>
            </v-col>
            <v-col cols="auto" class="ml-4">
              <v-btn
                color="primary"
                height="56"
                prepend-icon="mdi-magnify"
                @click="onSearchClick"
                :loading="system_parameters_loading"
              >
                Buscar
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <!-- table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table-server
            v-model:items-per-page="params.limit"
            v-model:page="params.page"
            :headers="headers"
            :items="systemParameters"
            :items-length="system_parameters_table.pagination.total"
            :loading="system_parameters_loading"
            @update:options="handleTableUpdate"
            :items-per-page-options="[10, 25, 50]"
          >
            <template #item.status="{ item }">
              <v-switch
                :model-value="item.status === 'followed'"
                color="primary"
                label="Monitorear"
                inset
                @update:modelValue="(value) => onSwitchStatus(value, item)"
              ></v-switch>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!system_parameters_loading">
      <v-col cols="12">
        <v-card>
          <v-alert type="info" variant="tonal" icon="mdi-information">
            Mostrando página {{ system_parameters_table.pagination.page }} de
            {{ system_parameters_table.pagination.totalPages }}. Total de parámetros:
            {{ system_parameters_table.pagination.total }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="!(system_parameters_success ?? true)">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          @click="system_parameters_actions.systemParametersGetter"
          style="cursor: pointer"
        >
          Error: {{ system_parameters_message }}
          <br />
          <small>Haz clic para reintentar</small>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useSystemParameters } from '../../composables/docugen-web/useSystemParameters.js';
import { useSystemParameter } from '../../composables/docugen-web/useSystemParameter.js';
import { useTablesStore } from '../../stores/tablesStore.js';

const tableId = 1;
const tablesStore = useTablesStore();
tablesStore.resetTable(tableId);
const {
  systemParameters,
  table: system_parameters_table,
  message: system_parameters_message,
  actions: system_parameters_actions,
  loading: system_parameters_loading,
  success: system_parameters_success,
} = useSystemParameters();
const { actions: system_parameter_actions } = useSystemParameter();
// Table headers
const headers = [
  {
    title: 'Nombre',
    key: 'alias',
    align: 'start',
    sortable: true,
  },
  {
    title: 'Estado',
    key: 'status',
    align: 'start',
    sortable: false,
  },
];

const params = ref({
  page: tablesStore.getTable(tableId).pagination.page,
  limit: tablesStore.getTable(tableId).pagination.limit,
  sortBy: tablesStore.getTable(tableId).sort.by,
  sortOrder: tablesStore.getTable(tableId).sort.order,
  search: tablesStore.getTable(tableId).search,
});

// Métodos
const handleTableUpdate = async ({ page, itemsPerPage, sortBy }) => {
  if (sortBy && sortBy.length > 0) {
    params.value.sortBy = sortBy[0].key;
    params.value.sortOrder = sortBy[0].order;
  } else {
    params.value.sortBy = null;
    params.value.sortOrder = null;
  }
  if (itemsPerPage !== params.value.limit) {
    params.value.limit = itemsPerPage;
    params.value.page = 1;
  } else {
    params.value.page = page;
  }
  // params.value.limit = itemsPerPage;
  await system_parameters_actions.systemParametersGetter(params.value);
};

const onSwitchStatus = async (value, item) => {
  const status = value ? 'followed' : 'unfollowed';
  const parameterId = item._id;
  const payload = { id: parameterId, property: 'status', value: status };
  await system_parameter_actions.systemParameterSetter(payload);
  await system_parameters_actions.systemParametersGetter(params.value);
};

const onSearchClick = async () => {
  await system_parameters_actions.systemParametersGetter(params.value);
};

const onClearSearch = () => {
  params.value.search = '';
};
</script>

<style scoped>
.v-data-table-server {
  border-radius: 8px;
  overflow: hidden;
}
</style>
