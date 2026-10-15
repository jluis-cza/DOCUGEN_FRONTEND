<template>
  <v-dialog
    v-model="showDialogBox"
    persistent
    max-width="400"
    :transition="{ component: Transition, name: 'fade-transition' }"
  >
    <v-card>
      <v-card-item class="text-left text-dark">
        <template #prepend>
          <v-icon :icon="icon"></v-icon>
        </template>
        <v-card-title>
          {{ title }}
        </v-card-title>
      </v-card-item>
      <v-card-text class="py-0">
        {{ text }}
      </v-card-text>

      <v-form ref="form">
        <!-- Parameters configuration area -->
        <template v-if="hasParameters">
          <v-card-item>
            <v-list>
              <template v-for="parameter in parameters" :key="parameter.key">
                <template v-if="parametersGroupsInfo.length > 1 && parameter.member === 1">
                  <div class="font-weight-medium">{{ parameter.group }}</div>
                </template>
                <v-list-item class="px-0">
                  <!-- textfield-1 -->
                  <template v-if="parameter.class === 'textfield-1'">
                    <v-text-field
                      v-model="parameter.value"
                      :label="parameter.label"
                      :rules="getRules(parameter.ruleSet)"
                      :validate-on="parameter.evaluateOn"
                      :type="parameter.type"
                      clearable
                      required
                    >
                      <template #append-inner v-if="parameter.info">
                        <v-tooltip :text="parameter.info" location="bottom">
                          <template #activator="{ props }">
                            <v-icon v-bind="props" icon="mdi-information-outline"></v-icon>
                          </template>
                        </v-tooltip>
                      </template>
                    </v-text-field>
                  </template>

                  <!-- textarea-1 -->
                  <template v-if="parameter.class === 'textarea-1'">
                    <v-textarea
                      v-model="parameter.value"
                      :label="parameter.label"
                      :rules="getRules(parameter.ruleSet)"
                      :validate-on="parameter.evaluateOn"
                      :rows="parameter.rows"
                      :counter="parameter.counter"
                      variant="filled"
                      clearable
                      required
                      no-resize
                    ></v-textarea>
                  </template>
                </v-list-item>
                <v-divider></v-divider>
              </template>
            </v-list>
          </v-card-item>
        </template>

        <v-card-actions>
          <v-spacer></v-spacer>
          <template v-for="(action, i) in actions" :key="i">
            <v-btn
              variant="tonal"
              class="mx-2"
              :class="action.color"
              :disabled="isProcessing"
              :loading="processingAction === action.key"
              @click="selectAction(action.key)"
            >
              {{ action.name }}
            </v-btn>
          </template>
        </v-card-actions>
      </v-form>
      <v-alert v-if="interactionError" type="error" variant="tonal" class="ma-4">
        {{ interactionError }}
      </v-alert>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, computed, watch, Transition } from 'vue';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';
import { RULES } from '../../helpers/rules.js';

const dialogBoxStore = useDialogBoxStore();
const onReception = computed(() => dialogBoxStore.getDialogBox.metadata.isRequested);
// Layout
const showDialogBox = ref(false);
const title = ref('');
const icon = ref('');
const text = ref('');
const hasParameters = ref(false);
const parameters = ref([]);
const parametersGroupsInfo = ref([]);
const actions = ref([]);
const isProcessing = ref(false);
const processingAction = ref('');
const interactionError = ref('');
// Rules
const rules = {
  RULE_TEXT_REQUIRED: (value) => RULES.text.input.required(value),
  RULE_PASSWORD_INPUT: (value) => RULES.text.input.password(value),
  RULE_PASSWORD_VERIFICATION: async (value) => await RULES.text.input.passwordVerification(value),
  RULE_USERNAME_INPUT: (value) => RULES.text.input.username(value),
  RULE_USERNAME_AVAILABILITY: async (value) => await RULES.text.input.usernameAvailability(value),
  RULE_PASSWORD_MATCH: (value) =>
    RULES.text.input.match(
      () => parameters.value.find((p) => p.key === 'newPass')?.value || '',
      'Las contraseñas'
    )(value),
  RULE_NOTIFICATION_SUBJECT_MAX_CHARACTERS: async (value) =>
    RULES.text.input.notificationSubjectMaxCharacters(value),
  RULE_NOTIFICATION_MESSAGE_MAX_CHARACTERS: async (value) =>
    RULES.text.input.notificationMessageMaxCharacters(value),
};
const form = ref(null);

const setDialogBox = () => {
  const data = dialogBoxStore.getDialogBox.data;
  title.value = data.title || '';
  icon.value = data.icon || '';
  text.value = data.text || '';
  actions.value = Array.isArray(data.actions) ? data.actions : [];
  parameters.value = [];
  parametersGroupsInfo.value = [];
  hasParameters.value = false;
  interactionError.value = '';
  const receivedParameters = Array.isArray(data.parameters) ? data.parameters : [];
  hasParameters.value = receivedParameters.length > 0;
  if (hasParameters.value) processParameters(receivedParameters);
  showDialogBox.value = true;
};

const selectAction = async (key) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  processingAction.value = key;
  interactionError.value = '';

  try {
    let valid = true;
    if (key !== 'n' && hasParameters.value && form.value) {
      const validation = await form.value.validate();
      valid = validation.valid;
    }
    dialogBoxStore.resolveDialogBoxData(key, parameters.value, valid);
    const exit = await dialogBoxStore.requestDialogBoxProcedure();
    if (exit) {
      await form.value?.reset();
      showDialogBox.value = false;
      dialogBoxStore.resetDialogBox();
      parameters.value = [];
      parametersGroupsInfo.value = [];
      hasParameters.value = false;
    }
  } catch (error) {
    interactionError.value =
      error instanceof Error ? error.message : 'No se pudo completar la acción del diálogo.';
  } finally {
    isProcessing.value = false;
    processingAction.value = '';
  }
};

const processParameters = (receivedParameters) => {
  parameters.value = [...receivedParameters].sort((a, b) => {
    const compareGroup = String(a.group || '').localeCompare(String(b.group || ''));
    if (compareGroup !== 0) return compareGroup;
    return Number(a.member) - Number(b.member);
  });

  parametersGroupsInfo.value = Object.values(
    receivedParameters.reduce((acc, item) => {
      const group = item.group || '';
      if (!acc[group]) {
        acc[group] = { name: group, members: 0 };
      }
      acc[group].members += 1;
      return acc;
    }, {})
  );
};

// const getRules = (value, ruleSet) => {
//   const rulesArray = [];
//   for (const rule of ruleSet) {
//     rulesArray.push(rules[rule](value));
//   }
//   return rulesArray;
// };
const getRules = (ruleSet) => {
  if (!ruleSet || !Array.isArray(ruleSet)) return [];

  return ruleSet.map((ruleName) => {
    return (value) => {
      const ruleFn = rules[ruleName];
      return ruleFn ? ruleFn(value) : true;
    };
  });
};

watch(onReception, (newValue, oldValue) => {
  if (oldValue === false && newValue === true) {
    setDialogBox();
  }
});
</script>
