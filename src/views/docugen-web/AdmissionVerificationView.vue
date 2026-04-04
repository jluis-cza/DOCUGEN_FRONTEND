<template>
  <p v-if = "success">Verificación exitosa. Ya puede ingresar al sistema utilizando sus credenciales.</p>
  <p v-else>Verificación fallida. Por favor registrese de nuevo.</p>
</template>
<script setup>
import { useRouter } from 'vue-router';
import { useToken } from '../../composables/docugen-web/useToken.js';
import { onMounted } from 'vue';

const route = useRouter();
const {actions, success} = useToken()
const token = route.query.token;


onMounted(async () => {
  try {
    await axios.post('/api/auth/verify', { token });
    alert("¡Cuenta verificada con éxito!");
  } catch (error) {
    alert("El token es inválido o ha expirado.");
  }


// Catch the param

// Send the param
// receive the response
onMounted(async()=>{
  actions.
})
</script>

<style scoped></style>
