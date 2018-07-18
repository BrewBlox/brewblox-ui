<template>
  <SVGRoot>
    <g class="outline">
      <polyline points="1.25 17.5 8.75 25 1.25 32.5"/>
      <polyline points="9.13 19.25 14.88 25 9.13 30.75"/>
      <polyline points="17 21 21 25 17 29"/>
      <line x1="30" y1="21" x2="50" y2="21"/>
      <line x1="30" y1="29" x2="50" y2="29"/>
    </g>
    <g
      class="liquid"
      v-if="liquid"
      stroke="#4aa0ef"
    >
      <line x1="30" y1="25" x2="50" y2="25"/>
    </g>
    <g
      v-if="flowing"
      class="outline"
    >
      <FlowArrow
        :rotate="270"
        :opacity="opacity(arrow.x)"
        :x="arrow.x"
        :y="arrow.y"
      />
      <FlowArrow
        :rotate="270"
        :opacity="opacity(arrow.x + 25)"
        :x="arrow.x + 25"
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
class InputTube extends Part {
  static isSource = true;

  static flows() {
    return {
      270: [90],
    };
  }

  opacity(xPosition: number): number {
    const opacity = (xPosition - 23) / 5;

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

export default InputTube;
</script>

<style scoped>

</style>
