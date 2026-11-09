import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatSystemUptime } from '../src/helpers/utils.js';

test('formats server uptime as hours and minutes', () => {
  assert.equal(formatSystemUptime(9000), '2 horas 30 minutos');
  assert.equal(formatSystemUptime(3660), '1 hora 1 minuto');
  assert.equal(formatSystemUptime(59), '0 horas 0 minutos');
});

test('reports unavailable uptime for invalid values', () => {
  assert.equal(formatSystemUptime(null), 'No disponible');
  assert.equal(formatSystemUptime(Number.NaN), 'No disponible');
  assert.equal(formatSystemUptime(-1), 'No disponible');
});
