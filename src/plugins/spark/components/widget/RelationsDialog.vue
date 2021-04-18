<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useDialog } from '@/composables';
import { RelationEdge, RelationNode } from '@/plugins/spark/types';

export default defineComponent({
  name: 'RelationsDialog',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    nodes: {
      type: Array as PropType<RelationNode[]>,
      required: true,
    },
    edges: {
      type: Array as PropType<RelationEdge[]>,
      required: true,
    },
    title: {
      type: String,
      default: 'Block Relations',
    },
    hideUnrelated: {
      type: Boolean,
      default: false,
    },
    centered: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
    } = useDialog.setup();

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    maximized
    v-bind="dialogProps"
    transition-show="fade"
    @hide="onDialogHide"
  >
    <CardWrapper no-scroll>
      <template #toolbar>
        <DialogToolbar :title="title" subtitle="Relations diagram" />
      </template>
      <div class="fit bg-dark">
        <RelationsDiagram v-bind="$props" />
      </div>
    </CardWrapper>
  </q-dialog>
</template>
