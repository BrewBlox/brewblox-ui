<script lang="ts">
import {
  Compartment,
  EditorState,
  RangeSetBuilder,
  Transaction,
} from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  lineNumbers,
  placeholder,
} from '@codemirror/view';
import { basicDark } from 'cm6-theme-basic-dark';
import { minimalSetup } from 'codemirror';
import { colors } from 'quasar';
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
    const { block, patchBlock } = useBlockWidget.setup<SequenceBlock>();
    const editor = ref<HTMLDivElement>();
    const configError = ref<string | undefined>();
    let view: EditorView; // Set when mounted

    const localInstructionString = ref<string>(
      block.value.data.instructions.join('\n'),
    );
    const activeInstructionString = computed<string>(() =>
      block.value.data.instructions.join('\n'),
    );

    const _editing = ref<boolean>(false);
    const editing = computed<boolean>({
      get: () => _editing.value,
      set: (v) => {
        _editing.value = v;
        view.dispatch({
          effects: [
            editableSetting.reconfigure(EditorView.editable.of(v)),
            readonlySetting.reconfigure(EditorState.readOnly.of(!v)),
          ],
        });
      },
    });

    const dirty = computed<boolean>(
      () => localInstructionString.value !== activeInstructionString.value,
    );

    // not started
    const inactive = computed<boolean>(
      () =>
        !block.value.data.enabled &&
        block.value.data.status !== SequenceStatus.PAUSED &&
        block.value.data.status !== SequenceStatus.END,
    );

    const stopped = computed<boolean>(
      () => block.value.data.status === SequenceStatus.PAUSED,
    );

    const ended = computed<boolean>(
      () => block.value.data.status === SequenceStatus.END,
    );

    const activeInstruction = computed<number>(
      () => block.value.data.activeInstruction,
    );

    const activeInstructionTheme = EditorView.baseTheme({
      '&dark .cm-activeInstruction': {
        backgroundColor: colors.getPaletteColor('secondary'),
      },
    });

    const activeInstructionAttributes = Decoration.line({
      attributes: { class: 'cm-activeInstruction' },
    });

    function activeInstructionDecorations(
      view: EditorView,
      shown: boolean,
      lineNo: number,
    ): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      if (shown && lineNo > 0 && lineNo <= view.state.doc.lines) {
        const line = view.state.doc.line(lineNo);
        builder.add(line.from, line.from, activeInstructionAttributes);
      }
      return builder.finish();
    }

    const highlightActiveInstruction = ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;
        shown: boolean;
        lineNo: number;

        constructor(view: EditorView) {
          this.shown = block.value.data.enabled;
          this.lineNo = activeInstruction.value + 1;
          this.decorations = activeInstructionDecorations(
            view,
            this.shown,
            this.lineNo,
          );
        }

        update(update: ViewUpdate): void {
          const shown = block.value.data.enabled && !editing.value;
          const lineNo = activeInstruction.value + 1;
          if (shown !== this.shown || lineNo !== this.lineNo) {
            this.shown = shown;
            this.lineNo = lineNo;
            this.decorations = activeInstructionDecorations(
              update.view,
              this.shown,
              this.lineNo,
            );
          }
        }
      },
      {
        decorations: (v) => v.decorations,
      },
    );

    const editableSetting = new Compartment();
    const readonlySetting = new Compartment();

    watch(activeInstructionString, (newV, oldV) => {
      // Apply external changes to instructions if we weren't actively editing them
      if (localInstructionString.value === oldV) {
        revertLocal();
      }
    });

    watch(activeInstruction, () => view.dispatch());

    onMounted(async () => {
      view = new EditorView({
        parent: editor.value,
        doc: localInstructionString.value,
        extensions: [
          editableSetting.of(EditorView.editable.of(editing.value)),
          readonlySetting.of(EditorState.readOnly.of(!editing.value)),
          minimalSetup,
          basicDark,
          EditorView.lineWrapping,
          lineNumbers(),
          placeholder('No instructions defined'),
          activeInstructionTheme,
          highlightActiveInstruction,
        ],
        dispatch: (tr: Transaction) => {
          view.update([tr]);
          if (tr.changes.empty) {
            return;
          }
          localInstructionString.value = view.state.doc.toString();
        },
      });
      await nextTick();
    });

    onUnmounted(() => view?.destroy());

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
          modelValue: localInstructionString.value,
        },
      }).onOk((v) => (localInstructionString.value = v));
    }

    function revertLocal(): void {
      localInstructionString.value = activeInstructionString.value;
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: localInstructionString.value,
        },
      });
      configError.value = undefined;
    }

    async function saveLocal(): Promise<void> {
      try {
        await patchBlock({
          instructions: localInstructionString.value
            .trim()
            .split('\n')
            .filter((s) => !!s.trim()),
        });
        configError.value = undefined;
      } catch (e) {
        configError.value = (e as any).response?.data?.error;
      }
    }

    // Start or resume execution, starting with activeInstruction.
    function play(): void {
      patchBlock({ enabled: true });
    }

    // Stop execution, but retain activeInstruction
    function stop(): void {
      patchBlock({ enabled: false });
    }

    // Reset activeInstruction to 0
    // Optionally stop execution
    function reset(enabled: boolean): void {
      patchBlock({
        enabled,
        overrideState: true,
        activeInstruction: 0,
        activeInstructionStartedAt: 0,
        disabledAt: 0,
        disabledDuration: 0,
      });
    }

    return {
      context,
      block,
      editor,
      editing,
      dirty,
      configError,
      inactive,
      stopped,
      ended,
      runtimeError,
      showKeyboard,
      revertLocal,
      saveLocal,
      play,
      stop,
      reset,
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
      <CardWarning v-if="runtimeError">
        <template #message>
          {{ runtimeError }}
        </template>
      </CardWarning>

      <div class="row justify-center q-gutter-sm">
        <q-btn
          flat
          label="Reset"
          :disable="inactive || (block.data.enabled && !ended)"
          @click="reset(false)"
        />
        <q-btn
          v-if="!block.data.enabled"
          flat
          color="primary"
          :label="stopped ? 'Resume' : 'Start'"
          @click="play"
        />
        <q-btn
          v-else-if="ended"
          flat
          color="primary"
          label="Restart"
          @click="reset(true)"
        />
        <q-btn
          v-else
          :disable="ended"
          flat
          color="primary"
          label="Stop"
          @click="stop"
        />
      </div>

      <div
        ref="editor"
        :style="{ border: editing ? '1px solid grey' : '' }"
      />

      <div class="text-red">
        {{ configError }}
      </div>

      <div class="row">
        <q-space />
        <template v-if="editing">
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
        </template>
        <q-btn
          flat
          :label="editing ? 'Stop editing' : 'Edit instructions'"
          icon="edit"
          color="secondary"
          @click="editing = !editing"
        />
      </div>
    </div>
  </Card>
</template>
