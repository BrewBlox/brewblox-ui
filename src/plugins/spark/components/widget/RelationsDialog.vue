<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { BlockRelationNode } from '@/plugins/spark/types';
import { BlockRelation } from 'brewblox-proto/ts';

interface Props extends UseDialogProps {
  serviceId: string;
  nodes: BlockRelationNode[];
  edges: BlockRelation[];
  title?: string;
  hideUnrelated?: boolean;
  canCreate?: boolean;
}

withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  title: 'Block relations',
  hideUnrelated: false,
  canCreate: false,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup<never>();
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
