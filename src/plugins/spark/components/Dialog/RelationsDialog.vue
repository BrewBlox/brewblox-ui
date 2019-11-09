<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { RelationEdge, RelationNode } from '@/plugins/spark/types';


@Component
export default class RelationsDialog extends DialogBase {
  // Start with a ballpark approximation
  contentStyle = {
    width: `${window.innerWidth}px`,
    height: `${window.innerHeight - 50}px`,
  }

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: Array, required: true })
  readonly nodes!: RelationNode[];

  @Prop({ type: Array, required: true })
  readonly edges!: RelationEdge[];

  @Prop({ type: String, default: 'Block Relations' })
  public readonly title!: string;

  @Prop({ type: Boolean, default: false })
  public readonly hideUnrelated!: boolean;

  onResize({ width, height }): void {
    this.contentStyle = {
      width: `${width}px`,
      height: `${height}px`,
    };
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized no-backdrop-dismiss @hide="onDialogHide">
    <q-card dark class="maximized bg-dark-bright column">
      <DialogToolbar>
        {{ title }}
      </DialogToolbar>
      <div class="col" style="width: 100%">
        <q-resize-observer @resize="onResize" />
        <RelationsDiagram
          :content-style="contentStyle"
          v-bind="$props"
        />
      </div>
    </q-card>
  </q-dialog>
</template>
