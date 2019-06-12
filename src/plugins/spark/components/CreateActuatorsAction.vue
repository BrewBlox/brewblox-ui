<script lang="ts">

import { Dialog } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Block } from '../types';

@Component
export default class CreateActuatorsAction extends Vue {

  @Prop({ type: Object, required: true })
  readonly block!: Block;

  @Prop({ type: String, default: 'Create Actuators' })
  readonly label!: string;

  @Prop({ type: String, default: 'mdi-power-plug' })
  readonly icon!: string;

  get itemProps() {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  openDialog() {
    Dialog.create({
      component: 'CreateActuatorsDialog',
      root: this.$root,
      block: this.block,
    });
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="openDialog"/>
</template>
