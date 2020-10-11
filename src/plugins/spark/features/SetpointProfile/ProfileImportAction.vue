<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { loadFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { SetpointProfileBlock } from '@/plugins/spark/types';


@Component
export default class ProfileImportAction
  extends BlockCrudComponent<SetpointProfileBlock> {

  @Prop({ type: String, default: 'mdi-file-import' })
  readonly icon!: string;

  @Prop({ type: String, default: 'Import profile from file' })
  readonly label!: string;

  async showDialog(): Promise<void> {
    loadFile((cfg: Pick<SetpointProfileBlock['data'], 'points'>) => {
      if (cfg.points === undefined) {
        notify.error('Invalid configuration file');
        return;
      }
      this.block.data.points = cfg.points;
      this.saveBlock();
    });
  }
}
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="showDialog" />
</template>
