<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { component } from '@/plugins/spark/features/ProcessView/calculateFlows';
import shortid from 'shortid';
import { objectSorter } from '@/helpers/functional';
import FormBase from '@/components/Widget/FormBase';
import { nodeBuilder, targetSplitter, targetBuilder } from '@/components/Graph/functional';
import { SessionViewConfig, Session } from '@/plugins/spark/features/SessionView/state';
import { durationString } from '@/helpers/functional';
import { fields } from '@/store/history/getters';
import { fetchKnownKeys } from '@/store/history/actions';

@Component({
  props: {
    activeSession: {
      default: null,
    },
    displayToolbar: {
      type: Boolean,
      default: true,
    },
  },
})
export default class SessionViewForm extends FormBase {
  sessionInput: string = '';
  selectFilter: string | null = null;

  get widgetConfig(): SessionViewConfig {
    return this.$props.field;
  }

  get sessions(): Session[] {
    return this.widgetConfig.sessions
      .sort(objectSorter('name'));
  }

  get nodes() {
    return nodeBuilder(fields(this.$store));
  }

  saveConfig(config: SessionViewConfig = this.widgetConfig) {
    this.$props.change(config);
  }

  callAndSaveConfig(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConfig(); };
  }

  updateSession(session: Session) {
    this.saveConfig({
      ...this.widgetConfig,
      sessions: this.sessions
        .map(s => (s.id === session.id ? session : s)),
    });
  }

  startSession(session: Session, time: number) {
    if (time && session.end && time > session.end) {
      this.$q.notify('Session start must be before its end');
      return;
    }
    session.start = time;
    session.graphCfg.params.start = time;
    this.updateSession(session);
  }

  endSession(session: Session, time: number) {
    if (time && session.start && time < session.start) {
      this.$q.notify('Session end must be after its start');
      return;
    }
    session.end = time;
    session.graphCfg.params.end = time;
    this.updateSession(session);
  }

  deleteSession(session: Session) {
    this.saveConfig({
      ...this.widgetConfig,
      sessions: this.sessions
        .filter(s => s.id !== session.id),
    });
  }

  duplicateSession(session: Session) {
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

    const newSession = { ...session, name: copyName(idx), id: shortid.generate() };
    this.saveConfig({
      ...this.widgetConfig,
      sessions: [...this.sessions, newSession],
    });
  }

  sessionSelected(session: Session) {
    return targetSplitter(session.graphCfg.targets);
  }

  updateSessionSelected(session: Session, selected: string[]) {
    session.graphCfg.targets = targetBuilder(selected || []);
    this.updateSession(session);
  }

  updateSessionRename(session: Session, field: string, val: string) {
    session.graphCfg.renames[field] = val;
    this.updateSession(session);
  }

  sessionDuration(session: Session) {
    if (session.start === null || session.end === null) {
      return '---';
    }
    return durationString(session.end - session.start);
  }

  created() {
    fetchKnownKeys(this.$store);
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar v-if="$props.displayToolbar" color="primary" class="unpadded">
      <q-toolbar-title>Session View settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>

    <q-collapsible
      v-for="session in sessions"
      :key="session.id"
      :label="`Session ${session.name}`"
      :opened="$props.activeSession && $props.activeSession.id === session.id"
      group="modal"
      class="col-12"
      icon="help"
    >
      <q-list>
        <q-item>
          <q-item-main>
            <BlockGraph
              :id="`SessionView::form::${session.id}`"
              :config="session.graphCfg"
              :change="v => { session.graphCfg = v; updateSession(session); }"
              label="Show Graph"
              no-duration
            />
          </q-item-main>
          <q-btn flat rounded icon="mdi-content-copy" @click="duplicateSession(session)"/>
          <q-toggle
            :value="!session.hidden"
            checked-icon="visibility"
            unchecked-icon="visibility_off"
            @input="v => { session.hidden = !v; updateSession(session); }"
          />
          <q-btn flat rounded icon="delete" @click="deleteSession(session)"/>
        </q-item>
        <q-item-separator/>
        <q-item>
          <q-item-main>Session name</q-item-main>
          <InputPopupEdit
            :field="session.name"
            :change="v => { session.name = v; updateSession(session); }"
            label="Session name"
            display="span"
          />
        </q-item>
        <q-item>
          <q-item-main>Start</q-item-main>
          <DatetimePopupEdit
            :field="session.start"
            :change="v => startSession(session, v)"
            reset-icon="mdi-clock-start"
            label="Start"
            display="span"
          />
        </q-item>
        <q-item>
          <q-item-main>End</q-item-main>
          <DatetimePopupEdit
            :field="session.end"
            :change="v => endSession(session, v)"
            reset-icon="mdi-clock-end"
            label="End"
            display="span"
          />
        </q-item>
        <q-item>
          <q-item-main>Duration</q-item-main>
          <span v-if="session.start && session.end">{{ sessionDuration(session) }}</span>
          <span v-else-if="session.start">In progress...</span>
          <span v-else>Not yet started</span>
        </q-item>

        <q-collapsible group="sub-modal" class="col-12" icon="mdi-file-tree" label="Fields">
          <div>
            <div class="q-mb-sm row no-wrap items-center">
              <q-input v-model="selectFilter" stack-label="Filter" class="q-ma-none" clearable/>
            </div>
            <q-tree
              :nodes="nodes"
              :ticked="sessionSelected(session)"
              :filter="selectFilter"
              tick-strategy="leaf-filtered"
              dark
              node-key="value"
              @update:ticked="v => updateSessionSelected(session, v)"
            />
          </div>
        </q-collapsible>

        <q-collapsible group="sub-modal" class="col-12" icon="mdi-tag-multiple" label="Legend">
          <q-list no-border separator>
            <q-item>
              <q-item-main>Metric</q-item-main>Display as
            </q-item>
            <q-item v-for="field in sessionSelected(session)" :key="field">
              <q-item-main>{{ field }}</q-item-main>
              <InputPopupEdit
                :field="session.graphCfg.renames[field]"
                :change="v => updateSessionRename(session, field, v)"
                label="Legend"
                clearable
                display="span"
              />
            </q-item>
            <q-item v-if="sessionSelected(session).length === 0">
              <q-item-main class="darkened">No metrics selected</q-item-main>
            </q-item>
          </q-list>
        </q-collapsible>
        <q-collapsible group="sub-modal" class="col-12" icon="edit" label="Notes">
          <textarea
            :value="session.notes"
            class="full-width"
            style="min-height: 200px;"
            @change="ev => { session.notes = ev.target.value; updateSession(session); }"
          />
        </q-collapsible>
      </q-list>
    </q-collapsible>
  </div>
</template>
