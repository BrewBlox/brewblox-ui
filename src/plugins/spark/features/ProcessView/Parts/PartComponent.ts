import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    part: {
      type: Object,
      required: true,
    },
    power: {
      type: Boolean,
      default: false,
    },
    animationFrame: {
      type: Number,
      default: 0,
    },
  },
})
export default class PartComponent extends Vue {
  get closed(): boolean {
    return !!this.$props.part.closed;
  }

  get frame(): number {
    return this.$props.animationFrame;
  }

  get flowing(): boolean {
    return Object.keys(this.flow).some(angle => this.flowOnAngle(parseInt(angle, 10)) !== 0);
  }

  get flow() {
    return this.$props.part.flow || {};
  }

  get liquid() {
    return Object.keys(this.flow).length > 0;
  }

  get flipped(): boolean {
    return Boolean(this.$props.part && this.$props.part.flipped);
  }

  flowOnAngle(angle: number): number {
    if (!this.flow[angle]) {
      return 0;
    }
    return this.flow[angle];
  }

  toggleClosed() {
    this.$parent.$emit('toggle-closed', this.$props.part, !this.closed);
  }
}
