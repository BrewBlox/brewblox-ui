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
import { SessionLogConfig } from './types';

const { width } = dom;


@Component
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

  saveSessionTitle(title: string): void {
    if (this.session) {
      this.session.title = title;
      this.saveSession();
    }
  }

  saveSessionDate(date: Date): void {
    if (this.session) {
      this.session.date = date.getTime();
      this.saveSession();
    }
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
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <slot name="graph" />

    <q-card-section v-if="session !== null">
      <q-list>
        <q-item>
          <q-item-section>
            <InputField
              :value="session.title"
              title="Session name"
              label="Session name"
              dense
              @input="saveSessionTitle"
            />
          </q-item-section>
          <q-item-section class="col-auto">
            <DatetimeField
              :value="session.date"
              label="Session date"
              title="Session date"
              default-now
              dense
              @input="saveSessionDate"
            />
          </q-item-section>
        </q-item>
        <draggable ref="notebox" v-model="notes" class="row q-gutter-xs">
          <div
            v-for="note in notes"
            :key="note.id"
            :class="[`col-${note.col}`, 'q-pa-xs', 'q-ma-none']"
          >
            <div style="border: 1px solid silver; border-right: 3px dotted silver;" class="relative-position">
              <div
                v-touch-pan.prevent.stop.mouse="v => onSwipe(v, note)"
                class="move-border"
              />
              <q-item>
                <q-item-section class="col-shrink">
                  <InputField
                    :value="note.title"
                    title="Note name"
                    label="Note name"
                    dense
                    tag-class="ellipsis-3-lines text-info"
                    style="max-width: 100%;"
                    @input="v => saveTitle(note, v)"
                  >
                    <template #before>
                      <q-icon
                        :name="note.type === 'Graph' ? 'mdi-chart-line' : 'mdi-text-subject'"
                        size="xs"
                        class="self-end q-mb-none"
                        color="info"
                      />
                    </template>
                  </InputField>
                </q-item-section>
                <q-space />
                <q-item-section v-if="note.type === 'Graph'" class="col-shrink">
                  <q-btn icon="settings" flat dense @click="editGraph(note)">
                    <q-tooltip>Select graph data</q-tooltip>
                  </q-btn>
                </q-item-section>
                <q-item-section class="col-shrink">
                  <q-btn icon="mdi-dots-vertical" flat dense>
                    <q-menu>
                      <q-list bordered>
                        <ActionItem label="Clear content" icon="clear" @click="clearNote(note)" />
                        <ActionItem label="Remove note" icon="delete" @click="removeNote(note)" />
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-item v-if="note.type === 'Text'">
                <q-item-section class="darkish">
                  <!-- No line breaks to allow correctly rendering whitespace -->
                  <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                  <div style="white-space: pre-wrap; cursor: default;">{{ note.value }}</div>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </draggable>
        <q-item>
          <q-space />
          <q-item-section class="col-auto">
            <q-btn outline round icon="add">
              <q-menu>
                <q-list>
                  <ActionItem label="Add text note" @click="addTextNote" />
                  <ActionItem label="Add graph note" @click="addGraphNote" />
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-section v-else class="column justify-end" style="height: 40%">
      <div class="col-auto row justify-center">
        <q-btn outline label="New session" @click="addSession" />
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.move-border {
  position: absolute;
  right: -10px;
  top: 0;
  width: 20px;
  height: 100%;
  cursor: ew-resize;
  z-index: 10;
}

.move-border:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
