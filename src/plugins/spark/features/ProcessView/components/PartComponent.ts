import Vue from 'vue';
import Component from 'vue-class-component';
import { FlowPart, CalculatedFlows } from '../state';
import partSettings from '../settings';
import { Coordinates } from '@/helpers/coordinates';
import { SQUARE_SIZE } from '../getters';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class PartComponent extends Vue {
  protected SQUARE_SIZE: number = SQUARE_SIZE;

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
    this.$emit('input', { ...this.part, flipped: !this.flipped });
  }

  protected get flow(): CalculatedFlows {
    return this.part.flows;
  }

  protected get size(): [number, number] {
    return partSettings[this.part.type].size(this.part);
  }

  protected get sizeX(): number {
    return this.size[0];
  }

  protected get sizeY(): number {
    return this.size[1];
  }

  private rotatedCoord(coord: string): string {
    if (this.sizeX === 1 && this.sizeY === 1) {
      return coord;
    }
    const anchor = new Coordinates([0, 0])
      .rotateSquare(-this.part.rotate, this.part.rotate, [this.sizeX, this.sizeY]);
    return new Coordinates(coord)
      .rotate(this.part.rotate, [0.5 * this.sizeX, 0.5 * this.sizeY])
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
