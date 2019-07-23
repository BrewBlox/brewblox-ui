<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';

import { DashboardItem } from '@/store/dashboards';

const GRID_SIZE = 100;
const GAP_SIZE = 20;
const MIN_COLS = 2;
const MIN_ROWS = 2;

interface Coordinates { x: number; y: number };

@Component
export default class GridItem extends Vue {

  @Ref()
  readonly container!: Vue;

  @Ref()
  readonly dragOverlay!: Vue;

  @Prop({ type: Object, required: true })
  readonly widget!: DashboardItem;

  @Prop({ type: Boolean, default: false })
  readonly editable!: boolean;

  dragging: boolean = false;
  moving: boolean = false;

  gridWidth: number = 0;
  startX: number = 0;
  startY: number = 0;
  dragWidth: number = 0;
  dragHeight: number = 0;
  dragStartWidth: number = 0;
  dragStartHeight: number = 0;
  dragStartX: number = 0;
  dragStartY: number = 0;
  dragStartParentX: number = 0;
  dragStartParentY: number = 0;

  currentCols: number | null = null;
  currentRows: number | null = null;
  currentStartCols: number | null = null;
  currentStartRows: number | null = null;

  // Used by GridContainer
  get id(): string {
    return this.widget.id;
  }

  get style(): Record<string, string> {
    return {
      gridColumnEnd: `span ${this.currentCols || this.widget.cols}`,
      gridRowEnd: `span ${this.currentRows || this.widget.rows}`,
    };
  }

  get dragStyle(): Record<string, string> {
    return {
      width: `${this.dragWidth}px`,
      height: `${this.dragHeight}px`,
    };
  }

  startInteraction(e: MouseEvent | TouchEvent) {
    this.setMouseStartPosition(e);

    // set initial values of item
    const { width, height } = this.containerSize();
    const parent = this.containerParentSize();

    this.gridWidth = Math.floor((parent.width + GAP_SIZE) / (GAP_SIZE + GRID_SIZE));

    this.dragWidth = width;
    this.dragHeight = height;

    this.dragStartWidth = width;
    this.dragStartHeight = height;

    this.$emit('start-edit', this.id);
  }

  stopInteraction() {
    // reset values of item
    this.currentCols = null;
    this.currentRows = null;

    this.currentStartCols = null;
    this.currentStartRows = null;

    this.dragStartX = 0;
    this.dragStartY = 0;

    this.dragStartParentX = 0;
    this.dragStartParentY = 0;

    this.$emit('stop-edit', this.id);
  }

  moveInteraction(e: MouseEvent | TouchEvent) {
    const delta = this.moveDelta(e);
    const position = this.gridPosition(delta);

    this.currentStartCols = position.x;
    this.currentStartRows = position.y;

    this.$emit('move', this.id, { x: this.currentStartCols, y: this.currentStartRows });
  }

  updateSize() {
    this.$emit('size',
      this.id,
      this.currentCols || this.widget.cols,
      this.currentRows || this.widget.rows);
  }

  updatePosition(pos: XYPosition | null) {
    this.$emit('position', this.id, pos);
  }

  changeSize() {
    const newCols = Math.round((this.dragWidth + GAP_SIZE) / (GRID_SIZE + GAP_SIZE));
    const newRows = Math.round((this.dragHeight + GAP_SIZE) / (GRID_SIZE + GAP_SIZE));

    if (newCols !== this.currentCols && newCols <= this.gridWidth) {
      this.currentCols = Math.max(newCols, MIN_COLS);
    }

    if (newRows !== this.currentRows) {
      this.currentRows = Math.max(newRows, MIN_ROWS);
    }
  }

  setMouseStartPosition(e: MouseEvent | TouchEvent) {
    if (e instanceof MouseEvent) {
      this.startX = e.pageX;
      this.startY = e.pageY;
    } else {
      this.startX = e.touches[0].pageX;
      this.startY = e.touches[0].pageY;
    }
  }

