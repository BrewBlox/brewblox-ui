<script lang="ts">
import { useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'TextAreaDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: String,
      required: true,
    },
    autogrow: {
      type: Boolean,
      default: true,
    },
    rules: {
      type: Array as PropType<InputRule[]>,
      default: () => [],
    },
    label: {
      type: String,
      default: 'Value',
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogProps, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const local = ref<string>(props.modelValue ?? '');

    function save(): void {
      onDialogOK(local.value);
    }

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: local.value,
          rules: props.rules,
        },
      }).onOk((v) => (local.value = v));
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      save,
      showKeyboard,
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
      <q-input
        v-model="local"
        type="textarea"
        :rules="rules"
        :label="label"
        :autogrow="autogrow"
        autofocus
        @keyup.enter.exact.stop
        @keyup.enter.shift.stop
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>

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
