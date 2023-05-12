<script setup lang="ts">
import { useGlobals, UseUndoRedo } from '@/composables';
import { startupDone } from '@/user-settings';
import { rotatedSize } from '@/utils/coordinates';
import { createDialog } from '@/utils/dialog';
import { keyEventString } from '@/utils/events';
import { uniqueFilter } from '@/utils/functional';
import { notify } from '@/utils/notify';
import { clampRotation } from '@/utils/quantity';
import * as d3 from 'd3';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import { nanoid } from 'nanoid';
import {
  computed,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  provide,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  normalizeSelectArea,
  useDragSelect,
  useFlowParts,
  useSvgZoom,
  UseSvgZoomDimensions,
} from './composables';
import { useMetrics } from './composables/use-metrics';
import { builderTools, SQUARE_SIZE } from './const';
import { useBuilderStore } from './store';
import { EditableKey } from './symbols';
import {
  BuilderLayout,
  BuilderPart,
  BuilderTool,
  BuilderToolName,
} from './types';
import {
  coord2grid,
  coord2translate,
  grid2coord,
  startChangeLayoutTitle,
  startCreateLayout,
  startImportLayout,
} from './utils';

type SVGSelection = d3.Selection<SVGElement, unknown, null, undefined>;

type ToolSource = 'shortcut' | 'menu' | 'click';

/**
 * A group of parts that is currently being moved.
 * For performance reasons, this is kept as a local variable,
 * as the x/y coordinates will be constantly updated.
 *
 * All parts in the floater will be rendered at `floater.x + part.x` / `floater.y + part.y`.
 * This way, only floater.x/y have to be updated to move all contained parts.
 */
interface Floater extends XYPosition, AreaSize {
  parts: BuilderPart[];
}

const moveKeys: Record<string, XYPosition> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const props = defineProps({
  routeId: {
    type: String,
    default: '',
  },
});

const builderStore = useBuilderStore();
const { dense } = useGlobals.setup();
const router = useRouter();
provide(EditableKey, true);

const toolsMenuExpanded = ref<boolean>(!dense.value);
const activeToolId = ref<BuilderToolName | null>('pan');

const gridHoverPos = ref<XYPosition | null>(null);
const partDragStart = ref<XYPosition | null>(null);

const selectedIds = ref<string[]>([]);
const floater = ref<Floater | null>(null);

const focusWarningEnabled = computed<boolean>({
  get: () => builderStore.focusWarningEnabled,
  set: (v) => (builderStore.focusWarningEnabled = v),
});

const layouts = computed<BuilderLayout[]>(() => builderStore.layouts);

const layoutId = computed<string | null>(() => props.routeId || null);

useMetrics.setupProvider(layoutId);
const { layout, parts, orderedParts, updateLayout, updateParts, reflow } =
  useFlowParts.setup(layoutId);

const layoutTitle = computed<string>(
  () => layout.value?.title ?? 'Builder editor',
);

const gridDimensions = computed<UseSvgZoomDimensions>(() => ({
  width: coord2grid(layout.value?.width ?? 10),
  height: coord2grid(layout.value?.height ?? 10),
}));

const activeTool = computed<BuilderTool | null>(
  () => builderTools.find((v) => v.value === activeToolId.value) ?? null,
);

const dragEnabled = computed<boolean>(() => activeToolId.value === 'pan');

const cursor = computed<string>(() => activeTool.value?.cursor ?? 'auto');

const { svgRef, svgContentRef, resetZoom } = useSvgZoom.setup(gridDimensions, {
  dragEnabled,
});

const {
  activeSelectArea,
  selectAreaRef,
  startDragSelect,
  updateDragSelect,
  stopDragSelect,
  makeSelectAreaFilter,
  getDragDistance,
} = useDragSelect.setup();

const { canUndo, canRedo, undo, redo, pushUndoStack, clearUndoStack } =
  UseUndoRedo.setup(parts);

function setFocus(): void {
  svgRef.value?.focus();
}

function selectLayout(id: string | null): void {
  if (id !== layoutId.value) {
    const route = id ? `/builder/${id}` : '/builder';
    router.push(route);
  }
}

async function createLayout(): Promise<void> {
  await startCreateLayout(router);
  setFocus();
}

async function importLayout(): Promise<void> {
  await startImportLayout((id) => selectLayout(id));
  setFocus();
}

