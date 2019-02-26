<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';

@Component
export default class Pump extends PartComponent {

  get disabled() {
    return this.part.settings.disabled || false;
  }

  protected toggleDisabled(): void {
    this.$parent.$emit('input', { ...this.part, settings: { ...this.part.settings, disabled: !this.disabled } });
  }
}
</script>

<template>
  <g class="pump clickable" @click="toggleDisabled">
    <!-- tube liquid bottom-->
    <LiquidStroke :paths="['M50,25H0']" :colors="liquidColor"/>
    <!-- ball liquid -->
    <LiquidStroke
      :paths="['M 15 30 A 9 9 0 1 1 15 31 Z']"
      :colors="liquidColor"
      class="ballLiquid"
    />
    <!-- ball outline-->
    <circle cx="25" cy="30" r="16" class="outline"/>
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
    <!-- tube liquid top-->
    <LiquidStroke :paths="['M50,25H25V36']" :colors="liquidColor"/>
    <!-- ball -->
    <g v-if="hasLiquid" :fill="liquidColor" class="liquid">
      <circle cx="25" cy="30" r="16"/>
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

<style lang="stylus" scoped>
/deep/ .ballLiquid path {
  stroke-width: 15px !important;
}
</style>
