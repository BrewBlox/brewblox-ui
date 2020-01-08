<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class SvgEmbedded extends Vue {

  @Prop({ type: [String, Array, Object], default: 'full-size column items-center' })
  public readonly contentClass!: any;

}
</script>

<template>
  <foreignObject v-bind="$attrs">
    <div :class="contentClass" style="position: static">
      <slot />
    </div>
  </foreignObject>
</template>

<style lang="sass">
.embedded-wrapper .q-icon
  position: static !important
  font-size: medium
</style>
