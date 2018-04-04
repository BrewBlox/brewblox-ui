import Vue from 'vue';
import Component from 'vue-class-component';

const GRID_SIZE = 100;
const GAP_SIZE = 20;

type Coordinates = { x: number, y: number };

@Component({
  props: {
    id: {
      type: [String, Number],
      default: () => { throw new Error('Provide an id'); },
    },
    cols: {
      type: Number,
      default: 1,
    },
    rows: {
      type: Number,
      default: 1,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    onStartInteraction: {
      type: Function,
      default: () => {},
    },
    onStopInteraction: {
      type: Function,
      default: () => {},
    },
    onUpdateItemSize: {
      type: Function,
      default: () => {},
    },
    onNewItemsOrder: {
      type: Function,
      default: () => {},
    },
  },
})
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
      return <DOMRect>this.$refs.container.parentNode.getBoundingClientRect();
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
      return <DOMRect>this.$refs.container.parentNode.firstChild.getBoundingClientRect();
    }

    throw new Error('Container parent is not a valid Element');
  }

  containerSize(): DOMRect {
    if (this.$refs.container instanceof Element) {
      return <DOMRect>this.$refs.container.getBoundingClientRect();
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

    const x = ((this.dragStartX + delta.x) - this.dragStartParentX) / (GRID_SIZE + GAP_SIZE) + 1;
    const y = ((this.dragStartY + delta.y) - this.dragStartParentY) / (GRID_SIZE + GAP_SIZE) + 1;
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
