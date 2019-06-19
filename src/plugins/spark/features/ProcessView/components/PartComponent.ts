import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Coordinates, rotatedSize } from '@/helpers/coordinates';

import { SQUARE_SIZE } from '../getters';
import specs from '../specs';
import { CalculatedFlows, FlowPart } from '../types';

@Component
export default class PartComponent extends Vue {
  protected SQUARE_SIZE: number = SQUARE_SIZE;

  @Prop({ type: Object, required: true })
  protected readonly value!: FlowPart;

  protected get part(): FlowPart {
    return {
      transitions: {},
      flows: {},
      ...this.value,
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

  protected get settings(): Record<string, any> {
    return this.part.settings || {};
  }

  protected get state(): Record<string, any> {
    return this.part.state || {};
  }

  protected get size(): [number, number] {
    return specs[this.part.type].size(this.part);
  }

  protected get sizeX(): number {
    return this.size[0];
  }

  protected get sizeY(): number {
    return this.size[1];
  }

  protected textTransformation(textSize: [number, number]): string {
    const [sizeX] = rotatedSize(this.part.rotate, textSize);
    const rotate = `rotate(${-this.part.rotate},${SQUARE_SIZE / 2},${SQUARE_SIZE / 2})`;
    const flip = `translate(${sizeX * SQUARE_SIZE}, 0) scale(-1,1)`;
    return this.flipped
      ? `${flip} ${rotate}`
      : rotate;
  }

  private rotatedCoord(coord: string): string {
    return new Coordinates(coord)
      .rotateShapeEdge(this.part.rotate, 0, this.size)
      .toString();
  }

  protected liquidOnCoord(coord: string): string[] {
    return Object.keys(this.flow[this.rotatedCoord(coord)] || {});
  }

  protected flowOnCoord(coord: string): number {
    return Object.values(this.flow[this.rotatedCoord(coord)] || {})
      .reduce((sum, v) => sum + v, 0);
  }

  protected savePart(part: FlowPart = this.part): void {
    this.$emit('input', part);
  }

  protected savePartState(part: FlowPart = this.part): void {
    this.$emit('state', part);
  }
}
