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
    <!-- <v-row>
      <v-col cols="12">
        <v-card>
          <v-text-field
            v-model="searchTerm"
            label="Buscar parámetro de sistema"
            prepend-inner-icon="mdi-magnify"
            clearable
            @update:modelValue="handleSearch"
            @keyup.enter="onSearchClick"
            @click:clear="onClearSearch"
            :loading="loading"
          ></v-text-field>
        </v-card>
      </v-col>
    </v-row> -->

    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-row no-gutters align="center">
            <v-col>
              <v-text-field
                v-model="searchTerm"
                label="Buscar parámetro de sistema"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
                :loading="loading"
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
                :loading="loading"
              >
                Buscar
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- System parameters table-->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table-server
            v-model:items-per-page="pagination.limit"
            v-model:page="pagination.page"
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
            Mostrando página {{ pagination.page }} de {{ totalPages }}. Total de parámetros:
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
const handleTableUpdate = async ({ page, itemsPerPage, sortBy }) => {
  // Actualizar ordenamiento si existe
  if (sortBy && sortBy.length > 0) {
    systemParametersStore.setSort(sortBy[0].key, sortBy[0].order);
  } else {
    systemParametersStore.setSort(null, null);
  }

  if (itemsPerPage !== pagination.value.limit) {
    systemParametersStore.setLimit(itemsPerPage);
    systemParametersStore.setPage(1);
  } else {
    systemParametersStore.setPage(page);
  }

  // Actualizar la paginación en el store
  console.log({ page });
  // systemParametersStore.setPage(page);
  systemParametersStore.setLimit(itemsPerPage);

  await systemParametersStore.fetchSystemParameters();
};

let searchTimeout = null;
const handleSearch = (value) => {
  searchTerm.value = value;
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(async () => {
    systemParametersStore.setSearch(value);
    await systemParametersStore.fetchSystemParameters();
  }, 300);
};

// watch(searchTerm, (newValue) => {
//   if (searchTimeout) clearTimeout(searchTimeout);

//   searchTimeout = setTimeout(() => {
//     // Actualizamos el store y disparamos la búsqueda
//     systemParametersStore.setSearch(newValue || '');
//     systemParametersStore.fetchSystemParameters();
//   }, 400); // 400ms es un tiempo ideal para esperar a que el usuario deje de escribir
// });

// const refreshData = () => {
//   fetchSystemParameters();
// };

// Cargar datos al montar el componente
// onMounted(async () => {
//   await systemParametersStore.fetchSystemParameters();
//   console.log("entrando...")
// });

// 2. Función para disparar la búsqueda manualmente
const onSearchClick = async () => {
  // Sincronizamos el término local con el Store y reseteamos página a 1
  systemParametersStore.setSearch(searchTerm.value || '');

  // Ejecutamos la petición
  await systemParametersStore.fetchSystemParameters();
};

// 3. Función para cuando el usuario limpia el campo con la "X"
const onClearSearch = () => {
  searchTerm.value = '';
  // onSearchClick();
};

// IMPORTANTE: Elimina el watch(searchTerm, ...) que teníamos antes
</script>

<style scoped>
.v-data-table-server {
  border-radius: 8px;
  overflow: hidden;
}
</style>
