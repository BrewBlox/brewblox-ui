<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows } from '../state';
import { UP, LEFT, RIGHT, DOWN, SQUARE_SIZE } from './';

@Component
export default class TeeTube extends PartComponent {
  static flows(): AngledFlows {
    return {
      [UP]: [{ angleOut: RIGHT, friction: 1 }, { angleOut: LEFT, friction: 1 }],
      [RIGHT]: [{ angleOut: UP, friction: 1 }, { angleOut: LEFT, friction: 1 }],
      [LEFT]: [{ angleOut: UP, friction: 1 }, { angleOut: RIGHT, friction: 1 }],
    };
  }

  hasFlowOnAngle(angle: number) {
    return this.flowOnAngle(angle) !== 0;
  }

  leftArrow(frame: number) {
    const toRight = this.flowOnAngle(LEFT) < 0;
    const animationFrame = toRight ? frame : 1 - frame;

    return {
      rotate: toRight ? LEFT : RIGHT,
      x: ((animationFrame % 0.5) * SQUARE_SIZE) - 8,
      y: 23,
    };
  }

  topArrow(frame: number) {
    const toBottom = this.flowOnAngle(UP) < 0;
    const animationFrame = toBottom ? frame : 1 - frame;

    return {
      rotate: toBottom ? UP : DOWN,
      x: 21,
      y: ((animationFrame % 0.5) * SQUARE_SIZE) - (toBottom ? 0 : 6),
    };
  }

  rightArrow(frame: number) {
    const toLeft = this.flowOnAngle(RIGHT) < 0;
    const animationFrame = toLeft ? frame + 0.25 : 1 - frame;

    return {
      rotate: toLeft ? RIGHT : LEFT,
      x: (toLeft ? 54 : 50) - ((animationFrame % 0.5) * SQUARE_SIZE),
      y: 23,
    };
  }
}
</script>

<template>
  <SVGRoot>
    <g class="outline">
      <path d="M50,21H30a1,1,0,0,1-1-1V0"/>
      <path d="M21,0V20a1,1,0,0,1-1,1H0"/>
      <line class="line" y1="29" x2="50" y2="29"/>
    </g>
    <g class="liquid" v-if="liquid" stroke="#4aa0ef">
      <line y1="25" x2="50" y2="25"/>
      <path d="M0,25H20a5,5,0,0,0,5-5V0"/>
      <path d="M25,0V20a5,5,0,0,0,5,5H50"/>
    </g>
    <g v-if="flowing" class="outline">
      <FlowArrow
        v-if="hasFlowOnAngle(270)"
        :rotate="leftArrow(frame).rotate"
        :x="leftArrow(frame).x"
        :y="leftArrow(frame).y"
      />
      <FlowArrow
        v-if="hasFlowOnAngle(0)"
        :rotate="topArrow(frame).rotate"
        :x="topArrow(frame).x"
        :y="topArrow(frame).y"
      />
      <FlowArrow
        v-if="hasFlowOnAngle(90)"
        :rotate="rightArrow(frame).rotate"
        :x="rightArrow(frame).x"
        :y="rightArrow(frame).y"
      />
    </g>
  </SVGRoot>
</template>


<style scoped>
</style>
