<script lang="ts">
import { QInput } from 'quasar';
import { defineComponent, nextTick, ref } from 'vue';

import { useDialog, useGlobals } from '@/composables';
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
    const { dense } = useGlobals.setup();
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    } = useDialog.setup();

    const local = ref<string>(props.modelValue);
    const editorRef = ref<QInput>();
    const preview = ref<boolean>(false);

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
      dense,
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      preview,
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
    :maximized="dense"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <PreviewCard enabled>
      <template #toolbar>
        <DialogToolbar :title="title" subtitle="Edit text note" />
      </template>

      <template #pane>
        <q-scroll-area visible class="fit">
          <MarkdownView
            :text="local"
            class="q-pa-lg"
          />
        </q-scroll-area>
      </template>

      <div class="q-pa-md">
        <q-input
          ref="editorRef"
          v-model="local"
          debounce="500"
          autogrow
          autofocus
          filled
          label="Supports Markdown and HTML formatting"
          stack-label
          class="editor-input"
          @keyup.enter.exact.stop
          @keyup.enter.shift.stop
        >
          <template #append>
            <KeyboardButton @click="showKeyboard" />
          </template>
        </q-input>
      </div>

      <template #actions>
        <q-btn flat label="Insert date" @click="insertDate" />
        <q-space />
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </PreviewCard>
  </q-dialog>
</template>

<style lang="sass">
.editor-input textarea
  min-height: 200px !important
</style>
