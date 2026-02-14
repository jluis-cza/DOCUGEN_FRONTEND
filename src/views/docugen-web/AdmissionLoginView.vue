<template>
  <v-container>
    <v-card class="mx-auto" max-width="400" :loading="loading" variant="elevated">
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
            type="password"
            autocomplete="current-password"
            :rules="[RULE_TEXT_REQUIRED, RULE_PASSWORD_INPUT]"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">Iniciar sesión</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { RULES } from '../../helpers/rules.js';
import { SERVICES } from '../../constants/services.js';
import { ref } from 'vue';
import { useSession } from '../../composables/docugen-web/useSession.js';
import { useTokenStore } from '../../stores/docugen-web/tokenStore.js';
import { useSessionStore } from '../../stores/docugen-web/sessionStore.js';
import { useAccountStore } from '../../stores/docugen-web/accountStore.js';
import { useRouter } from 'vue-router';

const RULE_TEXT_REQUIRED = RULES.text.input.required;
const RULE_EMAIL_INPUT = RULES.text.input.email;
const RULE_USERNAME_INPUT = RULES.text.input.username;
const RULE_PASSWORD_INPUT = RULES.text.input.password;
const tokenStore = useTokenStore();
const sessionStore = useSessionStore();
const accountStore = useAccountStore();
const credentialsDefaultData = SERVICES.payload.docugen_web.admission.account_credentials;
const credentialsData = ref(JSON.parse(JSON.stringify(credentialsDefaultData)));
const identifier = ref('');
const form = ref(null);
const router = useRouter();
const { session, account, token, actions, loading, success } = useSession();

const RULE_TEXT_IDENTIFIER = (value) => {
  const mailRuleVerdict = RULE_EMAIL_INPUT(value);
  const usernameRuleVerdict = RULE_USERNAME_INPUT(value);

  if (mailRuleVerdict === true) {
    credentialsData.value.user.email = identifier.value;
    credentialsData.value.username = '';
    console.log('Es un email!');
    return true;
  }
  if (usernameRuleVerdict === true) {
    credentialsData.value.user.email = '';
    credentialsData.value.username = identifier.value;
    console.log('Es un username!');
    return true;
  }
  return mailRuleVerdict.replace(' no válido.', ' o ') + usernameRuleVerdict;
};
const login = async () => {
  try {
    const { valid } = await form.value.validate(); // Checking mistakes in imput data
    if (valid) {
      await actions.sessionStarter(credentialsData.value);
      if (success.value) {
        tokenStore.setToken(token.value);
        sessionStore.setSession(session.value);
        accountStore.setAccount(account.value);
        credentialsData.value = credentialsDefaultData;
        await router.push('/dashboard'); // Redirecting to dashboard
      }
    }
  } catch (error) {
    console.error('Error in login process.', error.message);
    throw error;
  }
};
</script>
