<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows } from '../state';
import { LEFT, RIGHT, DOWN, UP, SQUARE_SIZE } from '../getters';

@Component
export default class BridgeTube extends PartComponent {
  static get isBridge() {
    return true;
  }

  static flows(): AngledFlows {
    return {
      // bridge (high)
      [LEFT]: [{ angleOut: RIGHT }],
      [RIGHT]: [{ angleOut: LEFT }],
      // straight (low)
      [UP]: [{ angleOut: DOWN }],
      [DOWN]: [{ angleOut: UP }],
    };
  }

  get lowDirection() {
    return this.flowOnAngle(UP) > 0 ? DOWN : UP;
  }

  get highDirection() {
    return this.flowOnAngle(LEFT) > 0 ? RIGHT : LEFT;
  }

  get lowArrow() {
    const y = this.frame * SQUARE_SIZE;
    return {
      x: 21,
      y: this.lowDirection === DOWN ? (75 - y) - 6 : y,
    };
  }

  highArrows(frame: number) {
    // const points = {
    //   start: { x: 50, y: 21 },
    //   end: { x: 0, y: 21 },
    //   ctrl: { x: 25, y: 1 },
    // };

    // if (this.highDirection === LEFT) {
    //   const { start, end } = points;
    //   points.start = end;
    //   points.end = start;
    // }

    // const curve = (t: number) => {
    //   const { start, end, ctrl } = points;
    //   return {
    //     x: (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x,
    //     y: (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y,
    //   };
    // };

    // return [0.3, 0.6, 1]
    //   .map(v => (frame + v) % 1)
    //   .map(curve);

    const cmp: any = this.$refs.liquidpath;
    if (!cmp) {
      return [];
    }

    const frameMult = this.highDirection === RIGHT ? this.frame : (1 - this.frame);
    const totalDistance = cmp.getTotalLength();
    const frameDistance = frameMult * totalDistance;
    return [-0.5, 0, 0.5]
      .map(offsetMult => offsetMult * totalDistance)
      .map(offset => frameDistance + offset)
      .filter(distance => distance <= totalDistance)
      .map(distance => cmp.getPointAtLength(distance));
  }

  get highArrow() {
    const x = this.frame * SQUARE_SIZE;
    const rotateStart = 0.11;

    return {
      x: this.highDirection === RIGHT ? (75 - x) - 8 : x,
      y: 23,
    };
  }

  get lowLiquid(): boolean {
    return (this.flow[UP] || this.flow[DOWN]) !== undefined;
  }

  get highLiquid(): boolean {
    return (this.flow[LEFT] || this.flow[RIGHT]) !== undefined;
  }

  get lowFlowing(): boolean {
    return (this.flow[UP] || this.flow[DOWN] || 0) !== 0;
  }

  get highFlowing(): boolean {
    return (this.flow[LEFT] || this.flow[RIGHT] || 0) !== 0;
  }
}
</script>

<template>
  <SVGRoot>
    <!-- low -->
    <g class="outline">
      <line x1="21" y2="50" x2="21"/>
      <line x1="29" y2="50" x2="29"/>
    </g>
    <g class="liquid" v-if="lowLiquid" stroke="#4aa0ef">
      <line x1="25" y2="50" x2="25"/>
    </g>
    <g v-if="lowFlowing" class="outline">
      <FlowArrow :rotate="lowDirection" :x="lowArrow.x" :y="lowArrow.y"/>
      <FlowArrow :rotate="lowDirection" :x="lowArrow.x" :y="lowArrow.y - 50"/>
      <FlowArrow :rotate="lowDirection" :x="lowArrow.x" :y="lowArrow.y + 25"/>
      <FlowArrow :rotate="lowDirection" :x="lowArrow.x" :y="lowArrow.y - 25"/>
    </g>
    <!-- high -->
    <g class="liquid" v-show="highLiquid" stroke="#4aa0ef">
      <path d="M 50, 25 q -25 -20, -50 0" ref="liquidpath"/>
    </g>
    <g class="outline">
      <path d="M 50, 21 q -25 -20, -50 0"/>
      <path d="M 50, 29 q -25 -20, -50 0"/>
    </g>
    <g v-if="highFlowing" class="outline">
      <FlowArrow
        v-for="(arrow, idx) in highArrows(frame)"
        :key="idx"
        :rotate="highDirection"
        :x="arrow.x"
        :y="arrow.y"
      />
    </g>
  </SVGRoot>
</template>


<style scoped>
</style>
