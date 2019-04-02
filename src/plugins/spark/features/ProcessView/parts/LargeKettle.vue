<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';

@Component
export default class LargeKettle extends PartComponent {
}
</script>

<template>
  <g class="large-kettle">
    <g class="text">
      <text x="10" y="30">50L</text>
    </g>
    <g class="outline">
      <rect width="300" height="400" rx="8" ry="8" stroke-width="4px"/>
    </g>
  </g>
</template>
