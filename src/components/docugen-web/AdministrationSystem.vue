<!-- frontend/src/views/SystemParametersView.vue -->
<template>
  <v-container>
    <!-- Title-->
    <v-row>
      <v-col cols="12">
        <h5>Parámetros del sistema</h5>
      </v-col>
    </v-row>

    <!-- Search bar -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-text-field
            v-model="searchTerm"
            label="Buscar parámetro de sistema"
            prepend-inner-icon="mdi-magnify"
            clearable
            @update:modelValue="handleSearch"
            :loading="loading"
          ></v-text-field>
        </v-card>
      </v-col>
    </v-row>

    <!-- System parameters table-->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            :headers="headers"
            :items="systemParameters"
            :items-length="totalItems"
            :loading="loading"
            :search="search"
            @update:options="handleTableUpdate"
            :items-per-page-options="[10, 25, 50]"
          >
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <!-- Page info -->
    <v-row v-if="!loading">
      <v-col cols="12">
        <v-card>
          <v-alert type="info" variant="tonal" icon="mdi-information">
            Mostrando página {{ currentPage }} de {{ totalPages }}. Total de parámetros:
            {{ totalItems }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <!-- Manejo de errores -->
    <v-row v-if="error">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          @click="fetchSystemParameters"
          style="cursor: pointer"
        >
          Error: {{ error }}
          <br />
          <small>Haz clic para reintentar</small>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useSystemParametersStore } from '../../stores/docugen-web/systemParametersStore.js';
import { storeToRefs } from 'pinia';

// Usar el store
const systemParametersStore = useSystemParametersStore();
const { systemParameters, loading, error, pagination, sort, search } =
  storeToRefs(systemParametersStore);

// Referencias para el componente
const searchTerm = ref(search.value); // Usa el valor inicial del store
const itemsPerPage = ref(pagination.value.limit); // Inicializa con el límite del store
const currentPage = ref(pagination.value.page); // Inicializa con la página del store

// Headers de la tabla
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
    sortable: true,
  },
];

// Computadas
const totalItems = computed(() => pagination.value.total);
const totalPages = computed(() => pagination.value.totalPages);

// Métodos
const fetchSystemParameters = () => {
  systemParametersStore.fetchSystemParameters();
};

const handleTableUpdate = ({ page, itemsPerPage: iol, sortBy }) => {
  // Actualizar ordenamiento si existe
  if (sortBy && sortBy.length > 0) {
    const { key, order } = sortBy[0];
    systemParametersStore.setSort(key, order);
  } else {
    systemParametersStore.setSort(null, null);
  }

  // Actualizar la paginación en el store
  systemParametersStore.setPage(page);
  systemParametersStore.setLimit(iol);
  fetchSystemParameters();
};

let searchTimeout = null;
const handleSearch = (value) => {
  searchTerm.value = value;
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    systemParametersStore.setSearch(value);
    fetchSystemParameters();
  }, 300);
};

// const refreshData = () => {
//   fetchSystemParameters();
// };

// Cargar datos al montar el componente
onMounted(() => {
  fetchSystemParameters();
});
</script>

<style scoped>
.v-data-table-server {
  border-radius: 8px;
  overflow: hidden;
}
</style>
