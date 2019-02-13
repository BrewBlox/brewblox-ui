import Vue from 'vue';
import Component from 'vue-class-component';

import { AngledFlows, FlowPart } from '../state';

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

  static get cards(): string[] {
    return [];
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
    return Object.keys(this.flow)
      .some(angle => this.flowOnAngle(angle) !== 0);
  }

  get flow() {
    return this.part.flow || {};
  }

  get liquid() {
    return Object.keys(this.flow).length > 0;
  }

  get liquidColor() {
    return this.part.liquidSource || this.part.liquid;
  }

  flowOnAngle(angle: string): number {
    return this.flow[angle] || 0;
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
