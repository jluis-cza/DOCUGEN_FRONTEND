<template>
  <v-container>
    <h1>Registro</h1>
    <p>Por favor ingrese sus datos.</p>
    <v-form ref="form" validate-on="submit lazy" @submit.prevent="register">
      <v-text-field
        v-model="accountData.username"
        label="Nombre de usuario"
        :rules="[RULES.text.input.required]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.name"
        label="Nombres"
        :rules="[RULES.text.input.required]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.lastname"
        label="Apellidos"
        :rules="[RULES.text.input.required]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.email"
        label="Correo"
        type="email"
        :rules="[RULES.text.input.required, RULES.text.input.email]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.password"
        label="Contraseña"
        type="password"
        :rules="[RULES.text.input.required]"
        required
      ></v-text-field>
      <v-text-field
        v-model="accountData.repeatedPassword"
        label="Reingrese la contraseña"
        type="password"
        :rules="[RULES.text.input.required]"
        required
      ></v-text-field>

      <v-btn color="primary" type="submit">Registrar cuenta</v-btn>
    </v-form>
  </v-container>
</template>
<script setup>
import { RULES } from '../../helpers/rules';
import { ref } from 'vue';
import { useAccountStore } from '@/stores/docugen-web/accountStore'

const account = useAccountStore()
const accountData = ref({
  username: '',
  name: '',
  lastname: '',
  email: '',
  password: '',
  repeatedPassword: '',
});
const form = ref(null);

const register = async () => {
  try {
    // Validating form entries
    const { valid } = await form.value.validate();
    if (valid) {
      console.log({ valid: valid });
      if (accountData.value.password === accountData.value.repeatedPassword) {
        const response0 = account.resetAccount()
        const response1 = account.setAccount(accountData.value)
        accountData.value = {} // cleaning the form entries
        const response2 = account.registerAccount(accountData.value)
        console.log('Sending data to the server.');
      } else {
        console.log("The passwords aren't the same.");
      }
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
