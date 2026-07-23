import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SERVICES } from '../../constants/services.js';
import { deepMerge } from '../../helpers/utils.js';
import { toRaw } from 'vue';

// const dialogBoxDefaultData = { ...SERVICES.payload.utils.dialog_box };
const getInitialData = () => JSON.parse(JSON.stringify(SERVICES.payload.utils.dialog_box));

export const useDialogBoxStore = defineStore('dialogBox', () => {
  // States
  // const dialogBox = ref(JSON.parse(JSON.stringify(dialogBoxDefaultData)));
  const dialogBox = ref(getInitialData());
  let _data = null;
  let _procedure = null;

  //Getters
  const getDialogBox = computed(() => dialogBox.value);

  // Actions
  const setDialogBox = (options) => {
    dialogBox.value = deepMerge(toRaw(dialogBox.value), options || {});
  };
  const resetDialogBox = () => {
    dialogBox.value = getInitialData();
    _data = null;
    _procedure = null;
  };
  const openDialogBox = () => {
    const dialogData = {
      metadata: {
        isRequested: true,
      },
    };
    setDialogBox(dialogData);
  };
  const requestDialogBoxData = () => {
    return new Promise((resolve) => {
      _data = resolve;
    });
  };
  const resolveDialogBoxData = (key, parameters, isValid) => {
    if (_data) {
      _data({ key, parameters, isValid });
      _data = null;
    }
  };
  const requestDialogBoxProcedure = () => {
    return new Promise((resolve) => {
      _procedure = resolve;
    });
  };
  const resolveDialogBoxProcedure = (exit) => {
    if (_procedure) {
      _procedure(exit);
      _procedure = null;
    }
  };

  return {
    //Getters
    getDialogBox,
    //Actions
    setDialogBox,
    resetDialogBox,
    openDialogBox,
    requestDialogBoxData,
    resolveDialogBoxData,
    requestDialogBoxProcedure,
    resolveDialogBoxProcedure,
  };
});

// General structure
// dialog_box:{
//   metadata:{
//     isRequested: false,
//   },
//   data:{
//     title:'',
//     icon: '',
//     text: '',
//     parameters: [],
//     actions: []
//   }
// }
// Parameter general structure
// [
//  {key:'', label:'', hint:'', value, unit, valueSet:[], unitSet:[], ruleSet:[], group:'', member:'', type:'', class:'', enabled: false  },
// ...]
