<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { saveFile } from '@/helpers/import-export';

@Component
export default class ExportAction extends CrudComponent {

  @Prop({ type: String, default: 'mdi-file-export' })
  readonly icon!: string;

  @Prop({ type: String, default: 'Export widget' })
  readonly label!: string;

  get itemProps(): Mapped<any> {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  async showDialog(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, dashboard, pinnedPosition, ...exported } = this.widget;
    saveFile(exported, `brewblox-${this.widget.title}-${this.widget.feature}.json`);
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="showDialog" />
</template>
