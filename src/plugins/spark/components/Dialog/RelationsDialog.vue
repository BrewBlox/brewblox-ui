<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { RelationEdge, RelationNode } from '@/plugins/spark/types';


@Component
export default class RelationsDialog extends DialogBase {
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

  get contentStyle(): Mapped<string> {
    return {
      height: `${window.innerHeight - 50}px`,
      width: `${window.innerWidth}px`,
    };
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized no-backdrop-dismiss @hide="onDialogHide">
    <q-card dark class="maximized bg-dark-bright">
      <DialogToolbar @close="onDialogHide">
        {{ title }}
      </DialogToolbar>
      <RelationsDiagram
        :content-style="contentStyle"
        v-bind="$props"
      />
    </q-card>
  </q-dialog>
</template>
