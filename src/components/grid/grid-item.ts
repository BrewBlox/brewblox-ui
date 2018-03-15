import Vue from 'vue';
import Component from 'vue-class-component';

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

  get style(): string {
    const { cols, rows } = this.$props;

    return `
      grid-column-end: span ${parseInt(cols, 10)};
      grid-row-end: span ${parseInt(rows, 10)};
    `;
  }

  get dragStyle(): string {
    return `
      width: ${this.dragWidth}px;
      height: ${this.dragHeight}px;
    `;
  }

  onMove(e: MouseEvent) {
    if (this.$refs.container instanceof Element) {
      const delta = { x: e.screenX - this.startX, y: e.screenY - this.startY };

      const { width, height } = this.$refs.container.getBoundingClientRect();

      this.dragWidth = width + delta.x;
      this.dragHeight = height + delta.y;
    }
  }

  startResize(e: MouseEvent) {
    // bind mouseup on drag end
    window.addEventListener('mouseup', this.stopResize);
    window.addEventListener('mousemove', this.onMove);

    this.dragging = true;

    this.startX = e.screenX;
    this.startY = e.screenY;

    if (this.$refs.container instanceof Element) {
      const { width, height } = this.$refs.container.getBoundingClientRect();

      this.dragWidth = width;
      this.dragHeight = height;
    }
  }

  stopResize() {
    // remove mouseup binding
    window.removeEventListener('mouseup', this.stopResize);
    window.removeEventListener('mousemove', this.onMove);

    this.dragging = false;
  }
}
