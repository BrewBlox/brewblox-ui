import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable */
@Component({
  props: {
    part: {
      type: Object,
      default: () => { throw new Error('Provide part information'); },
    },
    liquid: {
      type: Number,
      default: null,
    },
    flowing: {
      type: Boolean,
      default: false,
    },
    power: {
      type: Boolean,
      default: false,
    },
  },
})
/* eslint-enable */
export default class Part extends Vue {
  runFrames: boolean = true;
  frame: number = 0;
  directionDefault: number = 0;

  get direction(): number {
    return (this.$props.part && this.$props.part.direction) || this.directionDefault;
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
