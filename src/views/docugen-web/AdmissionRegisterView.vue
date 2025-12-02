<template>
  <v-container>
    <h1>Registro</h1>
    <p>Por favor ingrese sus datos.</p>
    <v-form ref="form" validate-on="submit lazy" @submit.prevent="register">
      <v-text-field
        v-model="accountData.username"
        label="Nombre de usuario"
        :rules="[RULE_TEXT_REQUIRED]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.user.name"
        label="Nombres"
        :rules="[RULE_TEXT_REQUIRED]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.user.lastname"
        label="Apellidos"
        :rules="[RULE_TEXT_REQUIRED]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.user.email"
        label="Correo"
        type="email"
        :rules="[RULE_TEXT_REQUIRED, RULE_EMAIL_INPUT]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.password"
        label="Contraseña"
        type="password"
        :rules="[RULE_TEXT_REQUIRED]"
        required
      ></v-text-field>
      <v-text-field
        v-model="passwordConfirmation"
        label="Reingrese la contraseña"
        type="password"
        :rules="[RULE_TEXT_REQUIRED]"
        required
      ></v-text-field>

      <v-btn color="primary" type="submit">Registrar cuenta</v-btn>
    </v-form>
  </v-container>
</template>
<script setup>
import { RULES } from '../../helpers/rules.js';
import { SERVICES } from '../../constants/services.js';
import { ref } from 'vue';
import { useAccountStore } from '@/stores/docugen-web/accountStore.js';
import { useRouter } from 'vue-router';


const RULE_TEXT_REQUIRED = RULES.text.input.required;
const RULE_EMAIL_INPUT = RULES.text.input.email;
const account = useAccountStore();
// const accountDefaultData = SERVICES.payload.docugen_web.admission.account;
// const accountDefaultData = JSON.parse(JSON.stringify(SERVICES.payload.docugen_web.admission.account))
const accountDefaultData = SERVICES.payload.docugen_web.admission.account;
const accountData = ref(JSON.parse(JSON.stringify(accountDefaultData)));
const passwordConfirmation = ref('');
const form = ref(null);
const router = useRouter();

const register = async () => {
  try {
    // Validating form entries
    const { valid } = await form.value.validate();
    if (valid) {
      console.log({ valid: valid });
      if (accountData.value.password === passwordConfirmation.value) {
        const accountStoreReset = account.resetAccount();
        const accountStoreSet = account.setAccount(accountData.value);
        const accountStored = account.getAccount;
        const response = await account.registerAccount(accountStored);
        accountData.value = accountDefaultData; //cleaning form
        // //Notification of successfull login
        // notification.setNotification({
        //   type: response.data.success,
        //   message: response.data.message,
        // });
        router.push('/'); // Redirecting to home
      } else {
        console.log("The passwords aren't the same.");
      }
    } else {
      console.log('Input data is incorrect.');
    }
  } catch (error) {
    console.error('The entry could not have been verificated.', error);
  } finally {
    account.resetAccount(); //cleaning account store
    passwordConfirmation.value = ''; //cleaning field
  }
};
</script>
<style scoped></style>
