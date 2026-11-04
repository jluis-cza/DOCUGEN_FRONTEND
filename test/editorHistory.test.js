import assert from 'node:assert/strict';
import { test } from 'node:test';
import { useEditorHistory } from '../src/composables/docugen-app/useEditorHistory.js';

test('undo and redo restore snapshots in order', () => {
  const restored = [];
  const history = useEditorHistory({ applySnapshot: (snapshot) => restored.push(snapshot) });

  history.reset('initial');
  history.push('edited');

  assert.equal(history.canUndo.value, true);
  assert.equal(history.canRedo.value, false);
  assert.equal(history.undo(), true);
  assert.deepEqual(restored, ['initial']);
  assert.equal(history.canUndo.value, false);
  assert.equal(history.canRedo.value, true);
  assert.equal(history.redo(), true);
  assert.deepEqual(restored, ['initial', 'edited']);
  assert.equal(history.canRedo.value, false);
});

test('a new edit after undo clears the redo branch', () => {
  const history = useEditorHistory({ applySnapshot: () => {} });
  history.reset('initial');
  history.push('first edit');
  history.undo();
  history.push('new branch');

  assert.equal(history.canUndo.value, true);
  assert.equal(history.canRedo.value, false);
  assert.equal(history.redo(), false);
});

test('history retains only the configured number of snapshots', () => {
  const restored = [];
  const history = useEditorHistory({
    applySnapshot: (snapshot) => restored.push(snapshot),
    limit: 2,
  });
  history.reset('initial');
  history.push('second');
  history.push('third');

  history.undo();
  history.undo();

  assert.deepEqual(restored, ['second']);
  assert.equal(history.canUndo.value, false);
});
