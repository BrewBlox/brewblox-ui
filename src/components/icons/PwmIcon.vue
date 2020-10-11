<script lang="ts">
/* eslint-disable vue/attribute-hyphenation */
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class PwmIcon extends Vue {
  @Prop({ type: String, default: '25px' })
  public readonly size!: string;

  @Prop({ type: String, default: 'white' })
  public readonly color!: string;
}
</script>

<template>
  <q-icon :size="size" class="static" v-bind="$attrs">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" stroke-width="3.5px" fill="none" :stroke="color">
      <path d="M5,35 h5 v-18 h10 v18 h10 v-18 h10 v18 H45" />
    </svg>
  </q-icon>
</template>
