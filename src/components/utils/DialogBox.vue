<template>
  <v-dialog v-model="showDialogBox" persistent max-width="400">
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
                      :rules="getRules( parameter.ruleSet)"
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
                  <!-- <template v-if="parameter.class === 'textarea-1'">
                  <v-textarea
                    required
                    v-model="parameter.value"
                    :label="parameter.label"
                    rows="3"
                    variant="filled"
                    auto-grow
                  ></v-textarea>
                </template> -->
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
              @click="selectAction(action.key)"
            >
              {{ action.name }}
            </v-btn>
          </template>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, computed, watch, toRaw } from 'vue';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';
import { RULES } from '../../helpers/rules.js';

const dialogBoxStore = useDialogBoxStore();
const onReception = computed(() => dialogBoxStore.getDialogBox.metadata.isRequested);
// Layout
const showDialogBox = ref(false);
const showData = ref(false);
const title = ref('');
const icon = ref('');
const text = ref('');
const hasParameters = ref(false);
const parameters = ref([]);
const parametersGroupsInfo = ref([]);
const actions = ref([]);
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
};
const form = ref(null);

const setDialogBox = () => {
  title.value = dialogBoxStore.getDialogBox.data.title;
  icon.value = dialogBoxStore.getDialogBox.data.icon;
  text.value = dialogBoxStore.getDialogBox.data.text;
  actions.value = dialogBoxStore.getDialogBox.data.actions;
  showDialogBox.value = true;
};

const selectAction = async (key) => {
  const { valid } = await form.value.validate();
  dialogBoxStore.resolveDialogBoxData(key, parameters.value, valid);
  const exit = await dialogBoxStore.requestDialogBoxProcedure();
  if (exit) {
    await form.value.reset();
    showDialogBox.value = false;
    dialogBoxStore.resetDialogBox();
  }
};

const processParameters = (receivedParameters) => {
  parameters.value = [...receivedParameters].sort((a, b) => {
    const compareGroup = a.group.localeCompare(b.group);
    if (compareGroup !== 0) return compareGroup;
    return Number(a.member) - Number(b.member);
  });

  parametersGroupsInfo.value = Object.values(
    receivedParameters.reduce((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = { name: item.group, members: 0 };
      }
      acc[item.group].members += 1;
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
    const receivedParameters = dialogBoxStore.getDialogBox.data.parameters;
    hasParameters.value = receivedParameters.length > 0 ? true : false;
    if (hasParameters.value) processParameters(receivedParameters);
    setDialogBox();
  }
});
</script>
