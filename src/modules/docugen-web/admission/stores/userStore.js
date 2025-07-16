import { defineStore } from 'pinia';
import { ref } from 'vue';
// import { userComposable } from '../composables/userComposable';

export const useUserStore = defineStore('user', () => {
  const states = {};
  const getters = {};
  const actions = {};

  states.user.name = ref('');
  states.user.token = ref('');
  states.user.role = ref('');

  actions.saveUser = (user) => {
    //Saving to the store
    states.user.name = user.name;
    states.user.email = user.email;
    states.user.token = user.token;

    //Saving to the localstorage
    window.localStorage.setItem('name', user.name);
    window.localStorage.setItem('token', user.token);
    window.localStorage.setItem('rol', user.role);
  };
  // actions.loginUser = (user) => {
  //   //llamar al post
  // };

  return {
    states,
    getters,
    actions,
  };
});
