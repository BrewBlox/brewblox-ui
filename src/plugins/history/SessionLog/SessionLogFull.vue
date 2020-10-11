<script lang="ts">
import clamp from 'lodash/clamp';
import { dom, uid } from 'quasar';
import { Component, Ref } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { emptyGraphConfig } from '../getters';
import { sharedWidgetConfigs } from '../helpers';
import { historyStore } from '../store';
import { LoggedSession, SessionGraphNote, SessionNote, SharedGraphConfig } from '../types';
import SessionHeaderField from './SessionHeaderField.vue';
import { SessionLogConfig } from './types';

const { width } = dom;


@Component({
  components: {
    SessionHeaderField,
  },
})
export default class SessionLogFull extends CrudComponent<SessionLogConfig> {
  colSizes = [3, 4, 6, 8, 9, 12];
  initialCol = 0;
  colDistance = 0;

  @Ref()
  readonly notebox!: any;

  get session(): LoggedSession | null {
    return this.config.currentSession === null
      ? null
      : historyStore.sessionById(this.config.currentSession);
  }

  saveSession(session: LoggedSession | null = this.session): void {
    if (session !== null) {
      historyStore.saveSession(session);
    }
  }

  get notes(): SessionNote[] {
    return this.session ? this.session.notes : [];
  }

  set notes(notes: SessionNote[]) {
    if (this.session) {
      this.session.notes = notes;
      this.saveSession();
    }
  }

  sharedConfigs(excluded: string[]): SharedGraphConfig[] {
    return [
      ...sharedWidgetConfigs(excluded),
      ...this.notes
        .filter(note => note.type === 'Graph' && !excluded.includes(note.id))
        .map(note => {
          const { id, title, config } = note as SessionGraphNote;
          return { id, title: `(Note) ${title}`, config };
        }),
    ];
  }

  saveTitle(note: SessionNote, title: string): void {
    if (title !== note.title) {
      note.title = title;
      this.saveSession();
    }
  }

  clearNote(note: SessionNote): void {
    if (note.type === 'Text') {
      note.value = '';
    }
    if (note.type === 'Graph') {
      note.start = null;
      note.end = null;
    }
    this.saveSession();
  }

  removeNote(note: SessionNote): void {
    spliceById(this.notes, note, false);
    this.saveSession();
  }

  addTextNote(): void {
    createDialog({
      component: 'InputDialog',
      value: 'New text field',
      title: 'Add field',
      label: 'Name',
    })
      .onOk(title => {
        this.notes.push({
          id: uid(),
          type: 'Text',
          title,
          value: '',
          col: 12,
        });
        this.saveSession();
      });
  }

  addGraphNote(): void {
    createDialog({
      component: 'InputDialog',
      value: 'New graph field',
      title: 'Add field',
      label: 'Name',
    })
      .onOk(title => {
        this.notes.push({
          id: uid(),
          type: 'Graph',
          title,
          start: null,
          end: null,
          config: emptyGraphConfig(),
          col: 12,
        });
        this.saveSession();
      });
  }

  editGraph(note: SessionGraphNote): void {
    createDialog({
      component: 'GraphEditorDialog',
      parent: this,
      title: note.title,
      config: note.config,
      noPeriod: true,
      shared: this.sharedConfigs([note.id]),
    })
      .onOk(config => {
        const actual = this.notes.find(n => n.id === note.id);
        if (actual !== undefined && actual.type === 'Graph') {
          this.$set(actual, 'config', config);
          this.saveSession();
        }
      });
  }

  addSession(): void {
    this.$emit('add');
  }

  onSwipe(args: PanArguments, note: SessionNote): void {
    if (args.isFirst) {
      this.initialCol = note.col;
      this.colDistance = this.notebox !== undefined
        ? (width(this.notebox.$el) || 600) / 12
        : 50;
    }

    const delta = Math.round(args.offset.x / this.colDistance);
    note.col = clamp(this.initialCol + delta, 3, 12);

    if (args.isFinal && note.col !== this.initialCol) {
      this.saveSession();
    }
  }
}
</script>


<template>
  <div class="widget-lg">
    <slot name="warnings" />

    <div v-if="session !== null" class="column q-ma-md">
      <SessionHeaderField
        :session="session"
        class="col q-mb-sm"
        @update:session="saveSession"
      />

      <draggable
        ref="notebox"
        v-model="notes"
        :disabled="$dense"
        class="col row q-gutter-xs"
      >
        <div
          v-for="note in notes"
          :key="note.id"
          :class="[`col-${note.col}`, 'q-pa-xs q-ma-none']"
        >
          <div style="border: 1px solid silver; border-right: 3px dotted silver;" class="relative-position">
            <div
              v-touch-pan.prevent.stop.mouse="v => onSwipe(v, note)"
              class="move-border"
            />
            <div class="row q-gutter-x-xs q-pa-xs">
              <InputField
                :value="note.title"
                title="Note name"
                label="Note name"
                dense
                tag-class="ellipsis-3-lines text-secondary"
                style="max-width: 100%;"
                class="col q-pb-xs"
                @input="v => saveTitle(note, v)"
              >
                <template #before>
                  <q-icon
                    :name="note.type === 'Graph' ? 'mdi-chart-line' : 'mdi-text-subject'"
                    size="xs"
                    class="self-end q-mb-none"
                    color="secondary"
                  />
                </template>
              </InputField>
              <div
                v-if="note.type === 'Graph'"
                class="col-auto row"
              >
                <q-btn
                  icon="settings"
                  flat

                  class="col self-stretch depth-1"
                  @click="editGraph(note)"
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
                      <ActionItem label="Clear content" icon="clear" @click="clearNote(note)" />
                      <ActionItem label="Remove note" icon="delete" @click="removeNote(note)" />
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
              <template v-if="note.type === 'Text' && note.value">
                <div class="col-break" />
                <div class="col darkish ellipsis q-pa-xs">
                  <!-- No line breaks to allow correctly rendering whitespace -->
                  <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                  <div style="white-space: pre-wrap; cursor: default;">{{ note.value }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </draggable>

      <div class="col row justify-end q-mt-sm">
        <q-btn fab-mini color="secondary" icon="add">
          <q-menu>
            <q-list>
              <ActionItem label="Add text note" @click="addTextNote" />
              <ActionItem label="Add graph note" @click="addGraphNote" />
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
