<template>
  <v-container fluid class="py-12">
    <v-container class="pa-0" max-width="800">
      <v-btn to="/" variant="text" prepend-icon="mdi-arrow-left" class="mb-8">
        Volver al inicio
      </v-btn>
      <h1 class="text-center">Manual</h1>
    </v-container>
    <!-- Swagger info... -->
    <iframe src="http://localhost:4000/api/docs" style="width: 100%; height: 100vh; border: none" />
  </v-container>
</template>

<script setup></script>

<style scoped></style>
