<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useDialog } from '@/composables';

export default defineComponent({
  name: 'ColorDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: String,
      required: true,
    },
    clearable: {
      type: Boolean,
      default: false,
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
    const local = ref<string>(props.modelValue);

    function save(): void {
      onDialogOK(local.value);
    }

    function clear(): void {
      onDialogOK('');
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      save,
      clear,
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
    <DialogCard v-bind="{title, message, html}">
      <q-color v-model="local" format-model="hex" />
      <template #actions>
        <q-btn
          color="primary"
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-btn
          v-if="clearable"
          color="primary"
          flat
          label="Clear"
          @click="clear"
        />
        <q-btn
          color="primary"
          flat
          label="OK"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
