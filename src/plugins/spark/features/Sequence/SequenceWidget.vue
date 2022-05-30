<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { SequenceBlock, SequenceError, SequenceStatus } from '@/shared-types';
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent, ref } from 'vue';

const ERROR_TEXT: Record<SequenceError, string | null> = {
  [SequenceError.NONE]: null,
  [SequenceError.INVALID_ARGUMENT]: 'Invalid argument',
  [SequenceError.INVALID_TARGET]: 'Target block is invalid or missing',
  [SequenceError.DISABLED_TARGET]: 'Target block is disabled',
  [SequenceError.INACTIVE_TARGET]:
    'Target block is inactive (driven by disabled block)',
  [SequenceError.SYSTEM_TIME_NOT_AVAILABLE]:
    'System time not set on controller',
};

export default defineComponent({
  name: 'SequenceWidget',
  setup() {
    const { context } = useContext.setup();
    const { block, saveBlock } = useBlockWidget.setup<SequenceBlock>();
    const local = ref<string>(block.value.data.instructions.join('\n'));

    const dirty = computed<boolean>(
      () => local.value !== block.value.data.instructions.join('\n'),
    );

    const stopped = computed<boolean>(
      () =>
        !block.value.data.enabled &&
        block.value.data.status !== SequenceStatus.PAUSED,
    );

    const error = computed<string | null>(() => {
      const msg = ERROR_TEXT[block.value.data.error];
      const instruction =
        block.value.data.instructions[block.value.data.activeInstruction];
      if (!msg || !instruction) {
        return msg;
      }
      const [opcode] = instruction.split(' ', 1);
      return `${opcode}: ${msg}`;
    });

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

    function play(): void {
      block.value.data.enabled = true;
      saveBlock();
    }

    function pause(): void {
      block.value.data.enabled = false;
      saveBlock();
    }

    function stop(): void {
      const { instructions } = block.value.data;
      block.value.data = {
        instructions,
        enabled: false,
        overrideState: true,
        activeInstruction: 0,
        activeInstructionStartedAt: 0,
        disabledAt: 0,
        disabledDuration: 0,
        error: 'NONE',
        status: 'DISABLED',
      };
      saveBlock();
    }

    return {
      context,
      block,
      local,
      dirty,
      error,
      showKeyboard,
      revertLocal,
      saveLocal,
      play,
      pause,
      stop,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div class="column q-ma-md q-gutter-y-sm">
      <div class="row justify-center">
        <q-btn
          :disable="block.data.enabled"
          flat
          label="Start"
          @click="play"
        />
        <q-btn
          :disable="!block.data.enabled"
          flat
          label="Stop"
          @click="pause"
        />
        <q-btn
          flat
          label="Reset"
          :disable="!block.data.enabled && block.data.status !== 'PAUSED'"
          @click="stop"
        />
      </div>

      <CardWarning v-if="error">
        <template #message>
          {{ error }}
        </template>
      </CardWarning>

      <template v-if="context.mode === 'Basic'">
        <LabeledField label="Instructions">
          <div
            v-for="(ins, idx) in block.data.instructions"
            :key="`${idx}-${ins}`"
            :class="[
              block.data.activeInstruction === idx && 'text-primary',
              'monospace q-my-xs',
            ]"
          >
            {{ ins }}
          </div>
        </LabeledField>
      </template>

      <template v-if="context.mode === 'Full'">
        <div class="q-pa-md">
          <q-input
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
        <div class="row">
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
      </template>
    </div>
  </Card>
</template>

<style lang="sass">
.editor-input textarea
  min-height: 200px !important
</style>
