<script lang="ts">
import clamp from 'lodash/clamp';
import { debounce } from 'quasar';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import type { Widget } from '@/store/dashboards';

import {
  GRID_GAP_SIZE,
  GRID_SQUARE_SIZE,
  MIN_COLS,
  MIN_ROWS,
} from './const';

const MAX_TICK_DELTA = 15;

const zeroPos = (): XYPosition => ({ x: 0, y: 0 });

const moveCodes: Record<string, XYPosition> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

export default defineComponent({
  name: 'GridItem',
  props: {
    widget: {
      type: Object as PropType<Widget>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'position',
    'size',
  ],
  setup(props, { emit }) {
    const localWidget = ref({ ...props.widget });

    watch(
      () => props.widget,
      (widget) => localWidget.value = { ...widget },
    );

    const resizing = ref(false);
    const moving = ref(false);
    const keying = ref(false);

    let gridWidth = 0;
    let touchStart: XYPosition = zeroPos();
    let dragWidth = 0;
    let dragHeight = 0;
    let dragStartWidth = 0;
    let dragStartHeight = 0;
    let dragStart: XYPosition = zeroPos();
    let dragStartParent: XYPosition = zeroPos();

    let currentCols: number | null = null;
    let currentRows: number | null = null;
    let current: XYPosition = zeroPos();
    let lastDelta: XYPosition = zeroPos();

    let resizePos: XYPosition = zeroPos();
    let debouncedEmit = debounce(emit, 500);

    const containerRef = ref<Element | null>(null);
    const dragOverlayRef = ref<Element | null>(null);

    const id = computed<string>(
      () => localWidget.value.id,
    );

    const style = computed<Mapped<string>>(
      () => {
        const { pinnedPosition, cols, rows } = localWidget.value;
        const pinned = pinnedPosition || zeroPos();

        return {
          gridColumnStart: `${current.x || pinned.x || resizePos.x || 'auto'}`,
          gridRowStart: `${current.y || pinned.y || resizePos.y || 'auto'}`,
          gridColumnEnd: `span ${currentCols || cols}`,
          gridRowEnd: `span ${currentRows || rows}`,
        };
      },
    );

    const dragStyle = computed<Mapped<string>>(
      () => ({
        width: `${dragWidth}px`,
        height: `${dragHeight}px`,
      }),
    );

    function updatePosition(pinnedPosition: XYPosition | null): void {
      // set in local widget to avoid jumps while parents are handling update loops
      localWidget.value = { ...localWidget.value, pinnedPosition };
      debouncedEmit('position', id.value, pinnedPosition);
    }

    function updateSize(cols: number, rows: number): void {
      // set in local widget to avoid jumps while parents are handling update loops
      localWidget.value = { ...localWidget.value, cols, rows };
      debouncedEmit('size', id.value, cols, rows);
    }

    function onInteractionStart(e: MouseEvent | TouchEvent): void {
      const touch = (e instanceof MouseEvent) ? e : e.touches[0];

      touchStart = {
        x: touch.pageX,
        y: touch.pageY,
      };

      // set initial values of item
      const { width, height } = containerSize();
      const parent = containerParentSize();

      gridWidth = Math.floor((parent.width + GRID_GAP_SIZE) / (GRID_GAP_SIZE + GRID_SQUARE_SIZE));

      dragWidth = width;
      dragHeight = height;

      dragStartWidth = width;
      dragStartHeight = height;
    }

    function onInteractionEnd(): void {
      touchStart = zeroPos();

      // reset values of item
      currentCols = null;
      currentRows = null;

      lastDelta = zeroPos();
      current = zeroPos();
      dragStart = zeroPos();
      dragStartParent = zeroPos();
    }


    function changeSize(): void {
      const newCols = Math.round((dragWidth + GRID_GAP_SIZE) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE));
      const newRows = Math.round((dragHeight + GRID_GAP_SIZE) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE));

      if (newCols !== currentCols && newCols <= gridWidth) {
        currentCols = Math.max(newCols, MIN_COLS);
      }

      if (newRows !== currentRows) {
        currentRows = Math.max(newRows, MIN_ROWS);
      }
    }

    function calcMoveDelta(e: MouseEvent | TouchEvent): XYPosition {
      const touch = (e instanceof MouseEvent) ? e : e.touches[0];
      const { x, y } = lastDelta;
      const raw = {
        x: touch.pageX - touchStart.x,
        y: touch.pageY - touchStart.y,
      };
      // Clamp to avoid instant screen jumps
      const newDelta = {
        x: clamp(raw.x, x - MAX_TICK_DELTA, x + MAX_TICK_DELTA),
        y: clamp(raw.y, y - MAX_TICK_DELTA, y + MAX_TICK_DELTA),
      };
      lastDelta = { ...newDelta };
      return newDelta;
    }

    function containerParentSize(): DOMRect {
      const container = containerRef.value;
      if (
        container instanceof Element &&
        container.parentNode &&
        container.parentNode instanceof Element
      ) {
        return container.parentNode.getBoundingClientRect() as DOMRect;
      }
      throw new Error('Container parent is not a valid Element');
    }

    function containerChildSize(): DOMRect {
      const container = containerRef.value;
      if (container?.firstElementChild instanceof Element) {
        return container.firstElementChild.getBoundingClientRect() as DOMRect;
      }
      throw new Error('Container child is not a valid Element');
    }

    function containerSize(): DOMRect {
      const container = containerRef.value;
      if (container instanceof Element) {
        return container.getBoundingClientRect() as DOMRect;
      }
      throw new Error('Container is not a valid Element');
    }

    function findDragGridPosition(delta: XYPosition = zeroPos()): XYPosition {
      if (!dragStart.x || !dragStart.y || !dragStartParent.x || !dragStartParent.y) {
        throw new Error('No starting drag positions known');
      }

      const x = (((dragStart.x + delta.x) - dragStartParent.x) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE)) + 1;
      const y = (((dragStart.y + delta.y) - dragStartParent.y) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE)) + 1;
      const cols = (currentCols || localWidget.value.cols) - 1;

      return {
        x: Math.min(Math.max(Math.round(x), 1), gridWidth - cols),
        y: Math.max(Math.round(y < 1 ? 1 : y), 1),
      };
    }

    function findAutomaticGridPosition(): XYPosition {
      const rects = containerSize();
      const firstChildRects = containerChildSize();

      const touchX = rects.x;
      const touchY = rects.y;

      const parentX = firstChildRects.x;
      const parentY = firstChildRects.y;

      return {
        x: ((touchX - parentX) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE)) + 1,
        y: ((touchY - parentY) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE)) + 1,
      };
    }

    function onDragStart(e: MouseEvent | TouchEvent): void {
      moving.value = true;
      onInteractionStart(e);

      const rects = containerSize();
      const firstChildRects = containerChildSize();

      dragStart = { x: rects.x, y: rects.y };
      dragStartParent = { x: firstChildRects.x, y: firstChildRects.y };

      current = findDragGridPosition();
    }

    function onDragStop(): void {
      moving.value = false;
      updatePosition({ ...current });
      onInteractionEnd();
    }

    function onDragMove(e: MouseEvent | TouchEvent): void {
      const delta = calcMoveDelta(e);
      current = findDragGridPosition(delta);
    }

    function movePanHandler(args: PanArguments): void {
      if (args.isFirst) {
        onDragStart(args.evt);
      }
      else if (args.isFinal) {
        onDragStop();
      }
      else {
        onDragMove(args.evt);
      }
    }

    function onResizeStart(e: MouseEvent | TouchEvent): void {
      resizePos = findAutomaticGridPosition();
      resizing.value = true;
      onInteractionStart(e);
    }

    function onResizeStop(): void {
      resizePos = zeroPos();
      resizing.value = false;
      const cols = currentCols || localWidget.value.cols;
      const rows = currentRows || localWidget.value.rows;
      updateSize(cols, rows);
      onInteractionEnd();
    }

    function onResizeMove(e: MouseEvent | TouchEvent): void {
      const delta = calcMoveDelta(e);
      dragWidth = dragStartWidth + delta.x;
      dragHeight = dragStartHeight + delta.y;
      changeSize();
    }

    function resizePanHandler(args: PanArguments): void {
      if (args.isFirst) {
        onResizeStart(args.evt);
      }
      else if (args.isFinal) {
        onResizeStop();
      }
      else {
        onResizeMove(args.evt);
      }
    }

    function unpin(): void {
      updatePosition(null);
    }

    function pin(): void {
      const pos = current.x > 0
        ? current
        : findAutomaticGridPosition();
      updatePosition(pos);
    }

    function keydown(evt: KeyboardEvent): void {
      if (!props.editable || moving.value) {
        return;
      }
      if (evt.key === 'Enter') {
        applyKeyMove();
        return;
      }

      const delta = moveCodes[evt.key];
      if (delta) {
        keying.value = true;
        evt.stopPropagation();
        evt.preventDefault();

        if (current.x === 0) {
          current = localWidget.value.pinnedPosition ?? findAutomaticGridPosition();
        }

        current.x += delta.x;
        current.y += delta.y;
      }
    }

    function applyKeyMove(): void {
      if (keying.value) {
        keying.value = false;
        updatePosition({ ...current });
        current = zeroPos();
      }
    }

    return {
      localWidget,
      resizing,
      moving,
      keying,
      containerRef,
      dragOverlayRef,
      style,
      dragStyle,
      movePanHandler,
      resizePanHandler,
      unpin,
      pin,
      keydown,
      applyKeyMove,
    };
  },
});
</script>

