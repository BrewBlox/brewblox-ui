<script lang="ts">
import clamp from 'lodash/clamp';
import { debounce } from 'quasar';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';

import { Widget } from '@/store/dashboards';

const GRID_SIZE = 100;
const GAP_SIZE = 20;
const MIN_COLS = 2;
const MIN_ROWS = 2;
const MAX_TICK_DELTA = 15;

const zeroPos = (): XYPosition => ({ x: 0, y: 0 });

const moveCodes: Record<string, XYPosition> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

@Component
export default class GridItem extends Vue {
  resizing = false;
  moving = false;
  keying = false;

  gridWidth = 0;
  touchStart: XYPosition = zeroPos();
  dragWidth = 0;
  dragHeight = 0;
  dragStartWidth = 0;
  dragStartHeight = 0;
  dragStart: XYPosition = zeroPos();
  dragStartParent: XYPosition = zeroPos();

  currentCols: number | null = null;
  currentRows: number | null = null;
  current: XYPosition = zeroPos();
  lastDelta: XYPosition = zeroPos();

  resizePos: XYPosition = zeroPos();
  debouncedEmit = debounce(this.$emit, 500);

  @Ref()
  readonly container!: Vue;

  @Ref()
  readonly dragOverlay!: Vue;

  @Prop({ type: Object, required: true })
  readonly widget!: Widget;

  @Prop({ type: Boolean, default: false })
  readonly editable!: boolean;

  // Used by GridContainer
  get id(): string {
    return this.widget.id;
  }

  get style(): Mapped<string> {
    const { pinnedPosition, cols, rows } = this.widget;
    const pinned = pinnedPosition || zeroPos();

    return {
      gridColumnStart: `${this.current.x || pinned.x || this.resizePos.x || 'auto'}`,
      gridRowStart: `${this.current.y || pinned.y || this.resizePos.y || 'auto'}`,
      gridColumnEnd: `span ${this.currentCols || cols}`,
      gridRowEnd: `span ${this.currentRows || rows}`,
    };
  }

  get dragStyle(): Mapped<string> {
    return {
      width: `${this.dragWidth}px`,
      height: `${this.dragHeight}px`,
    };
  }

  updatePosition(pos: XYPosition | null): void {
    // Set local cache to avoid jumps
    this.$set(this.widget, 'pinnedPosition', pos);
    this.debouncedEmit('position', this.id, pos);
  }

  updateSize(cols: number, rows: number): void {
    // Set local cache to avoid jumps
    this.$set(this.widget, 'cols', cols);
    this.$set(this.widget, 'rows', rows);
    this.debouncedEmit('size', this.id, cols, rows);
  }

  onInteractionStart(e: MouseEvent | TouchEvent): void {
    const touch = (e instanceof MouseEvent) ? e : e.touches[0];

    this.touchStart = {
      x: touch.pageX,
      y: touch.pageY,
    };

    // set initial values of item
    const { width, height } = this.containerSize();
    const parent = this.containerParentSize();

    this.gridWidth = Math.floor((parent.width + GAP_SIZE) / (GAP_SIZE + GRID_SIZE));

    this.dragWidth = width;
    this.dragHeight = height;

    this.dragStartWidth = width;
    this.dragStartHeight = height;
  }

  onInteractionEnd(): void {
    this.touchStart = zeroPos();

    // reset values of item
    this.currentCols = null;
    this.currentRows = null;

    this.lastDelta = zeroPos();
    this.current = zeroPos();
    this.dragStart = zeroPos();
    this.dragStartParent = zeroPos();
  }

  changeSize(): void {
    const newCols = Math.round((this.dragWidth + GAP_SIZE) / (GRID_SIZE + GAP_SIZE));
    const newRows = Math.round((this.dragHeight + GAP_SIZE) / (GRID_SIZE + GAP_SIZE));

    if (newCols !== this.currentCols && newCols <= this.gridWidth) {
      this.currentCols = Math.max(newCols, MIN_COLS);
    }

    if (newRows !== this.currentRows) {
      this.currentRows = Math.max(newRows, MIN_ROWS);
    }
  }

  calcMoveDelta(e: MouseEvent | TouchEvent): XYPosition {
    const touch = (e instanceof MouseEvent) ? e : e.touches[0];
    const { x, y } = this.lastDelta;
    const raw = {
      x: touch.pageX - this.touchStart.x,
      y: touch.pageY - this.touchStart.y,
    };
    // Clamp to avoid instant screen jumps
    const newDelta = {
      x: clamp(raw.x, x - MAX_TICK_DELTA, x + MAX_TICK_DELTA),
      y: clamp(raw.y, y - MAX_TICK_DELTA, y + MAX_TICK_DELTA),
    };
    this.lastDelta = { ...newDelta };
    return newDelta;
  }

  containerParentSize(): DOMRect {
    if (
      this.container instanceof Element &&
      this.container.parentNode &&
      this.container.parentNode instanceof Element
    ) {
      return this.container.parentNode.getBoundingClientRect() as DOMRect;
    }
    throw new Error('Container parent is not a valid Element');
  }

