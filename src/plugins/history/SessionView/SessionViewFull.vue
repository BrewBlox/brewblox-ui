<script lang="ts">
import { uid } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { objectSorter } from '@/helpers/functional';
import { durationString } from '@/helpers/functional';
import { targetBuilder, targetSplitter } from '@/plugins/history/nodes';

import { sharedWidgetConfigs } from '../helpers';
import { DisplayNames } from '../types';
import { Session, SessionViewConfig } from './types';

@Component
export default class SessionViewFull extends CrudComponent<SessionViewConfig> {
  sessionInput = '';

  @Prop({ default: null })
  readonly initialSession!: Session | null;

  @Emit('create')
  createSession(): void { }

  @Emit('graph')
  showSession(session: Session): string {
    return session.id;
  }

  get sessions(): Session[] {
    // copy the array first to avoid mutating the original
    return [...this.widget.config.sessions]
      .sort(objectSorter('name'));
  }

  updateSession(session: Session): void {
    session.graphCfg.layout.title = session.name;
    this.saveConfig({
      ...this.widget.config,
      sessions: this.sessions
        .map(s => (s.id === session.id ? session : s)),
    });
  }

  startSession(session: Session, time: number): void {
    if (time && session.end && time > session.end) {
      this.$q.notify({ message: 'Session start must be before its end' });
      return;
    }
    session.start = time;
    session.graphCfg.params.start = time;
    this.updateSession(session);
  }

  endSession(session: Session, time: number): void {
    if (time && session.start && time < session.start) {
      this.$q.notify({ message: 'Session end must be after its start' });
      return;
    }
    session.end = time;
    session.graphCfg.params.end = time;
    this.updateSession(session);
  }

  deleteSession(session: Session): void {
    this.saveConfig({
      ...this.widget.config,
      sessions: this.sessions
        .filter(s => s.id !== session.id),
    });
  }

  duplicateSession(session: Session): void {
    const name = session.name;
    const existingNames = this.sessions.map(s => s.name);

    const copyName = (i: number): string =>
      (name.match(/\(\d+\)$/)
        ? name.replace(/\(\d+\)$/, `(${i})`)
        : `${name}(${i})`);

    let idx = 2;
    while (existingNames.includes(copyName(idx))) {
      idx += 1;
    }

    const newSession = { ...session, name: copyName(idx), id: uid() };
    this.saveConfig({
      ...this.widget.config,
      sessions: [...this.sessions, newSession],
    });
  }

  sessionSelected(session: Session): string[] {
    return targetSplitter(session.graphCfg.targets);
  }

  updateSessionSelected(session: Session, selected: string[]): void {
    session.graphCfg.targets = targetBuilder(selected || [], false);
    this.updateSession(session);
  }

  updateSessionRenames(session: Session, vals: DisplayNames): void {
    session.graphCfg.renames = vals;
    this.updateSession(session);
  }

  sessionDuration(session: Session): string {
    if (session.start === null || session.end === null) {
      return '---';
    }
    return durationString(session.end - session.start);
  }

  editSession(session: Session): void {
    createDialog({
      component: 'GraphEditorDialog',
      title: session.name,
      parent: this,
      config: session.graphCfg,
      noPeriod: true,
      shared: sharedWidgetConfigs(),
    })
      .onOk(graphCfg => this.updateSession({ ...session, graphCfg }));
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <slot name="graph" />

    <!-- <q-scroll-area> -->
    <q-expansion-item
      v-for="session in sessions"
      :key="session.id"
      :label="`Session ${session.name}`"
      :default-opened="initialSession && initialSession.id === session.id"
      group="modal"
      icon="help"
    >
      <q-list>
        <q-item>
          <q-item-section class="col-auto">
            <q-btn flat icon="mdi-chart-line" @click="showSession(session)">
              <q-tooltip>Show graph</q-tooltip>
            </q-btn>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn flat icon="edit" @click="editSession(session)">
              <q-tooltip>Select graph data</q-tooltip>
            </q-btn>
          </q-item-section>
          <q-space />
          <q-item-section class="col-auto">
            <q-btn flat icon="mdi-content-copy" @click="duplicateSession(session)">
              <q-tooltip>Duplicate session</q-tooltip>
            </q-btn>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-toggle
              :value="!session.hidden"
              checked-icon="visibility"
              unchecked-icon="visibility_off"
              @input="v => { session.hidden = !v; updateSession(session); }"
            >
              <q-tooltip>Show/hide session in widget</q-tooltip>
            </q-toggle>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn flat icon="delete" @click="deleteSession(session)">
              <q-tooltip>Delete session</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item>
          <q-item-section>
            <InputField
              :value="session.name"
              title="Session name"
              label="Session name"
              @input="v => { session.name = v; updateSession(session); }"
            />
          </q-item-section>
          <q-item-section>
            <LabeledField label="Duration">
              <span v-if="session.start && session.end">{{ sessionDuration(session) }}</span>
              <span v-else-if="session.start">In progress</span>
              <span v-else>Not yet started</span>
            </LabeledField>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <DatetimeField
              :value="session.start"
              title="Start"
              label="Start"
              reset-icon="mdi-clock-start"
              clear-label="<click to start>"
              @input="v => startSession(session, v)"
            />
          </q-item-section>

          <q-item-section>
            <DatetimeField
              :value="session.end"
              title="End"
              label="End"
              reset-icon="mdi-clock-end"
              clear-label="<click to end>"
              @input="v => endSession(session, v)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <q-item>
      <q-item-section />
      <q-item-section side>
        <q-btn fab outline icon="add" @click="createSession">
          <q-tooltip>Add Session</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
    <!-- </q-scroll-area> -->
  </q-card>
</template>

<style scoped>
.scroll-parent {
  height: 300px;
  max-height: 30vh;
}
</style>