<template>
  <div
    ref="containerRef"
    :widget-id="localWidget.id"
    :style="style"
    class="grid-item"
    @keydown="keydown"
    @focusout="applyKeyMove"
  >
    <!-- Actual item -->
    <slot />
    <!-- Drag effects -->
    <div
      v-if="resizing || moving"
      ref="dragOverlayRef"
      :style="dragStyle"
      class="grid-item-drag-overlay"
    />
    <!-- Item resize button -->
    <button
      v-if="editable"
      v-touch-pan.mouse="resizePanHandler"
      class="grid-item-resize-handle"
    >
      <q-icon name="mdi-resize-bottom-right" size="30px" />
    </button>
    <!-- Item drag button -->
    <button
      v-if="editable"
      v-touch-pan.mouse="movePanHandler"
      class="grid-item-move-handle grid-item-movable"
    >
      <div class="column q-gutter-sm items-center">
        <q-icon name="mdi-gesture-swipe-horizontal" size="50px" />
        <div>
          Drag to reposition
        </div>
        <q-btn
          :icon="localWidget.pinnedPosition ? 'mdi-pin' : undefined"
          :label="localWidget.pinnedPosition ? 'Pinned' : 'Pin position'"
          :unelevated="!!localWidget.pinnedPosition"
          :outline="!localWidget.pinnedPosition"
          :disable="keying"
          rounded
          color="secondary"
          @click="localWidget.pinnedPosition ? unpin() : pin()"
        />
      </div>
    </button>
  </div>
</template>

<style lang="sass" scoped>
.grid-item
  position: relative

.grid-item-resize-handle
  border: 0
  width: 34px
  height: 34px
  position: absolute
  padding: 0
  display: flex
  align-items: center
  justify-content: center
  color: #fff
  outline: none
  z-index: 3
  bottom: 0
  cursor: nwse-resize
  right: 0
  background: transparent

.grid-item-move-handle
  left: 0
  top: 0
  position: absolute
  background: rgba(0, 0, 0, 0.6)
  color: #fff
  display: flex
  align-items: center
  justify-content: center
  border: 0
  width: 100%
  height: 100%
  z-index: 1

.grid-item-movable
  cursor: move

.grid-item-drag-overlay
  background: rgba(255, 255, 255, 0.2)
  top: 0
  bottom: 0
  position: absolute
  z-index: 1
</style>