function patchPart(id: string, patch: Partial<BuilderPart>): void {
  pushUndoStack();
  updateParts((draft) => {
    const part = draft[id];
    draft[id] = { ...part, ...patch, id };
  });
}

function patchPartSettings(
  id: string,
  patch: Partial<BuilderPart['settings']>,
): void {
  pushUndoStack();
  updateParts((draft) => {
    const part = draft[id];
    part.settings = { ...part.settings, ...patch };
  });
}

// Return the grid coordinates of the current event
function toCoords(pos: XYPosition): XYPosition;
function toCoords(pos: XYPosition | null): XYPosition | null;
function toCoords(pos: XYPosition | null): XYPosition | null {
  return pos != null
    ? {
        x: Math.floor(pos.x / SQUARE_SIZE),
        y: Math.floor(pos.y / SQUARE_SIZE),
      }
    : null;
}

function toFractionCoords(pos: XYPosition): XYPosition;
function toFractionCoords(pos: XYPosition | null): XYPosition | null;
function toFractionCoords(pos: XYPosition | null): XYPosition | null {
  return pos != null
    ? {
        x: pos.x / SQUARE_SIZE,
        y: pos.y / SQUARE_SIZE,
      }
    : null;
}

function isFloating(id: string): boolean {
  return floater.value?.parts.some((p) => p.id === id) === true;
}

function makeFloater(source: Floater): void {
  floater.value = cloneDeep(source);
  moveFloater(source);
}

const moveFloater = throttle(({ x, y }: XYPosition): void => {
  if (floater.value) {
    floater.value = {
      ...floater.value,
      x: Math.round(x - floater.value.width / 2),
      y: Math.round(y - floater.value.height / 2),
    };
  }
}, 50);

function dropFloater(coords: XYPosition | null): void {
  if (!floater.value) {
    return;
  }

  if (coords) {
    const sourceParts = [...floater.value.parts];
    const offset: AreaSize = {
      width: floater.value.width / 2,
      height: floater.value.height / 2,
    };

    pushUndoStack();
    updateParts((draft) => {
      for (const part of sourceParts) {
        // Translate coordinate origin from floater to layout
        part.x += Math.round(coords.x - offset.width);
        part.y += Math.round(coords.y - offset.height);
        draft[part.id] = part;
      }
    });
  }

  cancelSelection();
  floater.value = null;
}

function cancelFloater(): void {
  floater.value = null;
}

function combinedPartSize(parts: BuilderPart[]): AreaSize {
  return parts
    .map((part) => {
      const partSize = rotatedSize(part.rotate, part);
      return {
        width: part.x + partSize.width,
        height: part.y + partSize.height,
      };
    })
    .reduce(
      (size, partSize) => ({
        width: Math.max(size.width, partSize.width),
        height: Math.max(size.height, partSize.height),
      }),
      { width: 0, height: 0 },
    );
}

function findPartAtCoords(coords: XYPosition | null): BuilderPart | null {
  // iterate right to left to match rendering order
  // when items overlap, the later item is rendered on top
  if (coords) {
    for (let idx = orderedParts.value.length - 1; idx >= 0; idx--) {
      const part = orderedParts.value[idx];
      const { width, height } = rotatedSize(part.rotate, part);
      if (
        coords.x >= part.x &&
        coords.x < part.x + width &&
        coords.y >= part.y &&
        coords.y < part.y + height
      ) {
        return cloneDeep(part);
      }
    }
  }
  return null;
}

function findHoveredPart(): BuilderPart | null {
  return findPartAtCoords(toCoords(gridHoverPos.value));
}

function findActiveParts(alwaysIncludeSelected = false): BuilderPart[] {
  const hovered = findHoveredPart();
  const selected = selectedIds.value
    .map((id) => cloneDeep(parts.value[id]))
    .filter((part) => part != null);

  if (hovered) {
    return selectedIds.value.length &&
      (alwaysIncludeSelected || selectedIds.value.includes(hovered.id))
      ? selected
      : [hovered];
  } else if (alwaysIncludeSelected) {
    return selected;
  } else {
    return [];
  }
}

function isHoveringUnselectedPart(): boolean {
  const hovered = findHoveredPart();
  return Boolean(
    hovered &&
      selectedIds.value.length &&
      !selectedIds.value.some((v) => v === hovered.id),
  );
}

