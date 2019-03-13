import Vue from 'vue';
import Component from 'vue-class-component';
import { FlowPart, CalculatedFlows } from '../state';
import partSettings from '../settings';
import { Coordinates } from '@/helpers/coordinates';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class PartComponent extends Vue {
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

  private rotatedCoord(coord: string): string {
    const [sizeX, sizeY] = partSettings[this.part.type].size(this.part);
    if (sizeX === 1 && sizeY === 1) {
      return coord;
    }
    const anchor = new Coordinates([0, 0])
      .rotateSquare(-this.part.rotate, this.part.rotate, [sizeX, sizeY]);
    return new Coordinates(coord)
      .rotate(this.part.rotate, [0.5 * sizeX, 0.5 * sizeY])
      .translate(anchor)
      .toString();
  }

  protected liquidOnCoord(coord: string): string[] {
    return Object.keys(this.flow[this.rotatedCoord(coord)] || {});
  }

  protected flowOnCoord(coord: string): number {
    return Object.values(this.flow[this.rotatedCoord(coord)] || {})
      .reduce((sum, v) => sum + v, 0);
  }

  protected settings(): Record<string, any> {
    return this.part.settings || {};
  }
}
