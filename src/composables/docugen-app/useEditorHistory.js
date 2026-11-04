import { computed, ref } from 'vue';

export const useEditorHistory = ({ applySnapshot, limit = 40 }) => {
  if (typeof applySnapshot !== 'function') {
    throw new TypeError('An applySnapshot function is required.');
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError('The history limit must be a positive integer.');
  }

  const history = ref([]);
  const future = ref([]);
  const canUndo = computed(() => history.value.length > 1);
  const canRedo = computed(() => future.value.length > 0);

  const push = (snapshot) => {
    if (typeof snapshot !== 'string') {
      throw new TypeError('History snapshots must be strings.');
    }
    if (!history.value.length || history.value[history.value.length - 1] !== snapshot) {
      history.value.push(snapshot);
      if (history.value.length > limit) history.value.shift();
    }
    future.value = [];
  };

  const reset = (snapshot) => {
    if (typeof snapshot !== 'string') {
      throw new TypeError('History snapshots must be strings.');
    }
    history.value = [snapshot];
    future.value = [];
  };

  const undo = () => {
    if (!canUndo.value) return false;
    future.value.push(history.value.pop());
    applySnapshot(history.value[history.value.length - 1]);
    return true;
  };

  const redo = () => {
    if (!canRedo.value) return false;
    const snapshot = future.value.pop();
    history.value.push(snapshot);
    applySnapshot(snapshot);
    return true;
  };

  return { canUndo, canRedo, push, reset, undo, redo };
};
