import Vue from 'vue';
import Component from 'vue-class-component';

const GRID_SIZE = 100;
const GAP_SIZE = 20;

type Coordinates = { x: number, y: number };

@Component({
  props: {
    cols: {
      type: String,
      default: '1',
    },
    rows: {
      type: String,
      default: '1',
    },
  },
})
export default class GridItem extends Vue {
  dragging: boolean = false;
  moving: boolean = false;

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

  currentCols: number = 0;
  currentRows: number = 0;
  currentStartCols: number | null = null;
  currentStartRows: number | null = null;

  $parent: any;

  data() {
    // update initial values
    return {
      currentCols: parseInt(this.$props.cols, 10),
      currentRows: parseInt(this.$props.rows, 10),
    };
  }

  get style(): string {
    const spans = `
      grid-column-end: span ${this.currentCols};
      grid-row-end: span ${this.currentRows};
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

  startInteraction() {
    if (this.$parent.startInteraction) {
      this.$parent.startInteraction();
    }
  }

  stopInteraction() {
    if (this.$parent.stopInteraction) {
      this.$parent.stopInteraction();
    }
  }

  onResizeMove(e: MouseEvent) {
    const delta = this.moveDelta(e);

    this.dragWidth = this.dragStartWidth + delta.x;
    this.dragHeight = this.dragStartHeight + delta.y;

    this.updateSize();
  }

  updateSize() {
    const gridWidth = Math.round((this.dragWidth + GAP_SIZE) / (GRID_SIZE + GAP_SIZE));
    const gridHeight = Math.round((this.dragHeight + GAP_SIZE) / (GRID_SIZE + GAP_SIZE));

    if (gridWidth !== this.currentCols) {
      this.currentCols = gridWidth;
    }

    if (gridHeight !== this.currentRows) {
      this.currentRows = gridHeight;
    }

    // @TODO: if changed: communicate to grid container
  }

  setMouseStartPosition(e: MouseEvent) {
    this.startX = e.pageX;
    this.startY = e.pageY;
  }

  moveDelta(e: MouseEvent): Coordinates {
    return { x: e.pageX - this.startX, y: e.pageY - this.startY };
  }

  containerSize(): { width: number, height: number } {
    if (this.$refs.container instanceof Element) {
      const { width, height } = this.$refs.container.getBoundingClientRect();

      return { width, height };
    }

    throw new Error('Container is not a valid Element');
  }

  startResize(e: MouseEvent) {
    // bind mouseup on drag end
    window.addEventListener('mouseup', this.stopResize);
    window.addEventListener('mousemove', this.onResizeMove);

    this.dragging = true;

    this.setMouseStartPosition(e);

    const { width, height } = this.containerSize();

    this.dragWidth = width;
    this.dragHeight = height;

    this.dragStartWidth = width;
    this.dragStartHeight = height;

    this.startInteraction();
  }

  stopResize() {
    // remove mouseup binding
    window.removeEventListener('mouseup', this.stopResize);
    window.removeEventListener('mousemove', this.onResizeMove);

    this.dragging = false;

    this.stopInteraction();
  }

  gridPosition(delta: Coordinates = { x: 0, y: 0 }): { x: number, y: number } {
    if (!this.dragStartX || !this.dragStartY || !this.dragStartParentX || !this.dragStartParentY) {
      throw new Error('No starting drag positions know');
    }

    const x = ((this.dragStartX + delta.x) - this.dragStartParentX) / (GRID_SIZE + GAP_SIZE) + 1;
    const y = ((this.dragStartY + delta.y) - this.dragStartParentY) / (GRID_SIZE + GAP_SIZE) + 1;

    return {
      x: Math.round(x),
      y: Math.round(y),
    };
  }

  onDragMove(e: MouseEvent) {
    const delta = this.moveDelta(e);

    const position = this.gridPosition(delta);

    this.currentStartCols = position.x;
    this.currentStartRows = position.y;

    console.log(position);
  }

  startDrag(e: MouseEvent) {
    // bind mouseup on drag end
    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('mousemove', this.onDragMove);

    this.moving = true;

    this.setMouseStartPosition(e);

    if (
      this.$refs.container instanceof Element &&
      this.$refs.container.parentNode &&
      this.$refs.container.parentNode.firstChild &&
      this.$refs.container.parentNode.firstChild instanceof Element
    ) {
      const rects = <DOMRect>this.$refs.container.getBoundingClientRect();
      const parentRects =
        <DOMRect>this.$refs.container.parentNode.firstChild.getBoundingClientRect();

      this.dragStartX = rects.x;
      this.dragStartY = rects.y;

      this.dragStartParentX = parentRects.x;
      this.dragStartParentY = parentRects.y;

      const position = this.gridPosition();

      this.currentStartCols = position.x;
      this.currentStartRows = position.y;
    }

    this.startInteraction();
  }

  stopDrag() {
    // remove mouseup binding
    window.removeEventListener('mouseup', this.stopDrag);
    window.removeEventListener('mousemove', this.onDragMove);

    this.moving = false;

    // @TODO calc new order of items

    this.currentStartCols = null;
    this.currentStartRows = null;

    this.dragStartX = 0;
    this.dragStartY = 0;

    this.dragStartParentX = 0;
    this.dragStartParentY = 0;

    this.stopInteraction();
  }
}
