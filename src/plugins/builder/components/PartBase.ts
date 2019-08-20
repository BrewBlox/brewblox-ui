import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { Coordinates, rotatedSize } from '@/helpers/coordinates';

import { SQUARE_SIZE } from '../getters';
import { CalculatedFlows, FlowPart } from '../types';

@Component
export default class PartBase extends Vue {
  public SQUARE_SIZE: number = SQUARE_SIZE;

  @Prop({ type: Object, required: true })
  public readonly value!: FlowPart;

  @Emit('update:part')
  public savePart(part: FlowPart = this.part): FlowPart {
    return part;
  }

  @Emit('dirty')
  public invalidateFlows() { }

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

  public get size(): [number, number] {
    return this.part.size;
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

  public textTransformation(textSize: [number, number], counterRotate: boolean = true): string {
    const [sizeX] = rotatedSize(this.part.rotate, textSize);
    const transforms: string[] = [];
    if (this.flipped) {
      transforms.push(`translate(${this.squares(sizeX)}, 0) scale(-1,1)`);
    }
    if (this.part.rotate && counterRotate) {
      transforms.push(`rotate(${-this.part.rotate},${this.squares(0.5)},${this.squares(0.5)})`);
    }
    return transforms.join(' ');
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
