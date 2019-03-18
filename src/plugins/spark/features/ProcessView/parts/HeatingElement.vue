<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';

@Component
export default class HeatingElement extends PartComponent {
  get paths() {
    return {
      fixture: [
        'M0,10l0,30h19v-7h-6.5c0,0,0,0,0,0c-4.1,0.1-7.4-3.2-7.5-7.2c0-4.7,2.8-7.8,7.5-7.8H19v-8H0z',
      ],
      borders: [
        'M52.6,24.7h21c7.1,0,6.6-6.7,14-6.7h126.9c0,0,7,0.1,7,7c0,7-7,7-7,7H90',
      ],
    };
  }
}
</script>

<template>
  <g class="heating-element">
    <g class="text">
      <text x="10" y="30">20°</text>
    </g>
    <g class="outline">
      <rect x="0" y="10" width="50" height="30" rx="10" ry="10"/>
      <path v-for="border in paths.borders" :key="border" :d="border"/>
    </g>
  </g>
</template>