  containerFirstChildSize(): DOMRect {
    if (
      this.container instanceof Element &&
      this.container.parentNode &&
      this.container.parentNode.firstChild &&
      this.container.parentNode.firstChild instanceof Element
    ) {
      return this.container.parentNode.firstChild.getBoundingClientRect() as DOMRect;
    }
    throw new Error('Container parent is not a valid Element');
  }

  containerSize(): DOMRect {
    if (this.container instanceof Element) {
      return this.container.getBoundingClientRect() as DOMRect;
    }
    throw new Error('Container is not a valid Element');
  }

  findDragGridPosition(delta: XYPosition = zeroPos()): XYPosition {
    if (!this.dragStart.x || !this.dragStart.y || !this.dragStartParent.x || !this.dragStartParent.y) {
      throw new Error('No starting drag positions known');
    }

    const x = (((this.dragStart.x + delta.x) - this.dragStartParent.x) / (GRID_SIZE + GAP_SIZE)) + 1;
    const y = (((this.dragStart.y + delta.y) - this.dragStartParent.y) / (GRID_SIZE + GAP_SIZE)) + 1;
    const cols = (this.currentCols || this.widget.cols) - 1;

    return {
      x: Math.min(Math.max(Math.round(x), 1), this.gridWidth - cols),
      y: Math.max(Math.round(y < 1 ? 1 : y), 1),
    };
  }

  findAutomaticGridPosition(): XYPosition {
    const rects = this.containerSize();
    const firstChildRects = this.containerFirstChildSize();

    const touchX = rects.x;
    const touchY = rects.y;

    const parentX = firstChildRects.x;
    const parentY = firstChildRects.y;

    return {
      x: ((touchX - parentX) / (GRID_SIZE + GAP_SIZE)) + 1,
      y: ((touchY - parentY) / (GRID_SIZE + GAP_SIZE)) + 1,
    };
  }

  onDragStart(e: MouseEvent | TouchEvent): void {
    this.moving = true;
    this.onInteractionStart(e);

    const rects = this.containerSize();
    const firstChildRects = this.containerFirstChildSize();

    this.dragStart = { x: rects.x, y: rects.y };
    this.dragStartParent = { x: firstChildRects.x, y: firstChildRects.y };

    this.current = this.findDragGridPosition();
  }

  onDragStop(): void {
    this.moving = false;
    this.updatePosition({ ...this.current });
    this.onInteractionEnd();
  }

  onDragMove(e: MouseEvent | TouchEvent): void {
    const delta = this.calcMoveDelta(e);
    this.current = this.findDragGridPosition(delta);
  }

  movePanHandler(args: PanArguments): void {
    if (args.isFirst) {
      this.onDragStart(args.evt);
    }
    else if (args.isFinal) {
      this.onDragStop();
    }
    else {
      this.onDragMove(args.evt);
    }
  }

  onResizeStart(e: MouseEvent | TouchEvent): void {
    this.resizePos = this.findAutomaticGridPosition();
    this.resizing = true;
    this.onInteractionStart(e);
  }

  onResizeStop(): void {
    this.resizePos = zeroPos();
    this.resizing = false;
    const cols = this.currentCols || this.widget.cols;
    const rows = this.currentRows || this.widget.rows;
    this.updateSize(cols, rows);
    this.onInteractionEnd();
  }

  onResizeMove(e: MouseEvent | TouchEvent): void {
    const delta = this.calcMoveDelta(e);
    this.dragWidth = this.dragStartWidth + delta.x;
    this.dragHeight = this.dragStartHeight + delta.y;
    this.changeSize();
  }

  resizePanHandler(args: PanArguments): void {
    if (args.isFirst) {
      this.onResizeStart(args.evt);
    }
    else if (args.isFinal) {
      this.onResizeStop();
    }
    else {
      this.onResizeMove(args.evt);
    }
  }

  unpin(): void {
    this.updatePosition(null);
  }

  pin(): void {
    const pos = this.current.x > 0
      ? this.current
      : this.findAutomaticGridPosition();
    this.updatePosition(pos);
  }

  keydown(evt: KeyboardEvent): void {
    if (!this.editable || this.moving) {
      return;
    }
    if (evt.key === 'Enter') {
      this.applyKeyMove();
      return;
    }

    const delta = moveCodes[evt.key];
    if (delta) {
      this.keying = true;
      evt.stopPropagation();
      evt.preventDefault();

      if (this.current.x === 0) {
        this.current = this.widget.pinnedPosition ?? this.findAutomaticGridPosition();
      }

      this.current.x += delta.x;
      this.current.y += delta.y;
    }
  }

  applyKeyMove(): void {
    if (this.keying) {
      this.keying = false;
      this.updatePosition({ ...this.current });
      this.current = zeroPos();
    }
  }
}
</script>

<template>
  <div
    ref="container"
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
      ref="dragOverlay"
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
          :icon="widget.pinnedPosition ? 'mdi-pin' : undefined"
          :label="widget.pinnedPosition ? 'Pinned' : 'Pin position'"
          :unelevated="!!widget.pinnedPosition"
          :outline="!widget.pinnedPosition"
          :disable="keying"
          rounded
          color="secondary"
          @click="widget.pinnedPosition ? unpin() : pin()"
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
