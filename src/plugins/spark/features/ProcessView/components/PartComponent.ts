import Vue from 'vue';
import Component from 'vue-class-component';
import { Transitions, FlowPart, CalculatedFlows } from '../state';
import get from 'lodash/get';

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

  public static get cards(): string[] {
    return [];
  }

  protected get part(): FlowPart {
    return {
      transitions: {},
      flows: {},
      ...this.$props.value,
    };
  }

  protected get flipped(): boolean {
    return Boolean(this.part.flipped);
  }

  protected toggleFlipped(): void {
    this.$parent.$emit('input', { ...this.part, flipped: !this.flipped });
  }

  protected get flow(): CalculatedFlows {
    return this.part.flows;
  }

  protected liquidOnCoord(coord: string): string[] {
    return Object.keys(this.flow[coord] || {});
  }

  protected flowOnCoord(coord: string): number {
    return Object.values(this.flow[coord] || {}).reduce((sum, v) => sum + v, 0);
  }

  protected settings(): Record<string, any> {
    return this.part.settings || {};
  }
}
