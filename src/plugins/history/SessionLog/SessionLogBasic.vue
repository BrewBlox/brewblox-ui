<script setup lang="ts">
import { computed } from 'vue';
import { useWidget } from '@/composables';
import { spliceById } from '@/utils/collections';
import { createComponentDialog, createDialog } from '@/utils/dialog';
import { shortDateString } from '@/utils/quantity';
import { useHistoryStore } from '../store';
import {
  GraphAnnotation,
  LoggedSession,
  SessionGraphNote,
  SessionNote,
} from '../types';
import SessionGraphNoteDialog from './SessionGraphNoteDialog.vue';
import SessionHeaderField from './SessionHeaderField.vue';
import SessionTextNoteDialog from './SessionTextNoteDialog.vue';
import { SessionLogWidget } from './types';

const historyStore = useHistoryStore();
const { config } = useWidget.setup<SessionLogWidget>();

const session = computed<LoggedSession | null>(() =>
  historyStore.sessionById(config.value.currentSession),
);

function saveSession(sess: LoggedSession | null = session.value): void {
  if (sess != null) {
    historyStore.saveSession(sess);
  }
}

const notes = computed<SessionNote[]>(() => session.value?.notes ?? []);

function saveNote(note: SessionNote): void {
  spliceById(notes.value, note);
  saveSession();
}

function saveAnnotations(
  note: SessionGraphNote,
  annotations: GraphAnnotation[],
): void {
  note.config.layout.annotations = annotations;
  saveNote(note);
}

function openNote(note: SessionNote): void {
  if (note.type === 'Text') {
    createComponentDialog({
      component: SessionTextNoteDialog,
      componentProps: {
        title: note.title,
        modelValue: note.value,
      },
    }).onOk((value) => saveNote({ ...note, value }));
  }

  if (note.type === 'Graph') {
    createDialog({
      component: 'GraphDialog',
      componentProps: {
        graphId: note.id,
        annotated: true,
        saveAnnotations: (v) => saveAnnotations(note, v),
        config: {
          ...note.config,
          params: {
            start: note.start || undefined,
            end: note.end || undefined,
            duration: note.start ? undefined : '1h',
          },
        },
      },
    });
  }
}

function startGraphNote(note: SessionGraphNote): void {
  note.start = new Date().toISOString();
  saveSession();
}

function stopGraphNote(note: SessionGraphNote): void {
  note.end = new Date().toISOString();
  saveSession();
}

function editGraphNote(note: SessionGraphNote): void {
  createComponentDialog({
    component: SessionGraphNoteDialog,
    componentProps: {
      modelValue: note,
      title: note.title,
      message: 'You can choose graph lines in the widget settings.',
    },
  }).onOk(({ start, end }) => {
    const actual = notes.value.find((n) => n.id === note.id);
    if (actual && actual.type === 'Graph') {
      actual.start = start;
      actual.end = end;
      saveSession();
    }
  });
}
</script>

<template>
  <div>
    <slot name="warnings" />

    <div
      v-if="session !== null"
      class="row q-ma-md"
    >
      <SessionHeaderField
        :session="session"
        class="col q-mb-sm"
        @update:session="saveSession"
      />

      <div class="col-break" />

      <div
        v-for="note in notes"
        :key="note.id"
        :class="[`col-${note.col}`, 'q-pa-xs']"
      >
        <div
          class="row q-pa-sm q-gutter-x-xs clickable rounded-borders"
          @click="openNote(note)"
        >
          <!-- Text note -->
          <template v-if="note.type === 'Text'">
            <div class="col-grow">
              <q-item-label
                caption
                class="text-secondary"
              >
                <q-icon name="mdi-text-subject" />
                {{ note.title }}
              </q-item-label>
              <MarkdownView
                style="overflow: hidden; max-height: 300px"
                :text="note.value || 'Click to set'"
              />
            </div>
          </template>

          <template v-if="note.type === 'Graph'">
            <div class="col-grow">
              <q-item-label
                caption
                class="text-secondary"
              >
                <q-icon name="mdi-chart-line" />
                {{ note.title }}
              </q-item-label>
              <div
                :class="[
                  'col-grow row wrap',
                  {
                    'text-negative':
                      note.start && note.end && note.start > note.end,
                  },
                ]"
              >
                <span :class="{ 'text-grey': note.start === null }">
                  {{ shortDateString(note.start, 'No start date') }}
                </span>
                <span
                  v-if="note.start || note.end"
                  :class="['q-ml-xs', { 'text-grey': note.end === null }]"
                >
                  <q-icon name="mdi-arrow-right" />
                  {{ shortDateString(note.end, 'In progress') }}
                </span>
              </div>
            </div>
            <q-btn
              v-if="note.start === null && note.end === null"
              flat
              dense
              icon="mdi-play"
              @click.stop="startGraphNote(note)"
            >
              <q-tooltip>Start</q-tooltip>
            </q-btn>
            <q-btn
              v-if="note.start !== null && note.end === null"
              flat
              dense
              icon="mdi-stop"
              @click.stop="stopGraphNote(note)"
            >
              <q-tooltip>Stop</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              icon="mdi-calendar-clock"
              @click.stop="editGraphNote(note)"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
