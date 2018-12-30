import Vue from 'vue';
import Component from 'vue-class-component';
import { FlowPart, AngledFlows } from '../state';
import { COLD_WATER } from '../getters';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class PartComponent extends Vue {
  static flows(part: FlowPart): AngledFlows {
    return {};
  }

  static get isSource() {
    return false;
  }

  static get isBridge() {
    return false;
  }

  get part(): FlowPart {
    return this.$props.value;
  }

  get closed(): boolean {
    return Boolean(this.part.closed);
  }

  get flipped(): boolean {
    return Boolean(this.part.flipped);
  }

  get disabled(): boolean {
    return Boolean(this.part.disabled);
  }

  get flowing(): boolean {
    return Object.keys(this.flow).some(angle => this.flowOnAngle(Number(angle)) !== 0);
  }

  get flow() {
    return this.part.flow || {};
  }

  get liquid() {
    return Object.keys(this.flow).length > 0;
  }

  get liquidColor() {
    return COLD_WATER;
  }

  flowOnAngle(angle: number): number {
    return this.flow[Number(angle)] || 0;
  }

  toggleClosed() {
    this.$parent.$emit('input', { ...this.part, closed: !this.closed });
  }

  toggleFlipped() {
    this.$parent.$emit('input', { ...this.part, flipped: !this.flipped });
  }

  toggleDisabled() {
    this.$parent.$emit('input', { ...this.part, disabled: !this.disabled });
  }
}
