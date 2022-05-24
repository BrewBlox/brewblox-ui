<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { SequenceBlock } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'SequenceWidget',
  setup() {
    const { context, inDialog } = useContext.setup();
    const { block, saveBlock } = useBlockWidget.setup<SequenceBlock>();
    const local = ref<string>(block.value.data.instructions.join('\n'));

    const dirty = computed<boolean>(
      () => local.value != block.value.data.instructions.join('\n'),
    );

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: local.value,
        },
      }).onOk((v) => (local.value = v));
    }

    function revertLocal(): void {
      local.value = block.value.data.instructions.join('\n');
    }

    function saveLocal(): void {
      block.value.data.instructions = local.value.split('\n');
      saveBlock();
    }

    return {
      block,
      local,
      dirty,
      showKeyboard,
      revertLocal,
      saveLocal,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>

    <div class="column q-ma-md q-gutter-y-sm">
      <BlockEnableToggle>
        <template #enabled>
          Sequence is enabled.
        </template>
        <template #disabled>
          Sequence is disabled.
        </template>
      </BlockEnableToggle>
      <div>status = {{ block.data.status }}</div>
      <div>error = {{ block.data.error }}</div>
      <div>
        instruction = {{ block.data.activeInstruction + 1 }} /
        {{ block.data.instructions.length }}
      </div>
      <div>{{ block.data.instructions }}</div>
      <div class="col row">
        <!-- <q-btn flat label="Insert date" @click="insertDate" /> -->
        <q-space />
        <q-btn
          flat
          label="Revert"
          :disable="!dirty"
          color="primary"
          @click="revertLocal"
        />
        <q-btn
          flat
          label="Save"
          :disable="!dirty"
          color="primary"
          @click="saveLocal"
        />
      </div>
      <div class="q-pa-md">
        <q-input
          ref="editorRef"
          v-model="local"
          autogrow
          autofocus
          filled
          label="Instructions"
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
    </div>
  </Card>
</template>

<style lang="sass" scoped>
.editor-input textarea
  min-height: 200px !important
</style>
