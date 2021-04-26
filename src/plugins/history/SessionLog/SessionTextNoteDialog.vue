<script lang="ts">
import { QInput } from 'quasar';
import { defineComponent, nextTick, ref } from 'vue';

import { useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'SessionTextNoteDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: String,
      required: true,
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
      onDialogOK,
      onDialogCancel,
    } = useDialog.setup();

    const local = ref<string>(props.modelValue);
    const editorRef = ref<QInput>();

    if (local.value.length && local.value.charAt(local.value.length - 1) !== '\n') {
      local.value += '\n';
    }

    function save(): void {
      onDialogOK(local.value);
    }

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: local.value,
        },
      })
        .onOk(v => local.value = v);
    }

    function insertDate(): void {
      createDialog({
        component: 'DatetimeDialog',
        componentProps: {
          modelValue: new Date(),
          title: 'Pick a date',
        },
      })
        .onOk((date: Date) => {
          // Get the textarea wrapped by the q-input
          const native = editorRef.value!.$el.querySelector('textarea');
          const prev = local.value;

          // We want to mirror ctrl+v behaviour
          // Insert at cursor, overwrite any selection
          const [start, end] = native !== null
            ? [native.selectionStart, native.selectionEnd]
            : [prev.length, prev.length];

          // [Fri 11/15/2019, 2:00:23 PM]
          const day = date.toLocaleString(undefined, { weekday: 'short' });
          const insert = `[${day} ${date.toLocaleString()}] `;

          // Splice into current string
          local.value = [
            prev.slice(0, start),
            insert,
            prev.slice(end, prev.length),
          ].join('');

          // We lost focus when pressing the button
          // Reset focus to the editor, at the correct position
          nextTick(() => {
            if (native !== null) {
              editorRef.value?.focus();
              native.selectionStart = start + insert.length;
              native.selectionEnd = start + insert.length;
            }
          });
        });
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      editorRef,
      save,
      showKeyboard,
      insertDate,
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
      <q-input
        ref="editor"
        v-model="local"
        type="textarea"
        label="Note"
        autogrow
        autofocus
        item-aligned
        @keyup.enter.exact.stop
        @keyup.enter.shift.stop
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn flat label="Insert date" color="primary" @click="insertDate" />
        <q-space />
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
