<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Coordinates, rotatedSize } from '@/helpers/coordinates';

import { SQUARE_SIZE } from '../getters';
import specs from '../specs';
import { FlowPart } from '../types';


@Component
export default class PartWrapper extends Vue {
  SQUARE_SIZE = SQUARE_SIZE;

  @Prop({ type: Object, required: true })
  readonly part!: FlowPart;

  @Prop({ type: Boolean, default: false })
  readonly showHover!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly selected!: boolean;

  get partSpecs() {
    return specs[this.part.type];
  }

  get partSize() {
    return this.partSpecs.size(this.part);
  }

  get rotateTransform() {
    const [partSizeX, partSizeY] = this.partSize;
    const [renderSizeX, renderSizeY] = rotatedSize(this.part.rotate, this.partSize);

    const farEdge = new Coordinates([partSizeX, partSizeY, 0])
      .rotate(this.part.rotate, [0, 0, 0]);

    const trX = farEdge.x < 0 ? (renderSizeX * SQUARE_SIZE) : 0;
    const trY = farEdge.y < 0 ? (renderSizeY * SQUARE_SIZE) : 0;

    return `translate(${trX}, ${trY}) rotate(${this.part.rotate})`;
  }

  get flipTransform() {
    if (!this.part.flipped) {
      return '';
    }
    const sizeX = this.partSize[0];
    return `translate(${sizeX * SQUARE_SIZE}, 0) scale(-1, 1)`;
  }

  get transformation() {
    return `${this.rotateTransform} ${this.flipTransform}`;
  }

  squares(val: number): number {
    return SQUARE_SIZE * val;
  }
}
</script>

<template>
  <g :transform="transformation">
    <component
      v-if="part.type"
      :value="part"
      :is="part.type"
      class="BuilderPart"
      v-on="$listeners"
    />
    <!-- background element, to make the full part clickable -->
    <rect
      :width="squares(partSize[0])"
      :height="squares(partSize[1])"
      :class="{showhover: showHover, selected}"
      opacity="0"
    />
  </g>
</template>

<style>
/* not scoped */
.BuilderPart,
.BuilderPart svg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.BuilderPart {
  stroke-width: 2px;
  stroke-linecap: round;
  fill: none;
}

.BuilderPart .fill {
  fill: #fff;
}

.BuilderPart .outline {
  stroke: #fff;
}

.BuilderPart .text {
  stroke-width: 1px;
  stroke: #fff;
}

.BuilderPart .liquid {
  stroke-width: 7px;
}

.showhover:hover {
  fill: silver;
  fill-opacity: 0.5;
  opacity: 0.5;
}

.selected {
  fill: silver;
  fill-opacity: 0.5;
  opacity: 0.5;
}
</style>
