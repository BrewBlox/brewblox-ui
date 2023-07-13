<script setup lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { bloxQty } from '@/utils/quantity';
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
  lineNumbers,
  placeholder,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import {
  SequenceBlock,
  SequenceError,
  SequenceStatus,
} from 'brewblox-proto/ts';
import { basicDark } from 'cm6-theme-basic-dark';
import { minimalSetup } from 'codemirror';
import { colors } from 'quasar';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import SequenceDocumentation from './SequenceDocumentation.vue';

const ERROR_TEXT: Record<SequenceError, string | null> = {
  [SequenceError.NONE]: null,
  [SequenceError.INVALID_ARGUMENT]: 'Invalid argument',
  [SequenceError.INVALID_TARGET]: 'Target block is invalid or missing',
  [SequenceError.DISABLED_TARGET]: 'Target block is disabled',
  [SequenceError.INACTIVE_TARGET]:
    'Target block is inactive (claimed by disabled block)',
  [SequenceError.SYSTEM_TIME_NOT_AVAILABLE]:
    'System time not set on controller',
};

const activeInstructionTheme = EditorView.baseTheme({
  '&dark .cm-activeInstruction': {
    backgroundColor: colors.getPaletteColor('secondary'),
  },
});

const activeInstructionAttributes = Decoration.line({
  attributes: { class: 'cm-activeInstruction' },
});

const { inDialog } = useContext.setup();
const { block, patchBlock } = useBlockWidget.setup<SequenceBlock>();
const editor = ref<HTMLDivElement>();
const configError = ref<string | undefined>();

const editableSetting = new Compartment();
const readonlySetting = new Compartment();
let view: EditorView; // Set when mounted

const localInstructionsText = ref<string>(
  block.value.data.instructions.join('\n'),
);

const blockInstructionsText = computed<string>(() =>
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
  () => localInstructionsText.value !== blockInstructionsText.value,
);

const activeInstruction = computed<number>(
  () => block.value.data.activeInstruction,
);

const numInstructions = computed<number>(
  () => block.value.data.instructions.length,
);

const inactive = computed<boolean>(
  () =>
    !block.value.data.enabled &&
    block.value.data.status !== SequenceStatus.PAUSED &&
    block.value.data.status !== SequenceStatus.END,
);

const playing = computed<boolean>(
  () =>
    block.value.data.enabled && block.value.data.status !== SequenceStatus.END,
);

const ended = computed<boolean>(
  () => block.value.data.status === SequenceStatus.END,
);

const runtimeError = computed<string | null>(() => {
  const { error, instructions, activeInstruction } = block.value.data;
  const msg = ERROR_TEXT[error];
  if (msg == null) {
    return null;
  }
  const instruction = instructions[activeInstruction];
  if (!instruction) {
    return msg;
  }
  const [opcode] = instruction.split(' ', 1);
  return `${opcode}: ${msg}`;
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
      this.shown = !editing.value && !inactive.value;
      this.lineNo = activeInstruction.value + 1;
      this.decorations = activeInstructionDecorations(
        view,
        this.shown,
        this.lineNo,
      );
    }

    update(update: ViewUpdate): void {
      const shown = !editing.value && !inactive.value;
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

watch(blockInstructionsText, (newV, oldV) => {
  // Apply external changes to instructions if we weren't actively editing them
  if (localInstructionsText.value === oldV) {
    revertLocal();
  }
});

watch(activeInstruction, (idx: number) => {
  if (!editing.value && idx >= 0 && idx < numInstructions.value) {
    view.dispatch({
      effects: [EditorView.scrollIntoView(view.state.doc.line(idx + 1).from)],
    });
  } else {
    view.dispatch();
  }
});

onMounted(async () => {
  view = new EditorView({
    parent: editor.value,
    doc: localInstructionsText.value,
    extensions: [
      minimalSetup,
      basicDark,
      placeholder('No instructions defined'),
      lineNumbers(),
      EditorView.lineWrapping,
      editableSetting.of(EditorView.editable.of(editing.value)),
      readonlySetting.of(EditorState.readOnly.of(!editing.value)),
      activeInstructionTheme,
      highlightActiveInstruction,
    ],
    dispatch: (tr: Transaction) => {
      view.update([tr]);
      if (!tr.changes.empty) {
        localInstructionsText.value = view.state.doc.toString();
      }
    },
  });
  await nextTick();
});

onUnmounted(() => view?.destroy());

function revertLocal(): void {
  localInstructionsText.value = blockInstructionsText.value;
  configError.value = undefined;
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: localInstructionsText.value,
    },
  });
}

async function saveLocal(): Promise<void> {
  try {
    await patchBlock({
      instructions: localInstructionsText.value
        .trim()
        .split('\n')
        .filter((s) => !!s.trim()),
    });
    configError.value = undefined;
  } catch (e) {
    configError.value = (e as any).response?.data?.error;
  }
}

function toggleEditing(): void {
  if (!editing.value || !dirty.value) {
    editing.value = !editing.value;
    return;
  }

  createDialog({
    component: 'SaveConfirmDialog',
    componentProps: {
      title: 'Save changes',
      message: 'You have unsaved changes. Do you want to save them now?',
    },
  }).onOk(async (saved: boolean) => {
    if (saved) {
      await saveLocal();
      // do not exit editing mode if we failed to save
      if (!configError.value) {
        editing.value = false;
      }
    } else {
      revertLocal();
      editing.value = false;
    }
  });
}

// Reset activeInstruction to 0
// Optionally halt execution
function reset(enabled: boolean): void {
  patchBlock({
    enabled,
    overrideState: true,
    activeInstruction: 0,
    activeInstructionStartedAt: null,
    disabledAt: null,
    disabledDuration: bloxQty('0s'),
  });
}

// If inactive: start
// If paused: resume
// If ended: restart
function play(): void {
  if (ended.value) {
    reset(true);
  } else {
    patchBlock({ enabled: true });
  }
}

// Halt execution, but retain activeInstruction
function pause(): void {
  patchBlock({ enabled: false });
}

// Retain current enabled state
// Set active instruction to idx if it's within range
function skipTo(idx: number): void {
  if (idx >= 0 && idx < numInstructions.value) {
    patchBlock({
      overrideState: true,
      activeInstruction: idx,
      activeInstructionStartedAt: null,
      disabledAt: null,
      disabledDuration: bloxQty('0s'),
    });
  }
}
</script>

<template>
  <PreviewCard
    :enabled="inDialog"
    show-initial
  >
    <template #preview>
      <SequenceDocumentation />
    </template>

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
          icon="mdi-skip-previous"
          :disable="editing || ended || activeInstruction === 0"
          @click="skipTo(activeInstruction - 1)"
        />
        <q-btn
          flat
          icon="mdi-stop"
          :disable="inactive || playing || ended"
          @click="reset(false)"
        />
        <q-btn
          v-if="playing"
          flat
          icon="mdi-pause"
          @click="pause"
        />
        <q-btn
          v-else
          flat
          icon="mdi-play"
          @click="play"
        />
        <q-btn
          flat
          icon="mdi-skip-next"
          :disable="editing || activeInstruction + 1 >= numInstructions"
          @click="skipTo(activeInstruction + 1)"
        />
      </div>

      <div
        ref="editor"
        :style="{
          border: editing ? '1px solid grey' : '',
        }"
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
          @click="toggleEditing"
        />
      </div>
    </div>
  </PreviewCard>
</template>
