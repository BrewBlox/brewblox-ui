<script lang="ts">
import { Transaction } from '@codemirror/state';
import { EditorView, lineNumbers, placeholder } from '@codemirror/view';
import { basicDark } from 'cm6-theme-basic-dark';
import { minimalSetup } from 'codemirror';
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { SequenceBlock, SequenceError, SequenceStatus } from '@/shared-types';
import { createDialog } from '@/utils/dialog';

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
    const { block, saveBlock, patchBlock } =
      useBlockWidget.setup<SequenceBlock>();
    const local = ref<string>(block.value.data.instructions.join('\n'));
    const configError = ref<string | undefined>();

    const editor = ref<HTMLDivElement>();
    let view: EditorView;

    const actual = computed<string>(() =>
      block.value.data.instructions.join('\n'),
    );

    const dirty = computed<boolean>(() => local.value !== actual.value);

    const stopped = computed<boolean>(
      () =>
        !block.value.data.enabled &&
        block.value.data.status !== SequenceStatus.PAUSED,
    );

    watch(actual, (newV, oldV) => {
      if (local.value === oldV) {
        revertLocal();
      }
    });

    const runtimeDesc = computed<string>(() => {
      const { status, instructions, activeInstruction } = block.value.data;
      if (stopped.value || !instructions.length) {
        return '---';
      }
      if (status === SequenceStatus.END) {
        return 'Done';
      }
      return `${activeInstruction + 1} / ${instructions.length}`;
    });

    const runtimeError = computed<string | null>(() => {
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
      local.value = actual.value;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: local.value },
      });
      configError.value = undefined;
    }

    async function saveLocal(): Promise<void> {
      try {
        await patchBlock({
          instructions: local.value
            .trim()
            .split('\n')
            .filter((s) => !!s.trim()),
        });
        configError.value = undefined;
      } catch (e) {
        configError.value = (e as any).response?.data?.error;
      }
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

    onMounted(async () => {
      view = new EditorView({
        doc: local.value,
        extensions: [
          minimalSetup,
          basicDark,
          EditorView.lineWrapping,
          lineNumbers(),
          placeholder('Edit your sequence'),
        ],
        parent: editor.value,
        dispatch: (tr: Transaction) => {
          view.update([tr]);
          if (tr.changes.empty) {
            return;
          }
          local.value = view.state.doc.toString();
        },
      });
      await nextTick();
    });

    onUnmounted(() => view.destroy());

    return {
      context,
      block,
      local,
      editor,
      dirty,
      configError,
      stopped,
      runtimeDesc,
      runtimeError,
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
      <BlockWidgetToolbar />
    </template>

    <div class="column q-ma-md q-gutter-y-sm">
      <div class="row justify-center">
        <q-circular-progress
          :value="block.data.activeInstruction"
          :max="block.data.instructions.length"
          :indeterminate="!block.data.enabled && !stopped && false"
          show-value
          size="100px"
          :color="block.data.enabled ? 'primary' : 'grey'"
          :class="['q-ma-md', !block.data.enabled && !stopped && 'fade-7']"
        >
          {{ runtimeDesc }}
        </q-circular-progress>
      </div>

      <div class="row justify-center q-gutter-sm">
        <q-btn
          flat
          label="Reset"
          :disable="stopped || block.data.enabled"
          @click="stop"
        />
        <q-btn
          v-if="!block.data.enabled"
          flat
          color="primary"
          :label="stopped ? 'Start' : 'Resume'"
          @click="play"
        />
        <q-btn
          v-else
          flat
          color="primary"
          label="Stop"
          @click="pause"
        />
      </div>

      <CardWarning v-if="runtimeError">
        <template #message>
          {{ runtimeError }}
        </template>
      </CardWarning>

      <div
        ref="editor"
        class="codemirror-editor col"
      />

      <div class="text-red">
        {{ configError }}
      </div>

      <div class="row">
        <q-space />
        <q-btn
          flat
          label="Revert"
          :disable="!dirty && !configError"
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
    </div>
  </Card>
</template>

<style lang="sass">
.cm-editor
  border: 1px solid grey
</style>
