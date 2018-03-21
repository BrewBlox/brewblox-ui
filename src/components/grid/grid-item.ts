import Vue from 'vue';
import Component from 'vue-class-component';

const GRID_SIZE = 100;
const GAP_SIZE = 20;

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
  startX: number = 0;
  startY: number = 0;
  dragWidth: number = 0;
  dragHeight: number = 0;
  dragStartWidth: number = 0;
  dragStartHeight: number = 0;
  currentCols: number = 0;
  currentRows: number = 0;
  $parent: any;

  data() {
    // update initial values
    return {
      currentCols: parseInt(this.$props.cols, 10),
      currentRows: parseInt(this.$props.rows, 10),
    };
  }

  get style(): string {
    return `
      grid-column-end: span ${this.currentCols};
      grid-row-end: span ${this.currentRows};
    `;
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

  onMove(e: MouseEvent) {
    if (this.$refs.container instanceof Element) {
      const delta = { x: e.pageX - this.startX, y: e.pageY - this.startY };

      this.dragWidth = this.dragStartWidth + delta.x;
      this.dragHeight = this.dragStartHeight + delta.y;

      this.updateSize();
    }
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

  startResize(e: MouseEvent) {
    // bind mouseup on drag end
    window.addEventListener('mouseup', this.stopResize);
    window.addEventListener('mousemove', this.onMove);

    this.dragging = true;

    this.startX = e.pageX;
    this.startY = e.pageY;

    if (this.$refs.container instanceof Element) {
      const { width, height } = this.$refs.container.getBoundingClientRect();

      this.dragWidth = width;
      this.dragHeight = height;

      this.dragStartWidth = width;
      this.dragStartHeight = height;
    }

    this.startInteraction();
  }

  stopResize() {
    // remove mouseup binding
    window.removeEventListener('mouseup', this.stopResize);
    window.removeEventListener('mousemove', this.onMove);

    this.dragging = false;

    this.stopInteraction();
  }
}
