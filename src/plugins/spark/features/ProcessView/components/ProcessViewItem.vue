<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { SQUARE_SIZE } from '../getters';
import { Coordinates } from '@/helpers/coordinates';
import { FlowPart } from '../state';
import settings from '../settings';


@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class ProcessViewItem extends Vue {
  SQUARE_SIZE = SQUARE_SIZE;
  $refs!: {
    part: any;
  }

  get part(): FlowPart {
    return this.$props.value;
  }

  get settings() {
    return settings[this.part.type];
  }

  get partSize() {
    return this.settings.size(this.part);
  }

  get renderSize() {
    const [partSizeX, partSizeY] = this.partSize;
    return (this.part.rotate % 180 > 0)
      ? [partSizeY, partSizeX]
      : [partSizeX, partSizeY];
  }

  get transformation() {
    const [partSizeX, partSizeY] = this.partSize;
    const [renderSizeX, renderSizeY] = this.renderSize;

    const farEdge = new Coordinates([partSizeX, partSizeY, 0])
      .rotate(this.part.rotate, [0, 0, 0]);

    const trX = farEdge.x < 0 ? (renderSizeX * SQUARE_SIZE) : 0;
    const trY = farEdge.y < 0 ? (renderSizeY * SQUARE_SIZE) : 0;

    return `translate(${trX}, ${trY}) rotate(${this.part.rotate})`;
  }
}
</script>

<template>
  <g :transform="transformation">
    <!-- background element, to make the full part clickable -->
    <rect
      :width="renderSize[0]*SQUARE_SIZE"
      :height="renderSize[1]*SQUARE_SIZE"
      fill="black"
      opacity="0"
    />
    <component
      v-if="value.type"
      :value="value"
      :is="value.type"
      class="ProcessViewPart"
      v-on="$listeners"
    />
  </g>
</template>

<style>
/* not scoped */
.ProcessViewPart,
.ProcessViewPart svg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ProcessViewPart {
  stroke-width: 2px;
  stroke-linecap: round;
  fill: none;
}

.ProcessViewPart .fill {
  fill: #fff;
}

.ProcessViewPart .outline {
  stroke: #fff;
}

.ProcessViewPart .text {
  stroke-width: 1px;
  stroke: #fff;
}

.ProcessViewPart .liquid {
  stroke-width: 7px;
}
</style>
