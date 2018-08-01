import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable */
@Component({
  props: {
    part: {
      type: Object,
      default: () => { throw new Error('Provide part information'); },
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
/* eslint-enable */
export default class Part extends Vue {
  get closed(): boolean {
    return !!this.$props.closed;
  }

  get frame(): number {
    return this.$props.animationFrame;
  }

  get flowing(): boolean {
    return this.flowingFrom.length > 0 && this.flowingTo.length > 0;
  }

  get flowingFrom(): number[] {
    return [];
  }

  get flowingTo(): number[] {
    return [];
  }

  get liquid() {
    return this.flowingFrom.length > 0;
  }

  get flipped(): boolean {
    return Boolean(this.$props.part && this.$props.part.flipped);
  }
}
