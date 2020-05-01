<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { saveFile } from '@/helpers/import-export';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { SetpointProfileBlock } from './types';


@Component
export default class ProfileExportAction
  extends BlockCrudComponent<SetpointProfileBlock> {

  @Prop({ type: String, default: 'mdi-file-export' })
  readonly icon!: string;

  @Prop({ type: String, default: 'Export profile to file' })
  readonly label!: string;

  startExport(): void {
    const { points } = this.block.data;
    saveFile({ points }, `${this.block.serviceId}-${this.block.id}.profile.json`);
  }
}
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="startExport" />
</template>
