import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { Coordinates, rotatedSize } from '@/helpers/coordinates';

import { SQUARE_SIZE } from '../getters';
import specs from '../specs';
import { CalculatedFlows, ComponentSpec, FlowPart } from '../types';

@Component
export default class PartComponent extends Vue {
  public SQUARE_SIZE: number = SQUARE_SIZE;

  @Prop({ type: Object, required: true })
  public readonly value!: FlowPart;

  @Emit('update:part')
  public savePart(part: FlowPart = this.part): FlowPart {
    return part;
  }

  @Emit('update:state')
  public savePartState(part: FlowPart = this.part): FlowPart {
    return part;
  }

  public get part(): FlowPart {
    return {
      transitions: {},
      flows: {},
      ...this.value,
    };
  }

  public get flipped(): boolean {
    return Boolean(this.part.flipped);
  }

  public toggleFlipped(): void {
    this.savePart({ ...this.part, flipped: !this.flipped });
  }

  public get flow(): CalculatedFlows {
    return this.part.flows;
  }

  public get settings(): Record<string, any> {
    return this.part.settings || {};
  }

  public get state(): Record<string, any> {
    return this.part.state || {};
  }

  public get spec(): ComponentSpec {
    return specs[this.part.type];
  }

  public get size(): [number, number] {
    return this.spec.size(this.part);
  }

  public get sizeX(): number {
    return this.size[0];
  }

  public get sizeY(): number {
    return this.size[1];
  }

  public squares(val: number): number {
    return SQUARE_SIZE * val;
  }

  public textTransformation(textSize: [number, number]): string {
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

  public liquidOnCoord(coord: string): string[] {
    return Object.keys(this.flow[this.rotatedCoord(coord)] || {});
  }

  public flowOnCoord(coord: string): number {
    return Object.values(this.flow[this.rotatedCoord(coord)] || {})
      .reduce((sum, v) => sum + v, 0);
  }
}
