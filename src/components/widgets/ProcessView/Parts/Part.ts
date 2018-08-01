import Vue from 'vue';
import Component from 'vue-class-component';

import { rotated } from '@/components/widgets/ProcessView/calculateFlows';

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
  // rotated angles to their unrotated counter parts for correct rendering
  fixFlow(angle: number) {
    return rotated(angle, this.$props.part.rotate * -1 || 0);
  }

  get closed(): boolean {
    return !!this.$props.closed;
  }

  get frame(): number {
    return this.$props.animationFrame;
  }

  get flowing(): boolean {
    return this.flowingFrom.length > 0 && this.flowingTo.length > 0;
  }

  get flowTo(): number[] {
    if (!this.$props.part || !this.$props.part.flow) {
      return [];
    }

    return Object.keys(this.$props.part.flow).map(flow => parseInt(flow, 10));
  }

  get flowingFrom(): number[] {
    return ((this.$props.part && this.$props.part.flowingFrom) || []).map(this.fixFlow);
  }

  get flowingTo(): number[] {
    return this.flowTo.filter(angle => this.$props.part.flow[angle] > 0).map(this.fixFlow);
  }

  get liquid() {
    return this.flowingFrom.length > 0;
  }

  get flipped(): boolean {
    return Boolean(this.$props.part && this.$props.part.flipped);
  }
}
