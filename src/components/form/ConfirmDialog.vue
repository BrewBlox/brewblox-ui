<script setup lang="ts">
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { computed } from 'vue';

interface Props extends UseDialogProps {
  ok?: string;
  nok?: string | boolean;
  cancel?: string | boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  ok: 'OK',
  nok: false,
  cancel: true,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<boolean>();

const cancelLabel = computed<string>(() =>
  typeof props.cancel === 'string' ? props.cancel : 'Cancel',
);

const nokLabel = computed<string>(() =>
  typeof props.nok === 'string' ? props.nok : 'No',
);
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
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
