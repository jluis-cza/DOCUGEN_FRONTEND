import { computed, ref } from 'vue';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const RULER_ORIGIN = 28;

const getRulerStep = (zoomLevel) => {
  const targetStep = 60 / zoomLevel;
  const magnitude = 10 ** Math.floor(Math.log10(targetStep));
  const normalized = targetStep / magnitude;
  const multiple = normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : 5;
  return multiple * magnitude;
};

const getVisibleRulerTicks = (offset, zoomLevel, viewportLength) => {
  const step = getRulerStep(zoomLevel);
  const firstValue = Math.floor((-RULER_ORIGIN - offset) / (zoomLevel * step)) * step;
  const lastValue = Math.ceil((viewportLength - RULER_ORIGIN - offset) / (zoomLevel * step)) * step;
  const count = Math.max(0, Math.min(500, Math.floor((lastValue - firstValue) / step) + 1));

  return Array.from({ length: count }, (_, index) => ({
    value: Number((firstValue + index * step).toFixed(6)),
  }));
};

export const useEditorCanvasViewport = ({
  width,
  height,
  canvasShell,
  pageViewport,
  svg,
  pageSelected,
  panMode,
}) => {
  const canvasShellSize = ref({ width: 0, height: 0 });
  const zoom = ref(1);
  const panOffset = ref({ x: 0, y: 0 });
  const pagePanDrag = ref(null);

  const horizontalRulerTicks = computed(() =>
    getVisibleRulerTicks(panOffset.value.x, zoom.value, canvasShellSize.value.width)
  );
  const verticalRulerTicks = computed(() =>
    getVisibleRulerTicks(panOffset.value.y, zoom.value, canvasShellSize.value.height)
  );

  const updateCanvasShellSize = () => {
    if (!canvasShell.value) return;
    canvasShellSize.value = {
      width: canvasShell.value.clientWidth,
      height: canvasShell.value.clientHeight,
    };
  };

  const constrainPanOffset = (x, y, zoomLevel = zoom.value) => {
    const viewportWidth = Math.max(0, canvasShellSize.value.width - RULER_ORIGIN);
    const viewportHeight = Math.max(0, canvasShellSize.value.height - RULER_ORIGIN);
    const scaledWidth = width.value * zoomLevel;
    const scaledHeight = height.value * zoomLevel;
    const visibleWidth = Math.min(80, scaledWidth / 2);
    const visibleHeight = Math.min(80, scaledHeight / 2);

    return {
      x: Math.max(visibleWidth - scaledWidth, Math.min(x, viewportWidth - visibleWidth)),
      y: Math.max(visibleHeight - scaledHeight, Math.min(y, viewportHeight - visibleHeight)),
    };
  };

  const centerPageInViewport = () => {
    const viewportWidth = Math.max(0, canvasShellSize.value.width - RULER_ORIGIN);
    const viewportHeight = Math.max(0, canvasShellSize.value.height - RULER_ORIGIN);
    const centered = {
      x: (viewportWidth - width.value * zoom.value) / 2,
      y: (viewportHeight - height.value * zoom.value) / 2,
    };
    panOffset.value = constrainPanOffset(centered.x, centered.y);
  };

  const fitPageToViewport = () => {
    if (!pageViewport.value) return;

    const viewportWidth = Math.max(320, pageViewport.value.clientWidth - 8);
    const viewportHeight = Math.max(220, pageViewport.value.clientHeight - 8);
    const nextZoom = Math.min(viewportWidth / width.value, viewportHeight / height.value, 1);
    zoom.value = Number(Math.max(ZOOM_MIN, nextZoom).toFixed(2));
  };

  const zoomIn = () => {
    zoom.value = Math.min(ZOOM_MAX, Number((zoom.value + 0.1).toFixed(2)));
    panOffset.value = constrainPanOffset(panOffset.value.x, panOffset.value.y);
  };

  const zoomOut = () => {
    zoom.value = Math.max(ZOOM_MIN, Number((zoom.value - 0.1).toFixed(2)));
    panOffset.value = constrainPanOffset(panOffset.value.x, panOffset.value.y);
  };

  const resetZoom = () => {
    fitPageToViewport();
    centerPageInViewport();
  };

  const startPagePan = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!svg.value) return;

    svg.value.setPointerCapture?.(event.pointerId);
    pagePanDrag.value = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: panOffset.value.x,
      startPanY: panOffset.value.y,
    };
  };

  const handleCanvasPointerDown = (event) => {
    if (event.button === 1 || (event.button === 0 && panMode.value)) {
      startPagePan(event);
    }
  };

  const movePagePan = (event) => {
    if (pagePanDrag.value?.pointerId !== event.pointerId) return false;
    const drag = pagePanDrag.value;
    panOffset.value = constrainPanOffset(
      drag.startPanX + event.clientX - drag.startX,
      drag.startPanY + event.clientY - drag.startY
    );
    return true;
  };

  const stopPagePan = (event) => {
    if (pagePanDrag.value?.pointerId === event?.pointerId) {
      pagePanDrag.value = null;
    }
  };

  const handleCanvasWheel = (event) => {
    if (!pageSelected.value || !event.shiftKey || event.deltaY === 0) return;
    event.preventDefault();

    const previousZoom = zoom.value;
    const nextZoom = Math.max(
      ZOOM_MIN,
      Math.min(ZOOM_MAX, previousZoom * Math.exp(-event.deltaY * 0.0015))
    );
    if (nextZoom === previousZoom || !pageViewport.value) return;

    const viewportRect = pageViewport.value.getBoundingClientRect();
    const pointerX = event.clientX - viewportRect.left;
    const pointerY = event.clientY - viewportRect.top;
    const pageX = (pointerX - panOffset.value.x) / previousZoom;
    const pageY = (pointerY - panOffset.value.y) / previousZoom;
    zoom.value = Number(nextZoom.toFixed(2));
    panOffset.value = constrainPanOffset(
      pointerX - pageX * zoom.value,
      pointerY - pageY * zoom.value
    );
  };

  const observeCanvasShell = () => {
    if (!canvasShell.value || typeof globalThis.ResizeObserver !== 'function') {
      return () => {};
    }

    const observer = new globalThis.ResizeObserver(() => {
      updateCanvasShellSize();
      fitPageToViewport();
      centerPageInViewport();
    });
    observer.observe(canvasShell.value);
    return () => observer.disconnect();
  };

  return {
    rulerOrigin: RULER_ORIGIN,
    canvasShellSize,
    zoom,
    panOffset,
    pagePanDrag,
    horizontalRulerTicks,
    verticalRulerTicks,
    updateCanvasShellSize,
    constrainPanOffset,
    centerPageInViewport,
    fitPageToViewport,
    zoomIn,
    zoomOut,
    resetZoom,
    handleCanvasPointerDown,
    movePagePan,
    stopPagePan,
    handleCanvasWheel,
    observeCanvasShell,
  };
};
