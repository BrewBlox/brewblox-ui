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
    return this.$props.value;
  }

  protected get closed(): boolean {
    return get(this.part, ['settings', 'closed'], false);
  }

  protected get flipped(): boolean {
    return Boolean(this.part.flipped);
  }

  protected get disabled(): boolean {
    return get(this.part, ['settings', 'disabled'], false);
  }

  protected get flow(): CalculatedFlows {
    return this.part.flows || {};
  }

  protected get liquid(): boolean {
    return Object.keys(this.flow).length > 0;
  }

  protected get liquidColor(): string | undefined {
    return get(this.part, ['settings', 'liquidSource'], this.part.liquid);
  }

  protected flowOnAngle(angle: string): number {
    return this.flow[angle] || 0;
  }

  protected toggleClosed(): void {
    this.$parent.$emit('input', { ...this.part, settings: { ...this.part.settings, closed: !this.closed } });
  }

  protected toggleFlipped(): void {
    this.$parent.$emit('input', { ...this.part, flipped: !this.flipped });
  }

  protected toggleDisabled(): void {
    this.$parent.$emit('input', { ...this.part, settings: { ...this.part.settings, disabled: !this.disabled } });
  }
}
