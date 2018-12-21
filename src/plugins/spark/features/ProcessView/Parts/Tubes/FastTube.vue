<script lang="ts">
import Component from 'vue-class-component';
import FlowArrow from '../Flows/FlowArrow.vue';
import PartComponent from '../PartComponent';
import SVGRoot from '../SVGRoot.vue';
import { AngledFlows } from '../../state';

@Component({
  components: {
    SVGRoot,
    FlowArrow,
  },
})
export default class FastTube extends PartComponent {
  static flows(): AngledFlows {
    return {
      270: [{ angleOut: 90, friction: 1, deltaPressure: -99 }],
      90: [{ angleOut: 270, friction: 1, deltaPressure: 99 }],
    };
  }

  get direction() {
    return this.flowOnAngle(90) > 0 ? 270 : 90;
  }

  get arrow() {
    const x = this.frame * 50;

    return {
      x: this.direction === 90 ? (75 - x) - 8 : x,
      y: 23,
    };
  }
}
</script>

<template>
  <SVGRoot>
    <g class="outline">
      <line y1="21" x2="50" y2="21"/>
      <line y1="29" x2="50" y2="29"/>
    </g>
    <g class="liquid" v-if="liquid" stroke="#ff0066">
      <line y1="25" x2="50" y2="25"/>
    </g>
    <g v-if="flowing" class="outline">
      <FlowArrow :rotate="direction" :x="arrow.x" :y="arrow.y"/>
      <FlowArrow :rotate="direction" :x="arrow.x - 50" :y="arrow.y"/>
      <FlowArrow :rotate="direction" :x="arrow.x + 25" :y="arrow.y"/>
      <FlowArrow :rotate="direction" :x="arrow.x - 25" :y="arrow.y"/>
    </g>
  </SVGRoot>
</template>


<style scoped>
</style>
