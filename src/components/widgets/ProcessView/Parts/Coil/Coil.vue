<template>
  <SVGRoot>
    <g class="outline">
      <rect fill="white" y="12.5" width="8" height="8"/>
      <rect fill="white" y="30" width="8" height="8"/>
      <rect fill="white" y="62.5" width="8" height="8"/>
      <rect fill="white" y="80" width="8" height="8"/>
      <path d="M103.9,30.8L94.8,30c-22.2-1-49.5-1-49.8-1H0"/>
      <path d="M0,21h45c0.3,0,27.9,0,50.2,1l50.2,4.6"/>
      <path d="M86.4,40.6l59,5.4"/>
      <path d="M103.7,50.2l-59.1-5.4"/>
      <path d="M86.4,60l59,5.4"/>
      <path d="M101,69.5l-56.4-5.2"/>
      <path d="M41,60.7c-0.1-1,0.2-2.1,0.9-2.9c0.7-0.9,1.6-1.4,2.7-1.5l100-10.3c0.1,0,0.3,0,0.4,0c2.1,0,3.8,1.6,4,3.6 c0.2,2.2-1.4,4.2-3.6,4.4l-100,10.3c-0.1,0-0.3,0-0.4,0C42.9,64.3,41.2,62.7,41,60.7z"/>
      <path d="M41,41.3c-0.2-2.2,1.4-4.2,3.6-4.4l100-10.3c0.1,0,0.3,0,0.4,0c2.1,0,3.8,1.6,4,3.6c0.2,2.2-1.4,4.2-3.6,4.4 l-100,10.3c-0.1,0-0.3,0-0.4,0C42.9,44.9,41.2,43.3,41,41.3z"/>
      <path d="M0,71.1h45c0.3,0,27.6,0,49.7-1l49.9-4.6c0.1,0,0.3,0,0.4,0c2.1,0,3.8,1.5,4,3.6c0.2,2.1-1.4,4.1-3.6,4.3 l-50,4.6c-0.1,0-0.1,0-0.2,0c-22.4,1-49.9,1-50.2,1H0"/>
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
class StraightTube extends Part {
  static flows(): ProcessViewPartFlows {
    return {
      270: [{ out: 90, friction: 1 }],
      90: [{ out: 270, friction: 1 }],
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

export default StraightTube;
</script>

<style scoped>

</style>
