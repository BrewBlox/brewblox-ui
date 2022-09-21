<script lang="ts">
import { useDialog } from '@/composables';
import { QTreeNode } from 'quasar';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'TreeSelectDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: String,
      default: null,
    },
    nodes: {
      type: Array as PropType<QTreeNode[]>,
      required: true,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogProps, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const selected = ref<string | null>(props.modelValue);
    const expanded = ref<string[]>([]);

    function save(value: string | null): void {
      if (value != null || props.clearable) {
        onDialogOK(value);
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      selected,
      expanded,
      save,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save(selected)"
  >
    <DialogCard v-bind="{ title, message, html }">
      <q-tree
        v-model:selected="selected"
        v-model:expanded="expanded"
        :nodes="nodes"
        node-key="id"
      >
        <template #default-header="{ node }">
          <q-item-section
            :class="{
              col: true,
              'text-primary': selected === node.id,
            }"
          >
            {{ node.label }}
          </q-item-section>
        </template>
      </q-tree>
      <template #actions>
        <q-btn
          color="primary"
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!clearable && !selected"
          color="primary"
          flat
          label="OK"
          @click="save(selected)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