function toggleSelect(id: string | null): void {
  if (id) {
    if (selectedIds.value.length === 1 && selectedIds.value[0] === id) {
      selectedIds.value = [];
    } else {
      selectedIds.value = [id];
    }
  }
}

function cancelSelection(): void {
  stopDragSelect();
  selectedIds.value = [];
}

function clear(): void {
  if (floater.value) {
    cancelFloater();
  } else if (activeSelectArea.value) {
    stopDragSelect();
  } else {
    selectedIds.value = [];
  }
}

////////////////////////////////////////////////////////////////
// Tools
////////////////////////////////////////////////////////////////

function toolPan(): void {
  activeToolId.value = 'pan';
}

function toolSelect(): void {
  if (activeToolId.value !== 'select') {
    activeToolId.value = 'select';
  } else {
    const part = findHoveredPart();
    if (part) {
      toggleSelect(part.id);
    }
  }
}

function toolGridResize(): void {
  activeToolId.value = 'gridresize';
  cancelFloater();
}

function toolAdd(): void {
  if (!floater.value) {
    createDialog({
      component: 'BuilderCatalogDialog',
    })
      .onOk((part: BuilderPart) => {
        makeFloater({
          x: 0,
          y: 0,
          width: part.width,
          height: part.height,
          parts: [part],
        });
        nextTick(setFocus);
      })
      .onDismiss(setFocus);
  }
}

function toolMove(src: ToolSource): void {
  if (activeToolId.value !== 'move') {
    activeToolId.value = 'move';
    cancelFloater();
  }

  // Menu clicks only activate the mode
  if (src === 'menu') {
    return;
  }

  if (floater.value) {
    dropFloater(toFractionCoords(gridHoverPos.value));
    return;
  }

  if (isHoveringUnselectedPart()) {
    cancelSelection();
    return;
  }

  const activeParts = findActiveParts(true);
  if (activeParts.length) {
    // gridHoverPos will not be set if the tool is used by clicking on the tools menu
    const { x, y } = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
    const minX = Math.min(...activeParts.map((part) => part.x));
    const minY = Math.min(...activeParts.map((part) => part.y));
    const floatingParts = activeParts.map((part) => ({
      ...part,
      x: part.x - minX,
      y: part.y - minY,
    }));
    const { width, height } = combinedPartSize(floatingParts);

    makeFloater({ x, y, width, height, parts: floatingParts });
  }
}

function toolCopy(src: ToolSource): void {
  if (activeToolId.value !== 'copy') {
    activeToolId.value = 'copy';
    cancelFloater();
  }

  // Menu clicks only activate the mode
  if (src === 'menu') {
    return;
  }

  if (floater.value) {
    dropFloater(floater.value);
    return;
  }

  if (isHoveringUnselectedPart()) {
    // cancelSelection();
    return;
  }

  const activeParts = findActiveParts(true);
  if (activeParts.length) {
    // gridHoverPos will not be set if the tool is used by clicking on the tools menu
    const { x, y } = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
    const minX = Math.min(...activeParts.map((part) => part.x));
    const minY = Math.min(...activeParts.map((part) => part.y));
    const floatingParts = activeParts.map((part) => ({
      ...part,
      id: nanoid(),
      x: part.x - minX,
      y: part.y - minY,
    }));
    const { width, height } = combinedPartSize(floatingParts);
    makeFloater({ x, y, width, height, parts: floatingParts });
  }
}

function toolRotate(): void {
  if (floater.value) {
    if (floater.value.parts.length === 1) {
      const part = floater.value.parts[0];
      part.rotate = clampRotation(part.rotate + 90);
    }
  } else {
    activeToolId.value = 'rotate';
    const part = findHoveredPart();
    if (part) {
      pushUndoStack();
      updateParts((draft) => {
        draft[part.id].rotate = clampRotation(part.rotate + 90);
      });
    }
  }
}

function toolFlip(): void {
  if (floater.value) {
    if (floater.value.parts.length === 1) {
      const part = floater.value.parts[0];
      part.flipped = !part.flipped;
    }
  } else {
    activeToolId.value = 'flip';
    const part = findHoveredPart();
    if (part) {
      pushUndoStack();
      updateParts((draft) => {
        draft[part.id].flipped = !part.flipped;
      });
    }
  }
}

