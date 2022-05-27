<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useDialog } from '@/composables';

export default defineComponent({
  name: 'ConfirmDialog',
  props: {
    ...useDialog.props,
    ok: {
      type: String,
      default: 'OK',
    },
    nok: {
      type: [String, Boolean],
      default: false,
    },
    cancel: {
      type: [String, Boolean],
      default: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();

    const cancelLabel = computed<string>(() =>
      typeof props.cancel === 'string' ? props.cancel : 'Cancel',
    );

    const nokLabel = computed<string>(() =>
      typeof props.nok === 'string' ? props.nok : 'No',
    );

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
      cancelLabel,
      nokLabel,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="onDialogOK(true)"
  >
    <DialogCard v-bind="{ title, message, html }">
      <template #actions>
        <q-btn
          v-if="cancel"
          flat
          :label="cancelLabel"
          :color="nok ? '' : 'primary'"
          @click="onDialogCancel"
        />
        <q-space v-if="nok" />
        <q-btn
          v-if="nok"
          flat
          :label="nokLabel"
          color="primary"
          @click="onDialogOK(false)"
        />
        <q-btn
          flat
          :label="ok"
          color="primary"
          @click="onDialogOK(true)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