  moveDelta(e: MouseEvent | TouchEvent): Coordinates {
    if (e instanceof MouseEvent) {
      return { x: e.pageX - this.startX, y: e.pageY - this.startY };
    }
    return { x: e.touches[0].pageX - this.startX, y: e.touches[0].pageY - this.startY };
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

  gridPosition(delta: Coordinates = { x: 0, y: 0 }): { x: number; y: number } {
    if (!this.dragStartX || !this.dragStartY || !this.dragStartParentX || !this.dragStartParentY) {
      throw new Error('No starting drag positions know');
    }

    const x = (((this.dragStartX + delta.x) - this.dragStartParentX) / (GRID_SIZE + GAP_SIZE)) + 1;
    const y = (((this.dragStartY + delta.y) - this.dragStartParentY) / (GRID_SIZE + GAP_SIZE)) + 1;
    const cols = (this.currentCols || this.widget.cols) - 1;

    return {
      x: Math.min(Math.max(Math.round(x), 1), this.gridWidth - cols),
      y: Math.max(Math.round(y < 1 ? 1 : y), 1),
    };
  }

  startDrag(e: MouseEvent | TouchEvent) {
    this.moving = true;
    this.startInteraction(e);

    const rects = this.containerSize();
    const firstChildRects = this.containerFirstChildSize();

    this.dragStartX = rects.x;
    this.dragStartY = rects.y;

    this.dragStartParentX = firstChildRects.x;
    this.dragStartParentY = firstChildRects.y;

    const position = this.gridPosition();

    this.currentStartCols = position.x;
    this.currentStartRows = position.y;
  }

  stopDrag() {
    this.moving = false;
    const pos = { x: this.currentStartCols, y: this.currentStartRows };
    this.updatePosition(pos as XYPosition);
    this.stopInteraction();
  }

  resizePanHandler(args: PanArguments) {
    if (args.isFirst) {
      this.startResize(args.evt);
      return;
    }

    if (args.isFinal) {
      this.stopResize();
      return;
    }

    this.onResizeMove(args.evt);
  }

  startResize(e: MouseEvent | TouchEvent) {
    this.dragging = true;
    this.startInteraction(e);
  }

  onResizeMove(e: MouseEvent | TouchEvent) {
    const delta = this.moveDelta(e);
    this.dragWidth = this.dragStartWidth + delta.x;
    this.dragHeight = this.dragStartHeight + delta.y;
    this.changeSize();
  }

  stopResize() {
    this.dragging = false;
    this.updateSize();
    this.stopInteraction();
  }

  movePanHandler(args: PanArguments) {
    if (args.isFirst) {
      this.startDrag(args.evt);
      return;
    }

    if (args.isFinal) {
      this.stopDrag();
      return;
    }

    this.moveInteraction(args.evt);
  }

  unpin() {
    this.updatePosition(null);
  }

  pin() {
    const rects = this.containerSize();
    const firstChildRects = this.containerFirstChildSize();

    const touchX = rects.x;
    const touchY = rects.y;

    const parentX = firstChildRects.x;
    const parentY = firstChildRects.y;

    const pos: XYPosition = {
      x: ((touchX - parentX) / (GRID_SIZE + GAP_SIZE)) + 1,
      y: ((touchY - parentY) / (GRID_SIZE + GAP_SIZE)) + 1,
    };

    this.updatePosition(pos);
  }
}
</script>

<template>
  <div ref="container" :style="style" class="grid-item">
    <!-- Actual item -->
    <slot />
    <!-- Drag effects -->
    <div
      v-if="dragging || moving"
      ref="dragOverlay"
      :style="dragStyle"
      class="grid-item-drag-overlay"
    />
    <!-- Item resize button -->
    <button v-touch-pan.mouse="resizePanHandler" v-if="!editable" class="grid-item-resize-handle">
      <q-icon name="mdi-resize-bottom-right" size="30px" />
    </button>
    <!-- Item drag button -->
    <button
      v-touch-pan.mouse="movePanHandler"
      v-if="editable"
      class="grid-item-move-handle grid-item-movable"
    >
      <div class="row">
        <div class="column">
          <q-icon name="mdi-gesture-swipe-horizontal" size="50px" class="shadowed" />
          <p class="shadowed">drag</p>
        </div>
        <q-btn
          :icon="widget.pinnedPosition ? 'mdi-pin-off' : 'mdi-pin'"
          fab
          color="primary"
          @click="() => (widget.pinnedPosition ? unpin : pin)()"
        />
      </div>
    </button>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../styles/quasar.styl';

.grid-item {
  position: relative;
}

.grid-item-resize-handle {
  border: 0;
  width: 34px;
  height: 34px;
  background: transparent;
  position: absolute;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  outline: none;
  z-index: 3;
  bottom: 0;
  cursor: nwse-resize;
  right: 0;
}

.grid-item-move-handle {
  left: 0;
  top: 0;
  position: absolute;
  background: transparent;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.grid-item-movable {
  cursor: move;
}

.grid-item-drag-overlay {
  background: rgba(255, 255, 255, 0.2);
  top: 0;
  bottom: 0;
  position: absolute;
  z-index: 1;
}

.shadowed {
  text-shadow: 0px 2px 0px $dark, 0px -2px 0px $dark, 2px 0px 0px $dark, -2px 0px 0px $dark;
}
</style>
