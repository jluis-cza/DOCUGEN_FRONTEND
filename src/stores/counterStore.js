import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const states = {};
  const getters = {};
  const actions = {};
  //Stats
  states.count = ref(0);
  states.name = ref('Final counter');
  states.vector = ref([0]);
  //Getters
  getters.count = computed(() => states.count.value);
  getters.doubleCount = computed(() => states.count.value * 2);
  //Actions
  actions.increment = () => {
    return states.count.value++;
  };
  actions.decrement = () => {
    return states.count.value--;
  };
  actions.addElement = () => {
    return states.vector.value.push(states.vector.value.length);
  };
  return {
    states,
    getters,
    actions,
  };
});
