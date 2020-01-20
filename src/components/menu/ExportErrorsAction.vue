<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { saveFile } from '@/helpers/import-export';
import { loggingStore } from '@/store/logging';
@Component
export default class ExportErrorsAction extends Vue {

  @Prop({ type: String, default: 'mdi-file-export' })
  public readonly icon!: string;

  @Prop({ type: String, default: 'Export UI logs' })
  public readonly label!: string;

  async showDialog(): Promise<void> {
    const logs = loggingStore.entries;
    saveFile(JSON.stringify(logs, null, 2), 'brewblox-logs.json', true);
  }
}
</script>

<template>
  <ActionItem v-bind="{...$attrs, icon, label}" @click="showDialog" />
</template>
