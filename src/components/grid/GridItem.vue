<script lang="ts">
import clamp from 'lodash/clamp';
import debounce from 'lodash/debounce';
import { computed, defineComponent, ref, watch } from 'vue';

import { Widget, widgetStore } from '@/store/widgets';
import { deepCopy } from '@/utils';

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
    widgetId: {
      type: String,
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
    const widget = computed<Widget>(
      () => widgetStore.widgetById(props.widgetId)!,
    );

    const localWidget = ref<Widget>(deepCopy(widget.value));

    watch(
      () => widget.value,
      v => localWidget.value = deepCopy(v),
    );

    const resizing = ref(false);
    const moving = ref(false);
    const keying = ref(false);

    const gridWidth = ref<number>(0);
    const touchStart = ref<XYPosition>(zeroPos());
    const dragWidth = ref<number>(0);
    const dragHeight = ref<number>(0);
    const dragStartWidth = ref<number>(0);
    const dragStartHeight = ref<number>(0);
    const dragStart = ref<XYPosition>(zeroPos());
    const dragStartParent = ref<XYPosition>(zeroPos());

    const currentCols = ref<number | null>(null);
    const currentRows = ref<number | null>(null);
    const current = ref<XYPosition>(zeroPos());
    const lastDelta = ref<XYPosition>(zeroPos());

    const resizePos = ref<XYPosition>(zeroPos());
    const debouncedEmit = debounce(emit, 500);

    const containerRef = ref<Element | null>(null);
    const dragOverlayRef = ref<Element | null>(null);

    const style = computed<Mapped<string>>(
      () => {
        const { pinnedPosition, cols, rows } = localWidget.value;
        const pinned = pinnedPosition || zeroPos();

        return {
          gridColumnStart: `${current.value.x || pinned.x || resizePos.value.x || 'auto'}`,
          gridRowStart: `${current.value.y || pinned.y || resizePos.value.y || 'auto'}`,
          gridColumnEnd: `span ${currentCols.value || cols}`,
          gridRowEnd: `span ${currentRows.value || rows}`,
        };
      },
    );

    const dragStyle = computed<Mapped<string>>(
      () => ({
        width: `${dragWidth.value}px`,
        height: `${dragHeight.value}px`,
      }),
    );

    function updatePosition(pinnedPosition: XYPosition | null): void {
      // set in local widget to avoid jumps while parents are handling update loops
      localWidget.value = { ...localWidget.value, pinnedPosition };
      debouncedEmit('position', widget.value.id, pinnedPosition);
    }

    function updateSize(cols: number, rows: number): void {
      // set in local widget to avoid jumps while parents are handling update loops
      localWidget.value = { ...localWidget.value, cols, rows };
      debouncedEmit('size', widget.value.id, cols, rows);
    }

    function onInteractionStart(e: MouseEvent | TouchEvent): void {
      const touch = (e instanceof MouseEvent) ? e : e.touches[0];

      touchStart.value = {
        x: touch.pageX,
        y: touch.pageY,
      };

      // set initial values of item
      const container = containerRect();
      const parent = containerParentRect();

      gridWidth.value = Math.floor((parent.width + GRID_GAP_SIZE) / (GRID_GAP_SIZE + GRID_SQUARE_SIZE));

      dragWidth.value = container.width;
      dragHeight.value = container.height;

      dragStartWidth.value = container.width;
      dragStartHeight.value = container.height;
    }

    function onInteractionEnd(): void {
      touchStart.value = zeroPos();

      // reset values of item
      currentCols.value = null;
      currentRows.value = null;

      lastDelta.value = zeroPos();
      current.value = zeroPos();
      dragStart.value = zeroPos();
      dragStartParent.value = zeroPos();
    }

    function changeSize(): void {
      const newCols = Math.round((dragWidth.value + GRID_GAP_SIZE) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE));
      const newRows = Math.round((dragHeight.value + GRID_GAP_SIZE) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE));

      if (newCols !== currentCols.value && newCols <= gridWidth.value) {
        currentCols.value = Math.max(newCols, MIN_COLS);
      }

      if (newRows !== currentRows.value) {
        currentRows.value = Math.max(newRows, MIN_ROWS);
      }
    }

    function calcMoveDelta(e: MouseEvent | TouchEvent): XYPosition {
      const touch = (e instanceof MouseEvent) ? e : e.touches[0];
      const { x, y } = lastDelta.value;
      const raw = {
        x: touch.pageX - touchStart.value.x,
        y: touch.pageY - touchStart.value.y,
      };
      // Clamp to avoid instant screen jumps
      const newDelta = {
        x: clamp(raw.x, x - MAX_TICK_DELTA, x + MAX_TICK_DELTA),
        y: clamp(raw.y, y - MAX_TICK_DELTA, y + MAX_TICK_DELTA),
      };
      lastDelta.value = { ...newDelta };
      return newDelta;
    }

    function containerParentRect(): DOMRect {
      const parent = containerRef.value?.parentElement;
      if (parent instanceof Element) {
        return parent.getBoundingClientRect();
      }
      throw new Error('Container parent is not a valid Element');
    }

    function containerRect(): DOMRect {
      const container = containerRef.value;
      if (container instanceof Element) {
        return container.getBoundingClientRect();
      }
      throw new Error('Container is not a valid Element');
    }

    function findDragGridPosition(delta: XYPosition = zeroPos()): XYPosition {
      if (!dragStart.value.x || !dragStart.value.y || !dragStartParent.value.x || !dragStartParent.value.y) {
        throw new Error('No starting drag positions known');
      }

      const x = (((dragStart.value.x + delta.x) - dragStartParent.value.x) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE)) + 1;
      const y = (((dragStart.value.y + delta.y) - dragStartParent.value.y) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE)) + 1;
      const cols = (currentCols.value || localWidget.value.cols) - 1;

      return {
        x: Math.min(Math.max(Math.round(x), 1), gridWidth.value - cols),
        y: Math.max(Math.round(y < 1 ? 1 : y), 1),
      };
    }

    function findAutomaticGridPosition(): XYPosition {
      const container = containerRect();
      const parent = containerParentRect();

      const touchX = container.x;
      const touchY = container.y;

      const parentX = parent.x;
      const parentY = parent.y;

      return {
        x: ((touchX - parentX) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE)) + 1,
        y: ((touchY - parentY) / (GRID_SQUARE_SIZE + GRID_GAP_SIZE)) + 1,
      };
    }

    function onDragStart(e: MouseEvent | TouchEvent): void {
      moving.value = true;
      onInteractionStart(e);

      const container = containerRect();
      const parent = containerParentRect();

      dragStart.value = { x: container.x, y: container.y };
      dragStartParent.value = { x: parent.x, y: parent.y };

      current.value = findDragGridPosition();
    }

    function onDragStop(): void {
      moving.value = false;
      updatePosition({ ...current.value });
      onInteractionEnd();
    }

    function onDragMove(e: MouseEvent | TouchEvent): void {
      const delta = calcMoveDelta(e);
      current.value = findDragGridPosition(delta);
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
      resizePos.value = findAutomaticGridPosition();
      resizing.value = true;
      onInteractionStart(e);
    }

    function onResizeStop(): void {
      resizePos.value = zeroPos();
      resizing.value = false;
      const cols = currentCols.value || localWidget.value.cols;
      const rows = currentRows.value || localWidget.value.rows;
      updateSize(cols, rows);
      onInteractionEnd();
    }

    function onResizeMove(e: MouseEvent | TouchEvent): void {
      const delta = calcMoveDelta(e);
      dragWidth.value = dragStartWidth.value + delta.x;
      dragHeight.value = dragStartHeight.value + delta.y;
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
      const pos = current.value.x > 0
        ? current.value
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

        if (current.value.x === 0) {
          current.value = localWidget.value.pinnedPosition ?? findAutomaticGridPosition();
        }

        current.value.x += delta.x;
        current.value.y += delta.y;
      }
    }

    function applyKeyMove(): void {
      if (keying.value) {
        keying.value = false;
        updatePosition({ ...current.value });
        current.value = zeroPos();
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
