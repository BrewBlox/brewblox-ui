<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class ToggleButton extends Vue {

  @Prop({ type: Boolean, required: true })
  public readonly value!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly colored!: boolean;

  get icon(): string {
    return this.value
      ? 'mdi-checkbox-marked-outline'
      : 'mdi-checkbox-blank-outline';
  }

  get color(): string {
    if (!this.colored) {
      return '';
    }
    return this.value
      ? 'primary'
      : 'smoke';
  }
}
</script>

<template>
  <q-btn :icon="icon" :color="color" v-bind="$attrs" flat @click="$emit('input', !value)">
    <slot />
  </q-btn>
</template>
