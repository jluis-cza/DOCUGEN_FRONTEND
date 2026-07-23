<template>
  <p v-if="loading"><b>Verificando el email...</b></p>
  <div v-else>
    <p v-if="success">
      <b>VERIFICACIÓN EXITOSA.</b> El correo electrónico: <b>{{ email }}</b> ha sido verificado
      exitosamente. Ya puede ingresar al sistema utilizando sus credenciales.
    </p>
    <div v-else>
      <p><b>VERIFICACIÓN FALLIDA.</b> Por favor espere unos minutos y registrese de nuevo.</p>
      <p><b>Mensaje del error:</b> {{ message }}</p>
      <p><b>Código del error:</b> {{ code }}</p>
    </div>
    <!-- Home link -->
    <RouterLink to="/">Ir a la página de inicio</RouterLink>
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
