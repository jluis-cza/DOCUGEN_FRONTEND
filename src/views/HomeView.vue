<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Bienvenido a DOCUGEN</h1>
        <p>Esta es la página de <i>Home</i> DOCUGEN.</p>
      </v-col>
    </v-row>
    <div>
      <RouterLink to="/login">Iniciar sesión</RouterLink>
    </div>
    <div>
      <RouterLink to="/register">Registrarse</RouterLink>
    </div>
  </v-container>
</template>
<script setup></script>
<style scoped></style>
