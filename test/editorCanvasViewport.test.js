import assert from 'node:assert/strict';
import { ref } from 'vue';
import { test } from 'node:test';
import { useEditorCanvasViewport } from '../src/composables/docugen-app/useEditorCanvasViewport.js';

const createViewport = ({
  width = 800,
  height = 1000,
  shellWidth = 628,
  shellHeight = 828,
  pageViewportWidth = 620,
  pageViewportHeight = 820,
} = {}) => {
  const svg = {
    setPointerCapture: (pointerId) => {
      svg.capturedPointerId = pointerId;
    },
    capturedPointerId: null,
  };
  const options = {
    width: ref(width),
    height: ref(height),
    canvasShell: ref({ clientWidth: shellWidth, clientHeight: shellHeight }),
    pageViewport: ref({
      clientWidth: pageViewportWidth,
      clientHeight: pageViewportHeight,
      getBoundingClientRect: () => ({ left: 10, top: 20 }),
    }),
    svg: ref(svg),
    pageSelected: ref(false),
    panMode: ref(false),
  };

  return { ...useEditorCanvasViewport(options), options, svg };
};

test('fits and centers the page and keeps zoom within toolbar bounds', () => {
  const viewport = createViewport();
  viewport.updateCanvasShellSize();
  viewport.fitPageToViewport();
  viewport.centerPageInViewport();

  assert.equal(viewport.zoom.value, 0.77);
  assert.equal(viewport.panOffset.value.x, -8);
  assert.equal(viewport.panOffset.value.y, 15);

  viewport.zoomIn();
  assert.equal(viewport.zoom.value, 0.87);
  for (let index = 0; index < 30; index += 1) viewport.zoomIn();
  assert.equal(viewport.zoom.value, 2);
  for (let index = 0; index < 40; index += 1) viewport.zoomOut();
  assert.equal(viewport.zoom.value, 0.25);
});

test('pans only the captured pointer and releases pan state on pointer end', () => {
  const viewport = createViewport({ width: 300, height: 300 });
  viewport.updateCanvasShellSize();
  viewport.options.panMode.value = true;
  const event = {
    button: 0,
    pointerId: 7,
    clientX: 100,
    clientY: 200,
    preventDefault() {},
    stopPropagation() {},
  };

  viewport.handleCanvasPointerDown(event);
  assert.equal(viewport.svg.capturedPointerId, 7);
  assert.equal(viewport.movePagePan({ pointerId: 8, clientX: 140, clientY: 190 }), false);
  assert.equal(viewport.movePagePan({ pointerId: 7, clientX: 120, clientY: 190 }), true);
  assert.deepEqual(viewport.panOffset.value, { x: 20, y: -10 });

  viewport.stopPagePan({ pointerId: 8 });
  assert.notEqual(viewport.pagePanDrag.value, null);
  viewport.stopPagePan({ pointerId: 7 });
  assert.equal(viewport.pagePanDrag.value, null);
});

test('shift-wheel zoom keeps the point below the cursor stable and requires page selection', () => {
  const viewport = createViewport({ width: 500, height: 500 });
  viewport.updateCanvasShellSize();
  let prevented = false;
  const event = {
    shiftKey: true,
    deltaY: -100,
    clientX: 110,
    clientY: 120,
    preventDefault: () => {
      prevented = true;
    },
  };

  viewport.handleCanvasWheel(event);
  assert.equal(prevented, false);
  assert.equal(viewport.zoom.value, 1);

  viewport.options.pageSelected.value = true;
  viewport.handleCanvasWheel(event);

  assert.equal(prevented, true);
  assert.equal(viewport.zoom.value, 1.16);
  assert.ok(Math.abs((100 - viewport.panOffset.value.x) / viewport.zoom.value - 100) < 0.1);
  assert.ok(Math.abs((100 - viewport.panOffset.value.y) / viewport.zoom.value - 100) < 0.1);
});

test('ruler ticks remain bounded and update with viewport changes', () => {
  const viewport = createViewport({ shellWidth: 5000, shellHeight: 5000 });
  viewport.updateCanvasShellSize();

  assert.ok(viewport.horizontalRulerTicks.value.length <= 500);
  assert.ok(viewport.verticalRulerTicks.value.length <= 500);
  assert.ok(viewport.horizontalRulerTicks.value.length > 0);

  viewport.zoom.value = 2;
  assert.notEqual(viewport.horizontalRulerTicks.value.length, 0);
});
