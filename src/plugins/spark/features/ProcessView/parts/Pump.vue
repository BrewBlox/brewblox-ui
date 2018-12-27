<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows, FlowPart } from '../state';
import { LEFT, RIGHT } from '../getters';

@Component
export default class Pump extends PartComponent {
  static flows(part: FlowPart): AngledFlows {
    const p = part.disabled ? 0 : 10;
    return {
      [LEFT]: [{ angleOut: RIGHT, friction: 1, deltaPressure: -p }],
      [RIGHT]: [{ angleOut: LEFT, friction: 1, deltaPressure: p }],
    };
  }

  get rotation() {
    return !this.disabled
      ? `rotate(${this.frame * -180}, 0, 0)`
      : '';
  }
}
</script>

<template>
  <div class="clickable" @click="toggleDisabled">
    <SVGRoot>
      <!-- ball -->
      <g v-if="liquid" class="liquid" fill="#4aa0ef">
        <circle cx="25" cy="30" r="16"/>
      </g>
      <!-- ball liquid -->
      <g class="outline">
        <circle cx="25" cy="30" r="16"/>
      </g>
      <!-- blades -->
      <g class="blades-wrapper">
        <g class="outline center-rotate" :transform="rotation">
          <line x1="25" y1="39" x2="25" y2="11"/>
          <line x1="37.1" y1="32" x2="12.9" y2="18"/>
          <line x1="37.1" y1="18" x2="12.9" y2="32"/>
        </g>
      </g>
      <!-- tube liquid -->
      <g v-if="liquid" class="liquid" stroke="#4aa0ef">
        <polyline points="25,33 25,25 50,25 "/>
        <line class="st0" x1="0" y1="25" x2="10" y2="25"/>
      </g>
      <!-- tubes -->
      <g class="outline">
        <polyline points="20.5,10 16.5,6 20.5,2 "/>
        <line class="st0" x1="32.5" y1="6" x2="16.5" y2="6"/>
        <line class="st0" x1="0" y1="21" x2="11" y2="21"/>
        <line class="st0" x1="0" y1="29" x2="9" y2="29"/>
        <path d="M50,29H29v3.5c0,2.2-1.8,4-4,4s-4-1.8-4-4V25c0-2.2,1.8-4,4-4h25"/>
      </g>
    </SVGRoot>
  </div>
</template>


<style scoped>
.blades-wrapper {
  transform: translateY(5px);
}
.center-rotate {
  transform-origin: 25px 25px;
}
</style>
