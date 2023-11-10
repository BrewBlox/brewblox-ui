<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';

interface Props extends UseDialogProps {
  title?: string;
  message?: string;
}

withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  title: 'Unsaved changes',
  message: 'Do you want to save your changes before closing?',
});

defineEmits<UseDialogEmits>();

const { dialogOpts, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<boolean>();
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    no-esc-dismiss
    @hide="onDialogHide"
  >
    <DialogCard v-bind="{ title, message, html }">
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-space />
        <q-btn
          flat
          label="No"
          color="primary"
          @click="onDialogOK(false)"
        />
        <q-btn
          flat
          label="Yes"
          color="primary"
          @click="onDialogOK(true)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
