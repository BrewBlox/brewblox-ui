<script lang="ts">
/* eslint-disable vue/attribute-hyphenation */
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class CoolingIcon extends Vue {
  @Prop({ type: String, default: '25' })
  public readonly width!: string;

  @Prop({ type: String, default: '25' })
  public readonly height!: string;
}
</script>

<template>
  <svg v-bind="{...$attrs, ...$props}" viewBox="0,0,50,50">
    <line x1="25" y1="10" x2="25" y2="40" />
    <polyline points="20.7,12 25,16.7 29.3,12" />
    <polyline points="29.3,38 25,33.3 20.7,38" />
    <line x1="12" y1="17.5" x2="38" y2="32.5" />
    <polyline points="11.6,22.2 17.8,20.8 15.9,14.8" />
    <polyline points="38.4,27.8 32.2,29.2 34.1,35.2" />
    <line x1="12" y1="32.5" x2="38" y2="17.5" />
    <polyline points="15.9,35.2 17.8,29.2 11.6,27.8" />
    <polyline points="34.1,14.8 32.2,20.8 38.4,22.2" />
  </svg>
</template>
