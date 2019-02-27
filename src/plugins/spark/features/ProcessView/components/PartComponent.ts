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
      liquids: [],
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
    return this.part.flows || {};
  }

  protected get hasLiquid(): boolean {
    return this.part.liquids.length > 0;
  }

  protected get liquidColor(): string | undefined {
    return get(this.part, ['settings', 'liquids'], this.part.liquids);
  }

  protected flowOnAngle(angle: string): number {
    return this.flow[angle] || 0;
  }

  protected settings(): Record<string, any> {
    return this.part.settings || {};
  }
}
