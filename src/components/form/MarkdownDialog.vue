<script setup lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { QInput } from 'quasar';
import { ref } from 'vue';

const props = defineProps({
  ...useDialog.props,
  modelValue: {
    type: String,
    required: true,
  },
});

defineEmits({ ...useDialog.emitsObject });

const { dense } = useGlobals.setup();
const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup();

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
  }).onOk((v) => (local.value = v));
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    :maximized="dense"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <PreviewCard
      enabled
      toggle-icon="mdi-file-document-edit-outline"
    >
      <template #toolbar>
        <Toolbar :title="title" />
      </template>

      <template #preview>
        <q-scroll-area
          visible
          class="fit"
        >
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
        <q-space />
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
    </PreviewCard>
  </q-dialog>
</template>

<style lang="sass">
.editor-input textarea
  min-height: 200px !important
</style>