function toolInteract(): void {
  activeToolId.value = 'interact';
  if (floater.value) {
    cancelFloater();
  }
}

function toolDelete(): void {
  if (activeToolId.value !== 'delete') {
    activeToolId.value = 'delete';
    cancelFloater();
  }

  if (isHoveringUnselectedPart()) {
    cancelSelection();
    return;
  }

  const activeParts = findActiveParts(true);
  if (activeParts.length) {
    pushUndoStack();
    updateParts((draft) => {
      for (const part of activeParts) {
        delete draft[part.id];
      }
    });
    cancelFloater();
    cancelSelection();
  }
}

function toolUndo(): void {
  if (floater.value) {
    cancelFloater();
  } else {
    undo((replacement) => updateParts(() => replacement));
  }
}

function toolRedo(): void {
  if (floater.value) {
    cancelFloater();
  } else {
    redo((replacement) => updateParts(() => replacement));
  }
}

const builderToolActions: Record<BuilderToolName, (src: ToolSource) => void> = {
  pan: toolPan,
  select: toolSelect,
  gridresize: toolGridResize,
  add: toolAdd,
  move: toolMove,
  copy: toolCopy,
  rotate: toolRotate,
  flip: toolFlip,
  interact: toolInteract,
  delete: toolDelete,
  undo: toolUndo,
  redo: toolRedo,
};

function applyTool(name: BuilderToolName, src: ToolSource): void {
  const action = builderToolActions[name];
  if (action) {
    action(src);
    setFocus();
  }
}

const disabledTools = computed<BuilderToolName[]>(() => {
  const tools: BuilderToolName[] = [];
  if (floater.value) {
    tools.push('add', 'interact');
    if (floater.value.parts.length > 1) {
      tools.push('rotate', 'flip');
    }
  } else if (selectedIds.value.length > 1) {
    tools.push('interact', 'rotate', 'flip');
  }
  if (!canUndo.value) {
    tools.push('undo');
  }
  if (!canRedo.value) {
    tools.push('redo');
  }
  return tools;
});

////////////////////////////////////////////////////////////////
// Event handlers
////////////////////////////////////////////////////////////////

function onClipboardCopy(evt: ClipboardEvent): void {
  const activeParts = findActiveParts(true);
  if (!activeParts.length) {
    return;
  }
  const content = JSON.stringify({ parts: activeParts });
  evt.clipboardData?.setData('BuilderClipboardContent', content);
  const noun = activeParts.length === 1 ? 'part' : 'parts';
  notify.info(`Copied ${activeParts.length} ${noun}`);
  evt.preventDefault();
}

function onClipboardCut(evt: ClipboardEvent): void {
  const activeParts = findActiveParts(true);
  if (!activeParts.length) {
    return;
  }
  const content = JSON.stringify({ parts: activeParts });
  evt.clipboardData?.setData('BuilderClipboardContent', content);
  const noun = activeParts.length === 1 ? 'part' : 'parts';
  notify.info(`Cut ${activeParts.length} ${noun}`);
  evt.preventDefault();

  // Now remove cut parts from layout
  pushUndoStack();
  updateParts((draft) => {
    for (const part of activeParts) {
      delete draft[part.id];
    }
  });
}

function onClipboardPaste(evt: ClipboardEvent): void {
  evt.preventDefault();
  const content = evt.clipboardData?.getData('BuilderClipboardContent');
  if (!content) {
    return;
  }

  const { parts }: { parts: BuilderPart[] } = JSON.parse(content);
  if (parts?.length) {
    const { x, y } = toCoords(gridHoverPos.value) ?? { x: 0, y: 0 };
    const minX = Math.min(...parts.map((part) => part.x));
    const minY = Math.min(...parts.map((part) => part.y));
    parts.forEach((part) => {
      part.id = nanoid();
      part.x -= minX;
      part.y -= minY;
    });
    const { width, height } = combinedPartSize(parts);
    makeFloater({ x, y, width, height, parts });
  }
}

function deltaMove(delta: XYPosition): void {
  const activeParts = findActiveParts(true);
  pushUndoStack();
  updateParts((draft) => {
    for (const part of activeParts) {
      draft[part.id].x += delta.x;
      draft[part.id].y += delta.y;
    }
  });
}

