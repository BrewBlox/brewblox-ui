<script lang="ts">
import { useDialog } from '@/composables';
import { DigitalConstraints } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
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
    const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const local = ref<DigitalConstraints>(cloneDeep(props.modelValue));

    function save(): void {
      onDialogOK(local.value);
    }

    return {
      dialogRef,
      dialogOpts,
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
