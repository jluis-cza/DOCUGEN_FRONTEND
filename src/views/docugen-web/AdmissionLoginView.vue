<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Inicio de sesión</h1>
        <p>Por favor ingrese sus credenciales para iniciar sesión.</p>
        <v-form ref="form" validate-on="submit lazy" @submit.prevent="login">
          <v-text-field
            v-model="userCredentialsData.email"
            label="Correo"
            type="email"
            :rules="[RULE_EMAIL_INPUT, RULE_TEXT_REQUIRED]"
          ></v-text-field>
          <v-text-field
            v-model="userCredentialsData.password"
            label="Contraseña"
            type="password"
            :rules="[RULE_TEXT_REQUIRED]"
          ></v-text-field>
          <v-btn color="primary" type="submit">Iniciar sesión</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { RULES } from '../../helpers/rules.js';
import { SERVICES } from '../../constants/services.js';
import * as admissionLoginHelper from '../../helpers/docugen-web/admissionLoginHelper.js';
import { ref, onMounted} from 'vue';
import { useCredentialsStore } from '../../stores/docugen-web/credentialStore.js';
// import { useNotificationStore } from '../../stores/notificationStore.js';
import { useRouter } from 'vue-router';

const RULE_TEXT_REQUIRED = RULES.text.input.required;
const RULE_EMAIL_INPUT = RULES.text.input.email;
const credentials = useCredentialsStore();
// const notification = useNotificationStore();
const userCredentialsDefaultData = SERVICES.payload.docugen_web.admission.user_credentials;
const userCredentialsData = ref(JSON.parse(JSON.stringify(userCredentialsDefaultData)));
const form = ref(null);
const router = useRouter();

const login = async () => {
  try {
    // Checking mistakes in imput data
    const { valid } = await form.value.validate();
    if (valid) {
      credentials.resetCredentials();
      credentials.setCredentials(userCredentialsData.value);
      const credentialsStored = credentials.getCredentials;
      const response = await credentials.submitCredentials(credentialsStored); // Making the post request
      userCredentialsData.value = userCredentialsDefaultData; //cleaning form

      if (response.data.success) {
        //Setting the LocalStorage
        const token = response.data.token;
        const accountId = response.data.accountData._id;
        const username = response.data.accountData.username;
        const role = response.data.accountData.role;
        const status = response.data.accountData.status;
        admissionLoginHelper.saveToken(token);
        admissionLoginHelper.saveBasicAccountInfo(accountId, username, role, status);
      }

      // //Notification of successfull login
      // notification.setNotification({
      //   type: response.data.success,
      //   message: response.data.message,
      // });

      router.push('/dashboard'); // Redirecting to dashboard
    } else {
      console.log('Input data is incorrect.');
    }
  } catch (error) {
    console.error('The entry could not have been verificated.', error);
  } finally {
    credentials.resetCredentials(); //Cleaning credential store
  }
};

onMounted(()=>{
  admissionLoginHelper.clearLocalStorage()
})
</script>
<style scoped></style>