function keyHandler(evt: KeyboardEvent): void {
  const key = keyEventString(evt);
  const keyDelta = moveKeys[key];
  const tool = builderTools.find((v) => v.shortcut === key);

  if (key === 'Escape') {
    clear();
  } else if (keyDelta) {
    deltaMove(keyDelta);
  } else if (tool) {
    if (!disabledTools.value.includes(tool.value)) {
      applyTool(tool.value, 'shortcut');
    }
  } else {
    return; // not handled - don't stop propagation
  }

  // If we handled the key, we want to stop propagation
  evt.stopPropagation();
  evt.preventDefault();
}

// Return the exact position of the current event
function d3EventPos(evt: Event): XYPosition {
  const [x, y] = d3.pointer(evt, svgContentRef.value!);
  return { x, y };
}

function gridHoverHandler(selection: SVGSelection): SVGSelection {
  const throttledMove = throttle((gridPos: XYPosition) => {
    gridHoverPos.value = gridPos;
    moveFloater(toFractionCoords(gridPos));
  }, 50);
  return selection
    .on('mouseenter', (evt) => throttledMove(d3EventPos(evt)))
    .on('mousemove', (evt) => throttledMove(d3EventPos(evt)))
    .on('mouseout', () => {
      gridHoverPos.value = null;
    });
}

const gridResizeDragHandler = d3
  .drag<SVGElement, unknown>()
  .on('start', (evt) => {
    const { x, y } = d3EventPos(evt);
    const sqX = coord2grid(grid2coord(x));
    const sqY = coord2grid(grid2coord(y));
    startDragSelect({
      startX: sqX,
      startY: sqY,
      endX: sqX,
      endY: sqY,
    });
  })
  .on('drag', (evt) => {
    const { x, y } = d3EventPos(evt);
    const sqX = coord2grid(grid2coord(x));
    const sqY = coord2grid(grid2coord(y));
    updateDragSelect(sqX, sqY);
  })
  .on('end', () => {
    if (activeSelectArea.value && layout.value) {
      const { startX, startY, endX, endY } = normalizeSelectArea(
        activeSelectArea.value,
      );
      stopDragSelect();

      if (startX === endX || startY === endY) {
        return;
      }

      updateLayout((draft) => {
        draft.width = grid2coord(endX - startX);
        draft.height = grid2coord(endY - startY);

        const offsetX = grid2coord(startX);
        const offsetY = grid2coord(startY);

        for (const part of draft.parts) {
          part.x -= offsetX;
          part.y -= offsetY;
        }
      });
    }
  });

