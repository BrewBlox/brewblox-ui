import defaults from 'lodash/defaults';
import { computed, defineComponent } from 'vue';

import { SQUARE_SIZE } from '@/plugins/builder/getters';
import { CalculatedFlows, FlowPart } from '@/plugins/builder/types';
import { squares, textTransformation } from '@/plugins/builder/utils';
import { Coordinates } from '@/utils/coordinates';

@Component
export default class PartBase extends Vue {
  public SQUARE_SIZE: number = SQUARE_SIZE;
  public squares = squares;

  @Prop({ type: Object, required: true })
  public readonly value!: FlowPart;

  @Emit('update:part')
  public savePart(part: FlowPart = this.part): FlowPart {
    return part;
  }

  @Emit('dirty')
  public invalidateFlows(): void { }

  public get part(): FlowPart {
    return defaults(this.value, {
      transitions: {},
      flows: {},
    });
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

  public get settings(): Mapped<any> {
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

  public get bordered(): boolean {
    return this.settings.bordered ?? true;
  }

  public textTransformation(textSize: [number, number], counterRotate = true): string {
    return textTransformation(this.part, textSize, counterRotate);
  }

  private rotatedCoord(coord: string): string {
    return new Coordinates(coord)
      .flipShapeEdge(!!this.flipped, 0, this.size)
      .rotateShapeEdge(this.part.rotate, 0, this.size)
      .toString();
  }

  public liquidOnCoord(coord: string): string[] {
    return Object.keys(this.flow[this.rotatedCoord(coord)] ?? {});
  }

  public flowOnCoord(coord: string): number {
    return Object.values(this.flow[this.rotatedCoord(coord)] ?? {})
      .reduce((sum, v) => sum + v, 0);
  }
}
