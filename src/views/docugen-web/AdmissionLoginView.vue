<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Inicio de sesión</h1>
        <p>Por favor ingrese sus credenciales para iniciar sesión.</p>
        <v-form ref="form" validate-on="submit lazy" @submit.prevent="login">
          <v-text-field
            v-model="credential.email"
            label="Correo"
            type="email"
            :rules="[RULES.text.input.email, RULES.text.input.required]"
          ></v-text-field>
          <v-text-field
            v-model="credential.password"
            label="Contraseña"
            type="password"
            :rules="[RULES.text.input.required]"
          ></v-text-field>
          <v-btn color="primary" type="submit">Iniciar sesión</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref } from 'vue';
import { RULES } from '../../helpers/rules';
import { useAccountStore } from '../../stores/docugen-web/admissionAccountStore';

const credential = ref({
  email: '',
  password: '',
});
const form = ref(null);
const account = useAccountStore()

const login = async () => {
  try {
    // Checking mistakes in imput data
    const { valid } = await form.value.validate();
    if (valid) {
      //Saving to stores
      account.loginAccount(credential.value)

      console.log({ valid: valid });
      console.log('It is sending data to the Server');
    } else {
      console.log('Input data is incorrect.');
    }
  } catch (error) {
    console.error('The entry could not have been verificated.', error);
  }
  // Saving public credential in local storage

  // Eliciting Token
};
</script>
<style scoped></style>
