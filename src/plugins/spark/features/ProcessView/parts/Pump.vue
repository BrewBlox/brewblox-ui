<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';

@Component
export default class Pump extends PartComponent {
}
</script>

<template>
  <g class="pump clickable" @click="toggleDisabled">
    <!-- ball -->
    <g v-if="liquid" :fill="liquidColor" class="liquid">
      <circle cx="25" cy="30" r="16"/>
    </g>
    <!-- ball liquid -->
    <g class="outline">
      <circle cx="25" cy="30" r="16"/>
    </g>
    <!-- blades -->
    <g class="blades-wrapper" transform="translate(25,30)">
      <g class="outline">
        <line x1="-14" y1="0" x2="14" y2="0"/>
        <line x1="7" y1="-12.1" x2="-7" y2="12.1"/>
        <line x1="7" y1="12.1" x2="-7" y2="-12.1"/>
        <!-- eslint-disable vue/attribute-hyphenation -->
        <animateTransform
          v-if="!part.settings.disabled"
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 0 0"
          to="-360 0 0"
          dur="3s"
          repeatCount="indefinite"
        />
        <!-- eslint-enable -->
      </g>
    </g>
    <!-- tube liquid -->
    <g v-if="liquid" :stroke="liquidColor" class="liquid">
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
    <rect fill="red" fill-opacity="0" x="0" y="0" width="50" height="50"/>
  </g>
</template>

