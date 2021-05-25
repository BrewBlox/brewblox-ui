<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useDialog } from '@/composables';
import { RelationEdge, RelationNode } from '@/plugins/spark/types';

export default defineComponent({
  name: 'RelationsDialog',
  props: {
    ...useDialog.props,
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
    canCreate: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
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
    <Card no-scroll>
      <template #toolbar>
        <Toolbar :title="title" subtitle="Relations diagram" />
      </template>
      <div class="fit bg-dark">
        <RelationsDiagram v-bind="$props" />
      </div>
    </Card>
  </q-dialog>
</template>
