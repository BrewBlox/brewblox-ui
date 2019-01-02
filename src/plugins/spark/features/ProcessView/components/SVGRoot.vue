<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { SQUARE_SIZE } from '../getters';

@Component
export default class SVGRoot extends Vue {
  get width() {
    return SQUARE_SIZE;
  }

  get height() {
    return SQUARE_SIZE;
  }
}
</script>

<template>
  <svg :width="width" :height="height">
    <slot/>
  </svg>
</template>
