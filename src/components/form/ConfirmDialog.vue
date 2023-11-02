<script setup lang="ts">
import { useDialog } from '@/composables';
import { computed } from 'vue';

const props = defineProps({
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
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup();

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
