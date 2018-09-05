<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

const GRID_SIZE = 100;
const GAP_SIZE = 20;

type Coordinates = { x: number, y: number };

/* eslint-disable indent */
@Component({
  props: {
    id: {
      type: [String, Number],
      default: () => { throw new Error('Provide an id'); },
    },
    cols: {
      type: Number,
      default: () => { throw new Error('Provide cols'); },
    },
    rows: {
      type: Number,
      default: () => { throw new Error('Provide rows'); },
    },
    editable: {
      type: Boolean,
      default: false,
    },
    onStartInteraction: {
      type: Function,
      default: () => { },
    },
    onStopInteraction: {
      type: Function,
      default: () => { },
    },
    onUpdateItemSize: {
      type: Function,
      default: () => { },
    },
    onNewItemsOrder: {
      type: Function,
      default: () => { },
    },
  },
})
/* eslint-enable */
export default class GridItem extends Vue {
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

  get style(): string {
    const spans = `
      grid-column-end: span ${this.currentCols || this.$props.cols};
      grid-row-end: span ${this.currentRows || this.$props.rows};
    `;

    if (this.currentStartCols && this.currentStartRows) {
      return `
        grid-column-start: ${this.currentStartCols};
        grid-row-start: ${this.currentStartRows};
        ${spans}
      `;
    }

    return spans;
  }

  get dragStyle(): string {
    return `
      width: ${this.dragWidth}px;
      height: ${this.dragHeight}px;
    `;
  }

  startInteraction(e: MouseEvent | TouchEvent) {
    // prevent scrolling
    e.preventDefault();

    this.setMouseStartPosition(e);

    // set initial values of item
    const { width, height } = this.containerSize();
    const parent = this.containerParentSize();

    this.gridWidth = Math.floor((parent.width + GAP_SIZE) / (GAP_SIZE + GRID_SIZE));

    this.dragWidth = width;
    this.dragHeight = height;

    this.dragStartWidth = width;
    this.dragStartHeight = height;

    // communicate start to parent
    this.$props.onStartInteraction();
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

    // communicate stop to parent
    this.$props.onStopInteraction();
  }

  onResizeMove(e: MouseEvent | TouchEvent) {
    const delta = this.moveDelta(e);

    this.dragWidth = this.dragStartWidth + delta.x;
    this.dragHeight = this.dragStartHeight + delta.y;

    this.updateSize();
  }

  updateSize() {
    const newCols = Math.round((this.dragWidth + GAP_SIZE) / (GRID_SIZE + GAP_SIZE));
    const newRows = Math.round((this.dragHeight + GAP_SIZE) / (GRID_SIZE + GAP_SIZE));

    if (newCols !== this.currentCols && newCols <= this.gridWidth) {
      this.currentCols = newCols;
    }

    if (newRows !== this.currentRows) {
      this.currentRows = newRows;
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
      this.$refs.container instanceof Element &&
      this.$refs.container.parentNode &&
      this.$refs.container.parentNode instanceof Element
    ) {
      return this.$refs.container.parentNode.getBoundingClientRect() as DOMRect;
    }

    throw new Error('Container parent is not a valid Element');
  }

  containerFirstChildSize(): DOMRect {
    if (
      this.$refs.container instanceof Element &&
      this.$refs.container.parentNode &&
      this.$refs.container.parentNode.firstChild &&
      this.$refs.container.parentNode.firstChild instanceof Element
    ) {
      return this.$refs.container.parentNode.firstChild.getBoundingClientRect() as DOMRect;
    }

    throw new Error('Container parent is not a valid Element');
  }

  containerSize(): DOMRect {
    if (this.$refs.container instanceof Element) {
      return this.$refs.container.getBoundingClientRect() as DOMRect;
    }

    throw new Error('Container is not a valid Element');
  }

  startResize(e: MouseEvent | TouchEvent) {
    // bind mouseup on drag end
    window.addEventListener('mouseup', this.stopResize);
    window.addEventListener('mousemove', this.onResizeMove);

    this.dragging = true;

    this.startInteraction(e);
  }

  stopResize() {
    // remove mouseup binding
    window.removeEventListener('mouseup', this.stopResize);
    window.removeEventListener('mousemove', this.onResizeMove);

    this.dragging = false;

    this.$props.onUpdateItemSize(
      this.$props.id,
      this.currentCols || this.$props.cols,
      this.currentRows || this.$props.rows,
    );

    this.stopInteraction();
  }

  gridPosition(delta: Coordinates = { x: 0, y: 0 }): { x: number, y: number } {
    if (!this.dragStartX || !this.dragStartY || !this.dragStartParentX || !this.dragStartParentY) {
      throw new Error('No starting drag positions know');
    }

    const x = (((this.dragStartX + delta.x) - this.dragStartParentX) / (GRID_SIZE + GAP_SIZE)) + 1;
    const y = (((this.dragStartY + delta.y) - this.dragStartParentY) / (GRID_SIZE + GAP_SIZE)) + 1;
    const cols = (this.currentCols || this.$props.cols) - 1;

    return {
      x: Math.min(Math.max(Math.round(x), 1), this.gridWidth - cols),
      y: Math.max(Math.round(y < 1 ? 1 : y), 1),
    };
  }

  onDragMove(e: MouseEvent) {
    const delta = this.moveDelta(e);

    const position = this.gridPosition(delta);

    this.currentStartCols = position.x;
    this.currentStartRows = position.y;
  }

  startDrag(e: MouseEvent | TouchEvent) {
    // bind mouseup on drag end
    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('mousemove', this.onDragMove);

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
    // remove mouseup binding
    window.removeEventListener('mouseup', this.stopDrag);
    window.removeEventListener('mousemove', this.onDragMove);

    this.moving = false;

    this.$props.onNewItemsOrder();

    this.stopInteraction();
  }
}
</script>

<template>
  <div
    class="grid-item"
    :style="style"
    ref="container"
  >
    <slot />
    <div
      v-if="dragging || moving"
      class="grid-item-drag-overlay"
      :style="dragStyle"
      ref="dragOverlay"
    >
      <div
        v-if="!moving"
        class="grid-item-resize-handle"
      >
        <q-icon
          name="mdi-resize-bottom-right"
          size="30px"
        />
      </div>
    </div>
    <button
      class="grid-item-resize-handle"
      @mousedown="startResize"
      @touchstart="startResize"
      @touchmove="onResizeMove"
      @touchend="stopResize"
      v-if="!dragging && !moving && editable"
    >
      <q-icon
        name="mdi-resize-bottom-right"
        size="30px"
      />
    </button>
    <button
      class="grid-item-move-handle"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @touchmove="onDragMove"
      @touchend="stopDrag"
      v-if="!dragging && editable"
    />
  </div>
</template>

<style scoped>
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
  z-index: 2;
  bottom: 0;
  cursor: nwse-resize;
  right: 0;
}

.grid-item-move-handle {
  left: 0;
  top: 0;
  position: absolute;
  background: transparent;
  border: 0;
  cursor: move;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.grid-item-drag-overlay {
  background: rgba(255, 255, 255, 0.2);
  top: 0;
  bottom: 0;
  position: absolute;
  z-index: 1;
}
</style>