const gridDragHandler = d3
  .drag<SVGElement, unknown>()
  .clickDistance(25)
  .on('start', (evt) => {
    if (!floater.value) {
      const { x, y } = d3EventPos(evt);
      startDragSelect({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
    }
  })
  .on('drag', (evt) => {
    const { x, y } = d3EventPos(evt);
    updateDragSelect(x, y);
  })
  .on('end', async (evt) => {
    if (floater.value) {
      dropFloater(toFractionCoords(d3EventPos(evt)));
      return;
    }

    const { altKey, shiftKey } = evt;

    const sourceIds = cloneDeep(selectedIds.value);
    const targetIds = orderedParts.value
      .filter(makeSelectAreaFilter())
      .map((v) => v.id);

    if (shiftKey) {
      selectedIds.value = [...sourceIds, ...targetIds].filter(uniqueFilter);
    } else if (altKey) {
      selectedIds.value = [
        ...sourceIds.filter((id) => !targetIds.includes(id)),
      ];
    } else if (getDragDistance() < 10 && findHoveredPart() != null) {
      // small drag on top of a part
      // this will be handled by the click handler
    } else {
      selectedIds.value = [...targetIds];
    }

    stopDragSelect();
  });

const partDragHandler = d3
  .drag()
  .clickDistance(25)
  .on('start', (evt) => {
    // We're not sure yet whether this is a drag or a click
    // The action becomes a drag once the mouse leaves the square
    // The action is a click if the mouseup event is in the same square
    partDragStart.value = toCoords(d3EventPos(evt));
  })
  .on('drag', function (this: Element, evt) {
    const pos = d3EventPos(evt);
    const coords = toCoords(pos);
    const start = partDragStart.value;

    // We're already dragging.
    if (floater.value) {
      moveFloater(toFractionCoords(pos));
    }
    // Check if the drag event has left the initial square
    // Create a floater when this happens
    else if (start && !isEqual(start, coords)) {
      const targetId = this.getAttribute('part-id')!;
      const relevantIds = selectedIds.value.includes(targetId)
        ? [...selectedIds.value]
        : [targetId];
      const floaterParts = relevantIds
        .filter((id) => id in parts.value)
        .map((id) => parts.value[id])
        .map((part) => ({
          ...part,
          id: activeToolId.value === 'copy' ? nanoid() : part.id,
          x: part.x - start.x,
          y: part.y - start.y,
        }));

      makeFloater({
        ...coords,
        width: 0,
        height: 0,
        parts: floaterParts,
      });
    }
  })
  .on('end', (evt) => {
    partDragStart.value = null;
    dropFloater(toFractionCoords(d3EventPos(evt)));
  });

function defineGridEventHandlers(
  el: SVGElement,
  tool: BuilderToolName | null,
): void {
  const selection = d3.select(el);
  selection.call(gridHoverHandler);

  selection.on('click', (evt) => {
    if (floater.value) {
      dropFloater(toFractionCoords(d3EventPos(evt)));
    }
  });

  if (tool && ['select', 'copy', 'move', 'delete'].includes(tool)) {
    selection.call(gridDragHandler);
  } else if (tool === 'gridresize') {
    selection.call(gridResizeDragHandler);
  } else {
    // pan is handled by useSvgZoom
    selection.on('.drag', null);
  }
}

function definePartEventHandlers(
  el: SVGElement,
  tool: BuilderToolName | null,
): void {
  const partSelection = d3.select(el).selectAll<Element, any>('.flowpart');

  if (tool === 'move' || tool === 'copy') {
    partSelection.call(partDragHandler);
  } else {
    partSelection.on('.drag', null);
  }

  if (
    tool &&
    [
      'select',
      'new',
      'move',
      'copy',
      'rotate',
      'flip',
      'edit',
      'delete',
    ].includes(tool)
  ) {
    partSelection.on('click', function (evt: Event) {
      applyTool(tool, 'click');
      evt.stopPropagation();
    });
  } else {
    partSelection.on('click', null);
  }
}

watch(
  () => layoutId.value,
  (newV, oldV) => {
    if (newV !== oldV) {
      clearUndoStack();
      builderStore.lastLayoutId = newV;
      nextTick(() => setFocus());
    }
  },
  { immediate: true },
);

watch(
  () => layoutTitle.value,
  (title) => (document.title = `Brewblox | ${title}`),
  { immediate: true },
);

watch(
  [svgRef, activeToolId],
  ([el, tool]) => el && defineGridEventHandlers(el, tool),
  { immediate: true },
);

watch(
  [svgContentRef, activeToolId, orderedParts],
  async ([el, tool]) => {
    await nextTick();
    if (el) {
      definePartEventHandlers(el, tool);
    }
  },
  { immediate: true },
);

onBeforeMount(() => {
  document.body.addEventListener('copy', onClipboardCopy);
  document.body.addEventListener('cut', onClipboardCut);
  document.body.addEventListener('paste', onClipboardPaste);
});

onBeforeUnmount(() => {
  document.body.removeEventListener('copy', onClipboardCopy);
  document.body.removeEventListener('cut', onClipboardCut);
  document.body.removeEventListener('paste', onClipboardPaste);
});
</script>

<template>
  <q-page
    class="page-height"
    @keydown="keyHandler"
    @cut="onClipboardCut"
    @paste="onClipboardPaste"
  >
    <TitleTeleport v-if="layout">
      <span
        class="cursor-pointer"
        @click="startChangeLayoutTitle(layout)"
      >
        {{ layoutTitle }}
      </span>
    </TitleTeleport>

    <ButtonsTeleport v-if="layout">
      <q-btn
        flat
        round
        icon="mdi-tools"
        class="self-center"
        color="primary"
        :to="`/brewery/${layoutId}`"
      >
        <q-tooltip>Leave editor</q-tooltip>
      </q-btn>
      <ActionMenu
        round
        class="self-center"
        label="Builder actions"
      >
        <template #menus>
          <LayoutActionsMenu :layout="layout" />
        </template>
        <template #actions>
          <ActionItem
            label="New layout"
            icon="add"
            @click="createLayout"
          />
          <ActionItem
            icon="mdi-file-import"
            label="Import Layout"
            @click="importLayout"
          />
          <ActionItem
            label="Reset zoom"
            icon="mdi-stretch-to-page-outline"
            @click="resetZoom"
          />
          <ToggleAction
            v-model="focusWarningEnabled"
            label="Show focus warning"
          />
        </template>
      </ActionMenu>
    </ButtonsTeleport>

    <!-- Still waiting for datastore -->
    <div
      v-if="!startupDone"
      class="text-h5 darkened absolute-center column items-center q-gutter-md"
    >
      <q-spinner size="30px" />
      <div>Waiting for datastore...</div>
    </div>

    <!-- No layout selected -->
    <PageError v-if="!layout">
      <template v-if="layouts.length">
        Select a layout
        <ListSelect
          :model-value="null"
          :options="layouts"
          option-value="id"
          option-label="title"
          option-class="q-px-md"
          class="q-mx-lg q-my-md"
          style="color: white"
          @update:model-value="(v) => v && selectLayout(v.id)"
        />
        or
      </template>
      <q-btn
        outline
        color="secondary"
        label="Create a layout"
        class="q-mx-lg self-stretch"
        @click="createLayout"
      />
    </PageError>

    <!-- Grid -->
    <div
      v-else
      class="fit focus-area"
      tabindex="-1"
    >
      <svg
        ref="svgRef"
        class="fit"
        :style="{ cursor }"
      >
        <g ref="svgContentRef">
          <EditorBackground
            v-if="activeToolId !== 'interact' || floater"
            :width="layout.width"
            :height="layout.height"
          />
          <!-- All parts, hidden if floating -->
          <g
            v-for="part in orderedParts"
            v-show="!isFloating(part.id)"
            :key="part.id"
            :part-id="part.id"
            :class="['flowpart', part.type]"
          >
            <PartWrapper
              :part="part"
              :selected="selectedIds.includes(part.id)"
              :selectable="!['interact', 'pan', null].includes(activeToolId)"
              :interactable="activeToolId === 'interact'"
              @patch:part="(patch) => patchPart(part.id, patch)"
              @patch:settings="(patch) => patchPartSettings(part.id, patch)"
              @reflow="reflow"
            />
          </g>
          <!-- Floating parts -->
          <g
            v-if="floater"
            :transform="coord2translate(floater.x, floater.y)"
          >
            <g
              v-for="part in floater.parts"
              :key="`floating-${part.id}`"
              :class="[part.type]"
            >
              <PartWrapper
                :part="part"
                selected
              />
            </g>
          </g>
          <!-- Indicators for multiple parts sharing the same top/left coordinates-->
          <OverlapIndicators :parts="orderedParts" />
          <!-- Selection area -->
          <rect
            ref="selectAreaRef"
            stroke="white"
            fill="dodgerblue"
            opacity="0.3"
            style="pointer-events: none"
          />
        </g>
      </svg>
      <BuilderToolsMenu
        v-model:expanded="toolsMenuExpanded"
        :active-tool="activeToolId"
        :disabled-tools="disabledTools"
        @use="(v) => applyTool(v, 'menu')"
        @touchstart.stop
        @mousedown.stop
      />
      <div
        v-if="focusWarningEnabled"
        class="unfocus-overlay"
        @click.stop="setFocus"
        @contextmenu="(evt) => !evt.shiftKey && evt.preventDefault()"
      >
        <transition
          appear
          name="fade"
        >
          <div class="unfocus-message">Click to resume editing</div>
        </transition>
      </div>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.q-page-container
  max-height: 100vh
  max-width: 100vw

.focus-area:focus-within .unfocus-overlay
  display: none

.unfocus-overlay
  position: absolute
  top: 0
  left: 0
  height: 100%
  width: 100%
  background-color: rgba(0, 0, 0, 0.5)
  transition: 1s

.unfocus-message
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  padding: 20px
  border: 2px solid silver
  border-radius: 40px
  color: white
  background-color: rgba(0, 0, 0, 0.7)
  font-size: 1.8rem

.fade-enter-active
  transition: opacity 4s ease

.fade-enter
  opacity: 0

  &-to
    opacity: 1
</style>
