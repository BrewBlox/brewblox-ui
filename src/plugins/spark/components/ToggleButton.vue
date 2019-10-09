<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class ToggleButton extends Vue {

  @Prop({ type: Boolean, required: true })
  public readonly value!: boolean;
}
</script>

<template>
  <q-btn
    :icon="value ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"
    :color="value ? 'primary' : 'smoke'"
    v-bind="$attrs"
    flat
    @click="$emit('input', !value)"
  />
</template>
