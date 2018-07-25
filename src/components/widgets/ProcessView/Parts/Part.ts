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
  },
})
/* eslint-enable */
export default class Part extends Vue {
  runFrames: boolean = false;
  frame: number = 0;

  get flowing(): boolean {
    return this.flowingFrom.length > 0 && this.flowingTo.length > 0;
  }

  get flowingFrom(): number[] {
    return (this.$props.part && this.$props.part.flowingFrom) || [];
  }

  get flowingTo(): number[] {
    return (this.$props.part && this.$props.part.flowingTo) || [];
  }

  get liquid() {
    return this.flowingFrom.length > 0;
  }

  get flipped(): boolean {
    return Boolean(this.$props.part && this.$props.part.flipped);
  }

  tickAnimation() {
    window.requestAnimationFrame((timestamp) => {
      if (!this.runFrames) {
        return;
      }

      this.frame = (timestamp % 2000) / 2000;

      this.tickAnimation();
    });
  }

  mounted() {
    this.tickAnimation();
  }

  destroyed() {
    this.runFrames = false;
  }
}
