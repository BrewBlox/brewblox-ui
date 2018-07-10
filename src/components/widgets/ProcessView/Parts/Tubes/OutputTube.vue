<template>
  <SVGRoot>
    <g class="outline">
      <polyline points="40.5,17.5 48,25 40.5,32.5"/>
      <polyline points="36.4,19.3 42.1,25 36.4,30.8"/>
      <polyline points="32.3,21 36.3,25 32.3,29"/>
      <line x1="0" y1="21" x2="20" y2="21"/>
      <line x1="0" y1="29" x2="20" y2="29"/>
    </g>
    <g
      class="liquid"
      v-if="liquid"
      stroke="#ff0000"
    >
      <line x1="0" y1="25" x2="20" y2="25"/>
    </g>
    <g
      v-if="flowing"
      class="outline"
    >
      <FlowArrow
        :rotate="direction"
        :opacity="opacity(arrow.x)"
        :x="arrow.x"
        :y="arrow.y"
      />

      <FlowArrow
        :rotate="direction"
        :opacity="opacity(arrow.x - 25)"
        :x="arrow.x - 25"
        :y="arrow.y"
      />

      <FlowArrow
        :rotate="direction"
        :opacity="opacity(arrow.x - 50)"
        :x="arrow.x - 50"
        :y="arrow.y"
      />
    </g>
  </SVGRoot>
</template>

<script lang="ts">
import Component from 'vue-class-component';

import SVGRoot from '../SVGRoot.vue';
import Part from '../Part';

import FlowArrow from '../Flows/FlowArrow.vue';

/* eslint-disable */
@Component({
  components: {
    SVGRoot,
    FlowArrow,
  },
})
/* eslint-enable */
class OutputTube extends Part {
  directionDefault: number = 270;

  static isSink = true;

  static flows() {
    return {
      270: [0],
    };
  }

  opacity(xPosition: number): number {
    const opacity = 1 - ((xPosition - 15) / 5);

    if (opacity < 0) {
      return 0;
    }

    if (opacity > 1) {
      return 1;
    }

    return opacity;
  }

  get arrow() {
    return {
      x: this.frame * 50,
      y: 23,
    };
  }
}

export default OutputTube;
</script>

<style scoped>

</style>
