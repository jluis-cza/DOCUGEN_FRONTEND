<template>
  <v-container class="w-100 h-100 d-flex flex-column">
    <!-- Home link -->
    <div>
      <RouterLink to="/">Ir a la página de inicio</RouterLink>
    </div>
    <!-- Form -->
    <div class="flex-grow-1 d-flex w-100 h-100 align-center justify-center">
      <v-card width="400" :loading="loading" variant="elevated">
        <v-card-title>Inicio de sesión</v-card-title>
        <v-form ref="form" validate-on="submit lazy" @submit.prevent="login">
          <v-card-text>
            <v-text-field
              v-model="identifier"
              label="Correo o Nombre de usuario"
              type="text"
              autocomplete="username"
              :rules="[RULE_TEXT_REQUIRED, RULE_TEXT_IDENTIFIER]"
            >
            </v-text-field>
            <v-text-field
              v-model="credentialsData.password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :rules="[RULE_TEXT_REQUIRED, RULE_PASSWORD_INPUT]"
              required
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit">Iniciar sesión</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { RULES } from '../../helpers/rules.js';
import { SERVICES } from '../../constants/services.js';
import { ref } from 'vue';
import { useMySession } from '../../composables/docugen-web/useMySession.js';
import { useRouter, RouterLink } from 'vue-router';

const RULE_TEXT_REQUIRED = RULES.text.input.required;
const RULE_EMAIL_INPUT = RULES.text.input.email;
const RULE_USERNAME_INPUT = RULES.text.input.username;
const RULE_PASSWORD_INPUT = RULES.text.input.password;

const getCredentialsDefaultData = () =>
  JSON.parse(JSON.stringify(SERVICES.payload.docugen_web.admission.start_session));
const credentialsData = ref(getCredentialsDefaultData());
const identifier = ref('');
const form = ref(null);
const router = useRouter();
const { actions, loading, success } = useMySession();
const showPassword = ref(false);

const RULE_TEXT_IDENTIFIER = (value) => {
  const mailRuleVerdict = RULE_EMAIL_INPUT(value);
  const usernameRuleVerdict = RULE_USERNAME_INPUT(value);

  if (mailRuleVerdict === true) {
    credentialsData.value.user.email = identifier.value;
    credentialsData.value.username = '';
    return true;
  }
  if (usernameRuleVerdict === true) {
    credentialsData.value.user.email = '';
    credentialsData.value.username = identifier.value;
    return true;
  }
  return mailRuleVerdict.replace(' no válido.', ' o ') + usernameRuleVerdict;
};
const login = async () => {
  try {
    const { valid } = await form.value.validate(); // Checking mistakes in imput data
    if (valid) {
      await actions.mySessionStarter(credentialsData.value);
      if (success.value) {
        credentialsData.value = getCredentialsDefaultData();
        await router.push('/dashboard');
      }
    }
  } catch (error) {
    console.error('Error in login process.', error.message);
    throw error;
  }
};
</script>
