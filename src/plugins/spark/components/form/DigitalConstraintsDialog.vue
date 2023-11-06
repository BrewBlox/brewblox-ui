<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { DigitalConstraints } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: DigitalConstraints;
  serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<DigitalConstraints>();

const local = ref<DigitalConstraints>(cloneDeep(props.modelValue));

function save(): void {
  onDialogOK(local.value);
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      {{ local }}
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
