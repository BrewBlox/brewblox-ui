<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { saveFile } from '@/helpers/import-export';
import { historyStore } from '@/plugins/history/store';
import { GraphConfig, QueryParams, QueryTarget } from '@/plugins/history/types';

@Component
export default class ExportGraphAction extends Vue {

  @Prop({ type: String, default: 'mdi-file-export' })
  public readonly icon!: string;

  @Prop({ type: String, default: 'Export graph to CSV' })
  public readonly label!: string;

  @Prop({ type: String, required: true })
  public readonly header!: string;

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  async fetchTarget(params: QueryParams, target: QueryTarget): Promise<void> {
    const result = await historyStore.fetchValues([params, target]);
    const lines: string[] = [
      result.columns.join(),
      ...result.values.map(slice => slice.map(v => v === null ? '' : v.toString()).join()),
    ];
    saveFile(lines.join('\n'), `graph-${this.header}-${result.name}-${result.policy}.csv`, true);
  }

  async exportData(): Promise<void> {
    const params: QueryParams = { ...this.config.params, policy: 'downsample_1m' };
    await Promise.all(this.config.targets.map(target => this.fetchTarget(params, target)));
  }
}
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="exportData" />
</template>
