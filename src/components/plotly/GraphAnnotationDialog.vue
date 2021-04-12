<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'GraphAnnotationDialog',
  props: {
    ...useDialog.props,
    value: {
      type: String,
      default: '',
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
    } = useDialog.setup();
    const local = ref<string>(props.value);

    function save(): void {
      onDialogOK({ text: local.value, remove: false });
    }

    function remove(): void {
      onDialogOK({ text: local.value, remove: true });
    }

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          value: local.value,
        },
      })
        .onOk((v: string) => local.value = v);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      save,
      remove,
      showKeyboard,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.ctrl.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-input
        v-model="local"
        label="Title"
        autofocus
        item-aligned
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn flat label="Remove" color="primary" @click="remove" />
        <q-space />
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
