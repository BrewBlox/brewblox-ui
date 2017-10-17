<template>
  <svg viewBox="0 0 50 50" width="50" height="50">
    <g class='tube'>      
      <line y1="21" x2="50" y2="21"/>
      <line y1="29" x2="50" y2="29"/>
    </g>
    <g class='liquid'>
      <line y1="25" x2="50" y2="25"/>
    </g>
  </svg>
</template>

<script>
// import { FlowArrows, FlowArrows2D, FlowArrowsBridge, pickLiquid } from '../Flows';
import { Liquids } from './Liquids'; // eslint-disable-line
import VueTypes from 'vue-types';

export default {
  name: 'TubeStraight',
  components: {
  },
  props: {
    flows: VueTypes.array,
  },
  data() {
    return {};
  },
  methods: {
    possibleFlows() {
      return { r: 'l', l: 'r' };
    },
  },
};
</script>

<style>
.tube {
  stroke: #FFF;
  stroke-width: 2pt;
  stroke-linecap: round;
  fill: none;
}

.liquid {
  fill: none;
  stroke-width: 5pt;
  stroke-linecap: round;
}
</style>
