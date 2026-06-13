<template>
  <p v-if="loading">Verificando el email...</p>
  <div v-else>
    <p v-if="success">
      Verificación exitosa. El correo electrónico: {{ email }} ha sido verificado exitosamente. Ya
      puede ingresar al sistema utilizando sus credenciales.
    </p>
    <div v-else>
      <p>Verificación fallida. Por favor espere unos minutos y registrese de nuevo.</p>
      <p>Mensaje del error: {{ message }}</p>
      <p>Código del error: {{ code }}</p>
    </div>
    <!-- Home link -->
    <RouterLink to="/">Ir al inicio</RouterLink>
  </div>
</template>
<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { onMounted, computed } from 'vue';
import { useEmail } from '../../composables/docugen-web/useEmail.js';

// Default values
const route = useRoute();
const { email, actions, loading, success, message, code } = useEmail();
const token = computed(() => route.query.token); // parameter from the email link

onMounted(async () => {
  await actions.emailVerifier({ token: token.value });
});
</script>

<style scoped></style>
