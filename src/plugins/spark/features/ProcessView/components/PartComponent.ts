import Vue from 'vue';
import Component from 'vue-class-component';

import { Transitions, FlowPart, CalculatedFlows } from '../state';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class PartComponent extends Vue {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public static transitions(part: FlowPart): Transitions {
    return {};
  }

  public static get isSource(): boolean {
    return false;
  }

  public static get isBridge(): boolean {
    return false;
  }

  public static get cards(): string[] {
    return [];
  }

  public get part(): FlowPart {
    return this.$props.value;
  }

  public get closed(): boolean {
    return Boolean(this.part.closed);
  }

  public get flipped(): boolean {
    return Boolean(this.part.flipped);
  }

  public get disabled(): boolean {
    return Boolean(this.part.disabled);
  }

  public get flow(): CalculatedFlows {
    return this.part.calculated || {};
  }

  public get liquid(): boolean {
    return Object.keys(this.flow).length > 0;
  }

  public get liquidColor(): string | undefined {
    return this.part.liquidSource || this.part.liquid;
  }

  public flowOnAngle(angle: string): number {
    return this.flow[angle] || 0;
  }

  public toggleClosed(): void {
    this.$parent.$emit('input', { ...this.part, closed: !this.closed });
  }

  public toggleFlipped(): void {
    this.$parent.$emit('input', { ...this.part, flipped: !this.flipped });
  }

  public toggleDisabled(): void {
    this.$parent.$emit('input', { ...this.part, disabled: !this.disabled });
  }
}
