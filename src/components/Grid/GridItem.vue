<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

const GRID_SIZE = 100;
const GAP_SIZE = 20;
const MIN_COLS = 2;
const MIN_ROWS = 2;

interface Coordinates { x: number; y: number }

/* eslint-disable @typescript-eslint/no-unused-vars */
@Component({
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
    pos: {
      type: Object,
      required: false,
    },
    cols: {
      type: Number,
      default: MIN_COLS,
    },
    rows: {
      type: Number,
      default: MIN_ROWS,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    noMove: {
      type: Boolean,
      default: false,
    },
    onStartInteraction: {
      type: Function,
      default: () => (id: string) => { },
    },
    onMoveInteraction: {
      type: Function,
      default: () => (pos: XYPosition) => { },
    },
    onStopInteraction: {
      type: Function,
      default: () => () => { },
    },
    onUpdateItemSize: {
      type: Function,
      default: () => (id: string, cols: number, rows: number) => { },
    },
    onUpdatePos: {
      type: Function,
      default: () => (id: string, pos: XYPosition | null) => { },
    },
    onDelete: {
      type: Function,
      required: false,
    },
    onCopy: {
      type: Function,
      required: false,
    },
    onMove: {
      type: Function,
      required: false,
    },
  },
})
/* eslint-enable */
export default class GridItem extends Vue {
  dragging: boolean = false;
  moving: boolean = false;
  modalOpen: boolean = false;

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

  get style(): Record<string, string> {
    return {
      gridColumnEnd: `span ${this.currentCols || this.$props.cols}`,
      gridRowEnd: `span ${this.currentRows || this.$props.rows}`,
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

    // communicate start to parent
    this.$props.onStartInteraction(this.$props.id);
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

  updateSize() {
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

  gridPosition(delta: Coordinates = { x: 0, y: 0 }): { x: number; y: number } {
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

  onDragMove(e: MouseEvent | TouchEvent) {
    const delta = this.moveDelta(e);
    const position = this.gridPosition(delta);

    this.currentStartCols = position.x;
    this.currentStartRows = position.y;

    this.$props.onMoveInteraction({ x: this.currentStartCols, y: this.currentStartRows });
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
    this.$props.onUpdatePos(this.$props.id, { x: this.currentStartCols, y: this.currentStartRows });
    this.stopInteraction();
  }

  resizePanHandler(args: PanArguments) {
    if (this.$props.noMove) {
      return;
    }

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
    this.updateSize();
  }

  stopResize() {
    this.dragging = false;

    this.$props.onUpdateItemSize(
      this.$props.id,
      this.currentCols || this.$props.cols,
      this.currentRows || this.$props.rows,
    );

    this.stopInteraction();
  }

  movePanHandler(args: PanArguments) {
    if (this.$props.noMove) {
      return;
    }

    if (args.isFirst) {
      this.startDrag(args.evt);
      return;
    }

    if (args.isFinal) {
      this.stopDrag();
      return;
    }

    this.onDragMove(args.evt);
  }

  unpin() {
    this.$props.onUpdatePos(this.$props.id, null);
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

    this.$props.onUpdatePos(this.$props.id, pos);
  }
}
</script>

<template>
  <div ref="container" :style="style" class="grid-item">
    <!-- Actual item -->
    <slot/>
    <!-- Drag effects -->
    <div
      v-if="dragging || moving"
      ref="dragOverlay"
      :style="dragStyle"
      class="grid-item-drag-overlay"
    />
    <!-- Item resize button -->
    <button
      v-touch-pan.mouse="resizePanHandler"
      v-if="!$props.noMove && !$props.editable"
      class="grid-item-resize-handle"
    >
      <q-icon name="mdi-resize-bottom-right" size="30px"/>
    </button>
    <!-- Item drag button -->
    <button
      v-touch-pan.mouse="movePanHandler"
      v-if="!dragging && $props.editable"
      class="grid-item-move-handle"
    >
      <div class="column">
        <div v-if="!$props.noMove" class="column">
          <q-icon name="mdi-gesture-swipe-horizontal" size="50px" class="shadowed"/>
          <p class="shadowed">drag</p>
        </div>
        <div class="row">
          <q-btn
            color="primary"
            icon="settings"
            fab
            style="margin-right: 20px"
            @click="modalOpen = true"
          />
          <q-btn
            v-if="!$props.noMove && $props.pos"
            fab
            icon="mdi-pin-off"
            color="primary"
            @click="unpin"
          />
          <q-btn
            v-if="!$props.noMove && !$props.pos"
            fab
            icon="mdi-pin"
            color="primary"
            @click="pin"
          />
        </div>
      </div>
    </button>
    <!-- Action modal -->
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <WidgetActionMenu
        v-if="modalOpen"
        :item-id="$props.id"
        :on-copy="$props.onCopy"
        :on-move="$props.onMove"
        :on-delete="$props.onDelete"
      />
    </q-dialog>
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

.shadowed {
  text-shadow: 0px 2px 0px $dark, 0px -2px 0px $dark, 2px 0px 0px $dark, -2px 0px 0px $dark;
}
</style>
