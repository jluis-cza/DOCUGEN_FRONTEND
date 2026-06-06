<template>
  <v-container fluid>
    <!-- search bar -->
    <div>
      <v-card class="d-flex my-4 pa-2">
        <v-text-field
          v-model="params.search"
          label="Buscar servicios de cuenta"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          :loading="servicesAccounts_loading"
          @keyup.enter="onSearchClick"
          @click:clear="onClearSearch"
        >
        </v-text-field>
        <v-btn
          color="primary"
          height="56"
          prepend-icon="mdi-magnify"
          @click="onSearchClick"
          :loading="servicesAccounts_loading"
        >
          Buscar
        </v-btn>
      </v-card>
    </div>
    <!-- table -->
    <div class="my-4">
      <v-card>
        <v-data-table-server
          :items-per-page="params.limit"
          :page="params.page"
          :headers="headers"
          :items="servicesAccounts"
          :items-length="table?.pagination?.total || 1"
          :loading="servicesAccounts_loading"
          @update:options="handleTableUpdate"
          :items-per-page-options="[5, 10, 25, 50]"
        >
        </v-data-table-server>
      </v-card>
    </div>
    <!-- alert notification -->
    <div>
      <v-card v-if="!(servicesAccounts_success ?? true)">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          @click="servicesAccounts_actions.servicesAccountsGetter(params)"
          style="cursor: pointer"
        >
          Error: {{ servicesAccounts_message }}
          <br />
          <small>Haz clic para reintentar</small>
        </v-alert>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import
</script>

<style scoped></style>
