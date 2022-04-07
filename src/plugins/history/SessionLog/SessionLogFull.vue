<script lang="ts">
import clamp from 'lodash/clamp';
import { nanoid } from 'nanoid';
import { dom } from 'quasar';
import { ComponentPublicInstance, computed, defineComponent, ref } from 'vue';

import { useGlobals, useWidget } from '@/composables';
import { spliceById } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';

import { useHistoryStore } from '../store';
import {
  LoggedSession,
  SessionGraphNote,
  SessionNote,
  SharedGraphConfig,
} from '../types';
import { emptyGraphConfig, sharedWidgetConfigs } from '../utils';
import SessionHeaderField from './SessionHeaderField.vue';
import { SessionLogWidget } from './types';

const { width } = dom;

export default defineComponent({
  name: 'SessionLogFull',
  components: {
    SessionHeaderField,
  },
  setup() {
    const historyStore = useHistoryStore();
    const { dense } = useGlobals.setup();
    const { config } = useWidget.setup<SessionLogWidget>();

    const initialCol = ref<number>(0);
    const colDistance = ref<number>(0);
    const noteboxRef = ref<ComponentPublicInstance>();

    const session = computed<LoggedSession | null>(() =>
      historyStore.sessionById(config.value.currentSession),
    );

    function saveSession(sess: LoggedSession | null = session.value): void {
      if (sess != null) {
        historyStore.saveSession(sess);
      }
    }

    const notes = computed<SessionNote[]>({
      get: () => session.value?.notes ?? [],
      set: (notes) => {
        if (session.value) {
          session.value.notes = notes;
          saveSession();
        }
      },
    });

    function sharedConfigs(excluded: string[]): SharedGraphConfig[] {
      return [
        ...sharedWidgetConfigs(excluded),
        ...notes.value
          .filter(
            (note) => note.type === 'Graph' && !excluded.includes(note.id),
          )
          .map((note) => {
            const { id, title, config } = note as SessionGraphNote;
            return { id, title: `(Note) ${title}`, config };
          }),
      ];
    }

    function saveTitle(note: SessionNote, title: string): void {
      if (title !== note.title) {
        note.title = title;
        saveSession();
      }
    }

    function clearNote(note: SessionNote): void {
      if (note.type === 'Text') {
        note.value = '';
      }
      if (note.type === 'Graph') {
        note.start = null;
        note.end = null;
      }
      saveSession();
    }

    function removeNote(note: SessionNote): void {
      spliceById(notes.value, note, false);
      saveSession();
    }

    function addTextNote(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: 'New text note',
          title: 'Add note',
          label: 'Name',
        },
      }).onOk((title) => {
        notes.value.push({
          id: nanoid(),
          type: 'Text',
          title,
          value: '',
          col: 12,
        });
        saveSession();
      });
    }

    function addGraphNote(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: 'New graph',
          title: 'Add graph',
          label: 'Name',
        },
      }).onOk((title) => {
        notes.value.push({
          id: nanoid(),
          type: 'Graph',
          title,
          start: null,
          end: null,
          config: emptyGraphConfig(),
          col: 12,
        });
        saveSession();
      });
    }

    function editGraph(note: SessionGraphNote): void {
      createDialog({
        component: 'GraphEditorDialog',
        componentProps: {
          title: note.title,
          config: note.config,
          noPeriod: true,
          shared: sharedConfigs([note.id]),
        },
      }).onOk((config) => {
        const actual = notes.value.find((n) => n.id === note.id);
        if (actual?.type === 'Graph') {
          actual.config = config;
          saveSession();
        }
      });
    }

    function onSwipe(args: PanArguments, note: SessionNote): void {
      if (args.isFirst) {
        initialCol.value = note.col;
        colDistance.value =
          noteboxRef.value !== undefined
            ? (width(noteboxRef.value.$el) || 600) / 12
            : 50;
      }

      const delta = Math.round(args.offset.x / colDistance.value);
      note.col = clamp(initialCol.value + delta, 3, 12);

      if (args.isFinal && note.col !== initialCol.value) {
        saveSession();
      }
    }

    return {
      dense,
      session,
      saveSession,
      notes,
      onSwipe,
      saveTitle,
      editGraph,
      clearNote,
      removeNote,
      addTextNote,
      addGraphNote,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div v-if="session !== null" class="column q-ma-md">
      <SessionHeaderField
        :session="session"
        class="col q-mb-sm"
        @update:session="saveSession"
      />

      <vue-draggable
        ref="noteboxRef"
        v-model="notes"
        :disabled="dense"
        item-key="id"
        class="col row q-gutter-xs"
      >
        <template #item="{ element }">
          <div :class="[`col-${element.col}`, 'q-pa-xs q-ma-none']">
            <div
              style="border: 1px solid silver; border-right: 3px dotted silver"
              class="relative-position"
            >
              <div
                v-touch-pan.prevent.stop.mouse="(v) => onSwipe(v, element)"
                class="move-border"
              />
              <div class="row q-gutter-x-xs q-pa-xs">
                <InputField
                  :model-value="element.title"
                  title="Name"
                  label="Name"
                  dense
                  tag-class="ellipsis-3-lines text-secondary"
                  style="max-width: 100%"
                  class="col q-pb-xs"
                  @update:model-value="(v) => saveTitle(element, v)"
                >
                  <template #before>
                    <q-icon
                      :name="
                        element.type === 'Graph'
                          ? 'mdi-chart-line'
                          : 'mdi-text-subject'
                      "
                      size="xs"
                      class="self-end q-mb-none"
                      color="secondary"
                    />
                  </template>
                </InputField>
                <div v-if="element.type === 'Graph'" class="col-auto row">
                  <q-btn
                    icon="settings"
                    flat
                    class="col self-stretch depth-1"
                    @click="editGraph(element)"
                  >
                    <q-tooltip>Select graph data</q-tooltip>
                  </q-btn>
                </div>
                <div class="col-auto row q-mr-sm">
                  <q-btn
                    icon="mdi-dots-vertical"
                    flat
                    dense
                    class="col self-stretch depth-1"
                  >
                    <q-menu>
                      <q-list bordered>
                        <ActionItem
                          label="Clear content"
                          icon="clear"
                          @click="clearNote(element)"
                        />
                        <ActionItem
                          label="Remove"
                          icon="delete"
                          @click="removeNote(element)"
                        />
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
                <template v-if="element.type === 'Text' && element.value">
                  <div class="col-break" />
                  <MarkdownView
                    :text="element.value || 'Click to set'"
                    class="col darkish q-pa-xs"
                    style="max-height: 300px; overflow: hidden"
                  />
                </template>
              </div>
            </div>
          </div>
        </template>
      </vue-draggable>

      <div class="col row justify-end q-mt-sm">
        <q-btn fab-mini color="secondary" icon="add">
          <q-menu>
            <q-list>
              <ActionItem label="Add text note" @click="addTextNote" />
              <ActionItem label="Add graph" @click="addGraphNote" />
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.move-border {
  position: absolute;
  right: -11px;
  top: 1px;
  width: 20px;
  height: calc(100% - 2px);
  cursor: ew-resize;
  z-index: 10;
  border-radius: 4px;
}

.move-border:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
