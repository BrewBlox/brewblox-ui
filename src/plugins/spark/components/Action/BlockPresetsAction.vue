<script lang="ts">

import { Dialog } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store/';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class BlockPresetsAction extends BlockCrudComponent {

  @Prop({ type: String, default: 'Choose preset' })
  readonly label!: string;

  @Prop({ type: String, default: 'mdi-application-import' })
  readonly icon!: string;

  get itemProps() {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  get spec() {
    return sparkStore.specs[this.block.type];
  }

  presets() {
    return [
      { name: 'Default values', generate: this.spec.generate },
      ...this.spec.presets,
    ];
  }

  choosePreset() {
    Dialog.create({
      title: 'Apply configuration preset',
      dark: true,
      cancel: true,
      options: {
        type: 'radio',
        model: null,
        // Classes are not correctly emitted by onOk
        items: this.presets()
          .map((p, idx) => ({ label: p.name, value: idx })),
      },
    })
      .onOk(idx => {
        if (idx === null) {
          return;
        }
        const preset = this.presets()[idx];
        this.block.data = { ...this.block.data, ...preset.generate() };
        this.saveBlock();
      });
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" :disabled="!spec" @click="choosePreset">
    <q-tooltip v-if="!spec">No presets available</q-tooltip>
  </ActionItem>
</template>
