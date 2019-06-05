<script lang="ts">

import { Dialog } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store/';

import { Block } from '../types';

@Component
export default class BlockPresetsAction extends Vue {

  @Prop({ type: Object, required: true })
  readonly block!: Block;

  @Prop({ type: String, default: 'Apply preset' })
  readonly label!: string;

  @Prop({ type: String, default: 'mdi-application-import' })
  readonly icon!: string;

  @Prop({ type: Boolean, default: false })
  readonly active!: boolean;

  @Prop({ type: Boolean, default: false })
  readonly noClose!: boolean;

  get presets() {
    return sparkStore.specs[this.block.type].presets;
  }

  choosePreset() {
    const { id, serviceId, type } = this.block;

    Dialog.create({
      title: 'Apply configuration preset',
      dark: true,
      cancel: true,
      options: {
        type: 'radio',
        model: null,
        // Classes are not correctly emitted by onOk
        items: this.presets.map((p, idx) => ({ label: p.name, value: idx })),
      },
    })
      .onOk(idx => {
        if (idx === null) {
          return;
        }
        const preset = this.presets[idx];
        const block = sparkStore.blockById(serviceId, id);
        block.data = { ...block.data, ...preset.generate() };
        sparkStore.saveBlock([serviceId, block]);
      });
  }
}
</script>

<template>
  <ActionItem :disabled="!presets.length" v-bind="$props" @click="choosePreset">
    <q-tooltip v-if="!presets.length">No presets available</q-tooltip>
  </ActionItem>
</template>
