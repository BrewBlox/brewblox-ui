<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import notify from '@/helpers/notify';
import { GraphConfig } from '@/plugins/history/types';

import { saveGraphToFile, selectGraphPrecision } from '../helpers';

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

  async exportData(): Promise<void> {
    const precision = await selectGraphPrecision();
    if (precision) {
      notify.info('Generating CSV... This may take a few seconds.');
      await saveGraphToFile(this.config, precision, this.header);
    };
  }
}
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="exportData" />
</template>
