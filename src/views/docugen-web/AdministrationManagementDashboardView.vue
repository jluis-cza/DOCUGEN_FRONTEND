<!-- This view is part of the Administration and Management modules of DOCUGEN-->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="header">
          <h2>DOCUGEN</h2>
          <v-btn @click="logout()">Salir</v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <aside class="navegationBar">
          <h3>Bienvenido</h3>
          <h4>{{ username }}</h4>
          <br/>
          <ul>
            <li v-if="role === administrator">
              <RouterLink to="/dashboard/system">Parámetros del Sistema</RouterLink>
            </li>
            <li v-if="role === developer">
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
import {
  removeToken,
  removeBasicAccountInfo,
} from '../../helpers/docugen-web/admissionLoginHelper.js';
import { USERS } from '../../constants/users.js'
import { useRouter } from 'vue-router';

const username = ref('');
const role = ref('');
const administrator = USERS.type.server.role.administrator 
const developer = USERS.type.client.role.developer
const router = useRouter();

const logout = async () => {
  removeToken();
  removeBasicAccountInfo();
  try{
    await router.push('/');
  }catch(error){
    console.log("Navigational error. ", error)
  }
};

onMounted(() => {
  username.value = retrieveBasicAccountInfo().username;
  role.value = retrieveBasicAccountInfo().role;
});
</script>

<style scoped>
.header-container {
}
.header {
  display: flex;
  justify-content: space-between;
  background-color: aquamarine;
}
.navegationBar {
  background-color: azure;
}
.mainPanel {
  background-color: beige;
}
ul {
  list-style: none;
}
</style>
