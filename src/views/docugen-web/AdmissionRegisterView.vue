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

const RULE_TEXT_REQUIRED = RULES.text.input.required;
const RULE_EMAIL_INPUT = RULES.text.input.email;
const account = useAccountStore();
const accountDefaultData = SERVICES.payload.docugen_web.admission.account;
const accountData = ref(accountDefaultData);
const passwordConfirmation = ref('');
const form = ref(null);

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
        accountData.value = accountDefaultData;
        const response = await account.registerAccount(accountStored);
        if(response){
          account.resetAccount();
          console.log('Data was sent to the server.');
          console.log('Registration response:', response.data);
        }
      } else {
        console.log("The passwords aren't the same.");
      }
       passwordConfirmation.value = '' 
    } else {
      console.log('Input data is incorrect.');
    }
  } catch (error) {
    console.error('The entry could not have been verificated.', error);
  }

  // Saving public credentials in local storage

  // Eliciting Token
};
</script>
<style scoped></style>
