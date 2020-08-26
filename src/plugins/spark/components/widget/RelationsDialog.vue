<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
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
}
</script>

<template>
  <q-dialog
    ref="dialog"
    maximized
    no-backdrop-dismiss
    transition-show="fade"
    @hide="onDialogHide"
  >
    <CardWrapper no-scroll v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="title" subtitle="Relations diagram" />
      </template>
      <div class="fit bg-dark">
        <RelationsDiagram v-bind="$props" />
      </div>
    </CardWrapper>
  </q-dialog>
</template>
