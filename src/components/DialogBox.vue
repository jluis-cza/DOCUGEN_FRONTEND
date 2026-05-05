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
      <v-card-text>
        {{ text }}
      </v-card-text>
      <v-card-actions>
        <template v-for="(action, i) in actions" :key="i">
          <v-btn variant="tonal" class="mx-2" @click="selectAction(action.key)">
            {{ action.name }}
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, computed, watch, toRaw } from 'vue';
import { useDialogBoxStore } from '../stores/dialogBoxStore.js';

const dialogBoxStore = useDialogBoxStore();
const onReception = computed(() => dialogBoxStore.getDialogBox.metadata.isRequested);
// Layout
const showDialogBox = ref(false);
const title = ref('');
const icon = ref('');
const text = ref('');
const actions = ref([]);

const setDialogBox = () => {
  title.value = dialogBoxStore.getDialogBox.data.title;
  icon.value = dialogBoxStore.getDialogBox.data.icon;
  text.value = dialogBoxStore.getDialogBox.data.text;
  actions.value = dialogBoxStore.getDialogBox.data.actions;
  showDialogBox.value = true;
  dialogBoxStore.setDialogBox({ metadata: { isShowing: true } });
};

const selectAction = (key) => {
  dialogBoxStore.resolveDialogBox(key);
  showDialogBox.value = false;
  dialogBoxStore.setDialogBox({ metadata: { isShowing: false } });
};

watch(onReception, (newValue, oldValue) => {
  if (oldValue === false && newValue === true) setDialogBox();
});
</script>
