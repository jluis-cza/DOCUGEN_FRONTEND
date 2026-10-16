import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getTextContentHeight,
  getTextLineHeight,
  parseBoldMarkup,
  parseTextMarkup,
  wrapTextToWidth,
} from '../src/helpers/docugen-app/textLayout.js';

test('wraps plain text against measured font width and preserves explicit newlines', () => {
  const lines = wrapTextToWidth('wide word\nlast line', 6, (text) => text.length * 3);

  assert.deepEqual(lines.map((line) => line.text), ['wi', 'de', 'wo', 'rd', 'la', 'st', 'li', 'ne']);
});

test('parses inline styles and measures styled runs without exposing markup', () => {
  const source = 'Normal <bold>bold</bold> <semibold>semi</semibold> <italic>italic</italic> <underlined>under</underlined>';
  const runs = parseTextMarkup(source);
  const lines = wrapTextToWidth(
    source,
    100,
    (text, style) =>
      Array.from(text).length *
      (style.bold ? 10 : style.semibold ? 8 : style.italic ? 6 : 5)
  );

  assert.deepEqual(runs, [
    { text: 'Normal ', bold: false, semibold: false, italic: false, underlined: false },
    { text: 'bold', bold: true, semibold: false, italic: false, underlined: false },
    { text: ' ', bold: false, semibold: false, italic: false, underlined: false },
    { text: 'semi', bold: false, semibold: true, italic: false, underlined: false },
    { text: ' ', bold: false, semibold: false, italic: false, underlined: false },
    { text: 'italic', bold: false, semibold: false, italic: true, underlined: false },
    { text: ' ', bold: false, semibold: false, italic: false, underlined: false },
    { text: 'under', bold: false, semibold: false, italic: false, underlined: true },
  ]);
  assert.equal(
    lines
      .map((line) => line.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim(),
    'Normal bold semi italic under'
  );
  assert.ok(lines.some((line) => line.runs.some((run) => run.bold || run.semibold)));
  assert.deepEqual(parseBoldMarkup('a <bold>b</bold> c'), [
    { text: 'a ', bold: false },
    { text: 'b', bold: true },
    { text: ' c', bold: false },
  ]);
});

test('calculates text height from the rendered line count', () => {
  assert.equal(getTextLineHeight(20), 27);
  assert.equal(getTextContentHeight(3, 20), 81);
  assert.equal(getTextLineHeight(20, 32), 32);
  assert.equal(getTextContentHeight(3, 20, 32), 91);
  assert.equal(getTextLineHeight(20, 10), 20);
});
