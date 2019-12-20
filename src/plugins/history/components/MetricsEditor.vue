<script lang="ts">
import get from 'lodash/get';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { durationString } from '@/helpers/functional';
import { QuasarNode } from '@/plugins/history/nodes';

import { DEFAULT_DECIMALS, DEFAULT_FRESH_DURATION } from '../Metrics/getters';
import { MetricsConfig } from '../Metrics/types';


@Component
export default class MetricsEditor extends Vue {

  @Prop({ type: Object, required: true })
  public readonly config!: MetricsConfig;

  saveConfig(config: MetricsConfig = this.config): void {
    this.$emit('update:config', config);
  }

  editLeaf(node: QuasarNode): void {
    createDialog({
      component: 'MetricsDisplayDialog',
      title: node.value,
      parent: this,
      config: this.config,
      field: node.value,
    })
      .onOk(config => this.saveConfig(config));
  }

  renamed(node: QuasarNode): string {
    return this.config.renames[node.value] || node.label;
  }

  freshDuration(node: QuasarNode): string {
    return durationString(this.config.freshDuration[node.value] ?? DEFAULT_FRESH_DURATION);
  }

  decimals(node: QuasarNode): number {
    return get(this.config.decimals, node.value, DEFAULT_DECIMALS);
  }
}
</script>

<template>
  <QueryEditor :config="config" @update:config="saveConfig">
    <template #leaf="{node}">
      <div @click="editLeaf(node)">
        {{ node.label }}
        <q-tooltip>
          <i>Click to edit</i>
          <LabeledField :value="renamed(node)" label="Label" dense class="q-mt-sm" />
          <LabeledField :value="freshDuration(node)" label="Warn when older than" dense class="q-mt-sm" />
          <LabeledField :value="decimals(node)" label="Rounded decimals" dense class="q-mt-sm" />
        </q-tooltip>
      </div>
    </template>
  </QueryEditor>
</template>
