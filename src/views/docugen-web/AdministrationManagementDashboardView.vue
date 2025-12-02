<!-- This view is part of the Administration and Management modules of DOCUGEN-->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="header"><h2>DOCUGEN</h2></div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <aside class="navegationBar">
          <h3>Bienvenido</h3>
          <h4>{{ username }}</h4>
          <ul>
            <li>
              <RouterLink to="/dashboard/system">Parámetros del Sistema</RouterLink>
            </li>
            <li>
              <RouterLink to="/dashboard/template-management">Gestor de Plantillas</RouterLink>
            </li>
          </ul>
        </aside>
      </v-col>
      <v-col cols="9">
        <main class="mainPanel">
          <RouterView />
        </main>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { retrieveBasicAccountInfo } from '../../helpers/docugen-web/administrationManagementDashboardHelper.js';

const username = ref('');
const role = ref('');

onMounted(() => {
  username.value = retrieveBasicAccountInfo().username;
  role.value = retrieveBasicAccountInfo().role;
});
</script>

<style scoped>
.header {
  background-color: aquamarine;
}
.navegationBar {
  background-color: azure;
}
.mainPanel {
  background-color: beige;
}
</style>
