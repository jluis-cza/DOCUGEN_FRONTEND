import assert from 'node:assert/strict';
import { ref } from 'vue';
import { test } from 'node:test';
import { useTemplateParameters } from '../src/composables/docugen-app/useTemplateParameters.js';

test('parameter editing stays synchronized with template placeholders and history', () => {
  const historySnapshots = [];
  const template = ref({
    elements: [
      {
        id: 'name-field',
        type: 'text',
        placeholderKey: 'name',
        text: 'Hello {{name}}',
        src: '',
        qrValue: '',
      },
    ],
    metadata: {
      dynamicParameters: [{ key: 'name', label: 'Name', type: 'text', required: true }],
    },
  });
  const parameters = useTemplateParameters({
    template,
    pushHistory: () => historySnapshots.push(JSON.stringify(template.value)),
  });

  assert.equal(parameters.buildDynamicKey('text'), 'param1');
  parameters.renameDynamicParameter(parameters.dynamicParameters.value[0], 'customer name');

  assert.equal(template.value.elements[0].placeholderKey, 'customer_name');
  assert.equal(template.value.elements[0].text, 'Hello {{customer_name}}');
  assert.equal(parameters.dynamicParameters.value[0].key, 'customer_name');

  parameters.setParameterAllowedValues(parameters.dynamicParameters.value[0], 'one, two');
  assert.deepEqual(parameters.dynamicParameters.value[0].allowedValues, ['one', 'two']);
  parameters.addDynamicParameter();
  assert.deepEqual(
    parameters.dynamicParameters.value.map(({ key }) => key),
    ['customer_name', 'param1']
  );
  parameters.removeDynamicParameter('customer_name');

  assert.equal(template.value.elements[0].placeholderKey, '');
  assert.equal(template.value.elements[0].text, 'Hello ');
  assert.deepEqual(
    parameters.dynamicParameters.value.map(({ key }) => key),
    ['param1']
  );
  assert.equal(historySnapshots.length, 4);
});
