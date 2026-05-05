import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SERVICES } from '../constants/services.js';
import { deepMerge } from '../helpers/utils.js';
import { toRaw } from 'vue';

const dialogBoxDefaultData = { ...SERVICES.payload.general.dialog_box };

export const useDialogBoxStore = defineStore('dialogBox', () => {
  // States
  const dialogBox = ref(JSON.parse(JSON.stringify(dialogBoxDefaultData)));
  let _resolve = null;

  //Getters
  const getDialogBox = computed(() => dialogBox.value);
  // Actions
  const setDialogBox = (options) => {
    dialogBox.value = deepMerge(toRaw(dialogBox.value), options || {});
  };
  const resetDialogBox = () => {
    dialogBox.value = dialogBoxDefaultData;
    _resolve = null;
  };
  const openDialogBox = (data) => {
    const dialogData = {
      data,
      metadata: {
        isRequested: true,
        isResolved: false,
      },
    };
    setDialogBox(dialogData);
    return new Promise((resolve) => {
      _resolve = resolve; // Saving the resolve function to use it in other place
    });
  };
  const resolveDialogBox = (key) => {
    if (_resolve) {
      _resolve(key);
      _resolve = null;
    }
    setDialogBox({ metadata: { isRequested: false, isResolved: true } });
  };
  return {
    //Getters
    getDialogBox,
    //Actions
    setDialogBox,
    resetDialogBox,
    openDialogBox,
    resolveDialogBox,
  };
});

// General structure
// dialog_box:{
//   metadata:{
//     isResolved: false,
//     isRequested: false,
//     isShowing: false
//   },
//   data:{
//     title:'',
//     icon: '',
//     text: '',
//     actions: []
//   }
// }
