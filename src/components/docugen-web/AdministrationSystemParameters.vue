<template>
  <v-container fluid v-if="!isItemDetailActive">
    <!-- Title -->
    <div class="text-left">
      <h3>Parámetros del sistema</h3>
    </div>
    <!-- Table -->
    <div>
      <v-card class="my-4">
        <v-data-table
          class="responsive-actions-table"
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
            <div class="table-row-actions d-flex align-center ga-2">
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
                :disabled="switchingItemId === item._id"
                @update:modelValue="(value) => onSwitchStatus(value, item)"
              ></v-switch>
              <v-btn @click="viewItemDetail(item._id)" class="bg-info" size="small" variant="tonal">
                <template #prepend>
                  <v-icon icon="mdi-eye"></v-icon>
                </template>
                Ver
              </v-btn>
            </div>
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
  <RouterView />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSystemParameters } from '../../composables/docugen-web/useSystemParameters.js';
import { useSystemParameter } from '../../composables/docugen-web/useSystemParameter.js';
import { useTablesStore } from '../../stores/utils/tablesStore.js';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';
import { DIALOGS } from '../../constants/dialogs.js';

const router = useRouter();
const route = useRoute();
const isItemDetailActive = computed(() =>
  route.name === 'system-parameter-detail' ? true : false
);

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
const dialogBoxStore = useDialogBoxStore();
const switchingItemId = ref(null);
const {
  systemParameters,
  message: system_parameters_message,
  actions: system_parameters_actions,
  loading: system_parameters_loading,
  success: system_parameters_success,
} = useSystemParameters();
const { actions: system_parameter_actions } = useSystemParameter();

const onSwitchStatus = async (value, item) => {
  if (switchingItemId.value === item._id) return;
  switchingItemId.value = item._id;

  try {
    if (!value) {
      const dialogBoxData =
        DIALOGS.docugen_web.administration.system_parameter_monitoring_suspension;
      dialogBoxStore.setDialogBox({
        data: {
          ...dialogBoxData,
          text: dialogBoxData.text.replace('<parameter>', item.alias),
        },
      });
      dialogBoxStore.openDialogBox();
      const response = await dialogBoxStore.requestDialogBoxData();
      dialogBoxStore.resolveDialogBoxProcedure(true);
      if (response.key !== 'y') return;
    }

    const status = value ? 'followed' : 'unfollowed';
    await system_parameter_actions.systemParameterSetter(item._id, { data: { status } });
  } finally {
    switchingItemId.value = null;
  }
};

const viewItemDetail = (id) => {
  if (!id) throw new Error('There is no item id');
  router.push(`/dashboard/system/${id}`);
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

<style scoped>
.responsive-actions-table :deep(.v-table__wrapper) {
  overflow-x: auto;
}

.table-row-actions {
  width: max-content;
  min-width: 100%;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.table-row-actions :deep(.v-switch),
.table-row-actions .v-btn {
  flex: 0 0 auto;
}

.table-row-actions :deep(.v-label) {
  white-space: nowrap;
}
</style>
