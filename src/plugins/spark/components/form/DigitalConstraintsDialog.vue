<script lang="ts">
import { useDialog } from '@/composables';
import { deepCopy } from '@/utils/objects';
import { DigitalConstraints } from 'brewblox-proto/ts';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'ConstraintsDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<DigitalConstraints>,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const local = ref<DigitalConstraints>(deepCopy(props.modelValue));

    function save(): void {
      onDialogOK(local.value);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
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
