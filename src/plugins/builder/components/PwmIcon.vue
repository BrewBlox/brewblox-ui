<script lang="ts">
/* eslint-disable vue/attribute-hyphenation */
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class PwmIcon extends Vue {
  @Prop({ type: String, default: '25' })
  public readonly width!: string;

  @Prop({ type: String, default: '25' })
  public readonly height!: string;
}
</script>

<template>
  <svg v-bind="{'stroke-width': '3px', ...$attrs, ...$props}" viewBox="0,0,50,50">
    <path d="M5,35 h5 v-18 h10 v18 h10 v-18 h10 v18 H45" />
  </svg>
</template>
