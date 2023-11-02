<script lang="ts">
import { useDialog } from '@/composables';
import { BlockRelationNode } from '@/plugins/spark/types';
import { BlockRelation } from 'brewblox-proto/ts';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'RelationsDialog',
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
    },
    nodes: {
      type: Array as PropType<BlockRelationNode[]>,
      required: true,
    },
    edges: {
      type: Array as PropType<BlockRelation[]>,
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
  emits: [...useDialog.emits],
  setup() {
    const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup();

    return {
      dialogRef,
      dialogOpts,
      onDialogHide,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    maximized
    v-bind="dialogOpts"
    transition-show="fade"
    @hide="onDialogHide"
  >
    <Card no-scroll>
      <template #toolbar>
        <Toolbar
          :title="title"
          subtitle="Relations diagram"
        />
      </template>
      <div class="fit bg-dark">
        <RelationsDiagram
          v-bind="{
            serviceId,
            nodes,
            edges,
            hideUnrelated,
            canCreate,
          }"
        />
      </div>
    </Card>
  </q-dialog>
</template>
