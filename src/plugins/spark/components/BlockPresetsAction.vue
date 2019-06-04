<script lang="ts">

import { Dialog } from 'quasar';
import Vue from 'vue';
import Component from 'vue-class-component';

import sparkStore from '@/plugins/spark/store/';
import dashboardStore from '@/store/dashboards';

@Component({
  props: {
    block: {
      type: Object,
      required: true,
    },
    presets: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: 'Apply preset',
    },
    icon: {
      type: String,
      default: 'mdi-application-import',
    },
    active: {
      type: Boolean,
      default: false,
    },
    noClose: {
      type: Boolean,
      default: false,
    },
  },
})
export default class BlockPresetsAction extends Vue {
  choosePreset() {
    const { id, serviceId } = this.$props.block;
    const presets = [...this.$props.presets];
    Dialog.create({
      title: 'Apply configuration preset',
      dark: true,
      cancel: true,
      options: {
        type: 'radio',
        model: null,
        // Classes are not correctly emitted by onOk
        items: presets.map((p, idx) => ({ label: p.label, value: idx })),
      },
    })
      .onOk(idx => {
        const preset = presets[idx];
        const block = sparkStore.blockById(serviceId, id);
        block.data = { ...block.data, ...preset.value };
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
