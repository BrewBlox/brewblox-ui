<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import { computed, ref, watch } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { useHistoryStore } from '../store';
import { LoggedSession, SessionGraphNote, SessionNote } from '../types';
import { emptyGraphConfig } from '../utils';
import SessionSelectField from './SessionSelectField.vue';

interface Props extends UseDialogProps {
  widgetTags: string[];
  preselected?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  preselected: null,
});

defineEmits<UseDialogEmits>();

const historyStore = useHistoryStore();
const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<LoggedSession>();

const sessionTitle = ref<string>('New Session');
const tags = ref<string[]>([]);
const customTags = ref<boolean>(false);
const example: LoggedSession = {
  id: nanoid(),
  title: 'Example session',
  date: new Date().toISOString(),
  tags: [...props.widgetTags],
  notes: [
    {
      id: nanoid(),
      title: 'Example note',
      type: 'Text',
      value: '',
      col: 12,
    },
    {
      id: nanoid(),
      title: 'Subprocess graph',
      type: 'Graph',
      start: null,
      end: null,
      config: emptyGraphConfig(),
      col: 12,
    },
  ],
};

const source = ref<LoggedSession>(
  props.preselected ? historyStore.sessionById(props.preselected)! : example,
);

watch(
  () => source.value,
  (newV) => {
    if (!customTags.value) {
      resetTags(newV);
    }
  },
);

const sessions = computed<LoggedSession[]>(() => [
  example,
  ...historyStore.sessions,
]);

const knownTags = computed<string[]>(() => historyStore.sessionTags);

function saveTags(values: string[]): void {
  customTags.value = true;
  tags.value = [...values];
}

function resetTags(src: LoggedSession | null = source.value): void {
  customTags.value = true;
  tags.value = [
    ...props.widgetTags,
    ...(src?.tags?.filter((t) => !t.startsWith('on:')) ?? []),
  ];
}

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: sessionTitle.value,
    },
  }).onOk((v) => (sessionTitle.value = v));
}

function sourceNotes(): SessionNote[] {
  if (source.value === null) {
    return [];
  }
  return source.value.notes.map((note) => {
    const copy = cloneDeep(note);
    copy.id = nanoid();
    if (note.type === 'Text') {
      return { ...copy, value: '' };
    }
    if (note.type === 'Graph') {
      (copy as SessionGraphNote).config.layout.annotations = [];
      return { ...copy, start: null, end: null };
    }
    return copy;
  });
}

async function save(): Promise<void> {
  const id = nanoid();
  const session: LoggedSession = {
    id,
    title: sessionTitle.value,
    date: new Date().toISOString(),
    notes: sourceNotes(),
    tags: tags.value,
  };
  await historyStore.createSession(session);
  onDialogOK(session);
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard :title="title">
      <q-input
        v-model="sessionTitle"
        label="Session name"
        autofocus
        item-aligned
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <SessionSelectField
        v-model="source"
        :sessions="sessions"
        label="Use same fields as:"
      />
      <TagSelectField
        :model-value="tags"
        :existing="knownTags"
        class="tag-select"
        @update:model-value="saveTags"
      >
        <template
          v-if="customTags"
          #append
        >
          <q-btn
            icon="mdi-backup-restore"
            flat
            round
            dense
            class="self-center"
            @click="resetTags()"
          >
            <q-tooltip> Undo tag changes </q-tooltip>
          </q-btn>
        </template>
      </TagSelectField>
      <template #actions>
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
    </DialogCard>
  </q-dialog>
</template>

<style>
.tag-select .q-field__append {
  align-self: flex-end;
}
</style>
