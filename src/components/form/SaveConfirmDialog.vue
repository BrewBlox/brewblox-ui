<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useDialog } from '@/composables';

export default defineComponent({
  name: 'SaveConfirmDialog',
  props: {
    ...useDialog.props,
    title: {
      type: String,
      default: 'Unsaved changes',
    },
    message: {
      type: String,
      default: 'Do you want to save your changes before closing?',
    },
    saveFunc: {
      type: Function as PropType<() => Awaitable<unknown>>,
      required: true,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogProps,
      dialogRef,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    } = useDialog.setup();

    async function done(save: boolean): Promise<void> {
      if (save) {
        await props.saveFunc();
      }
      onDialogOK();
    }

    return {
      dialogProps,
      dialogRef,
      onDialogHide,
      onDialogCancel,
      done,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    no-esc-dismiss
    @hide="onDialogHide"
  >
    <DialogCard v-bind="{title, message, html}">
      <template #actions>
        <q-btn flat label="Cancel" @click="onDialogCancel" />
        <q-space />
        <q-btn flat label="No" color="primary" @click="done(false)" />
        <q-btn flat label="Yes" color="primary" @click="done(true)" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
