<script lang="ts">
import shortid from 'shortid';
import { Component, Prop } from 'vue-property-decorator';

import { targetBuilder, targetSplitter } from '@/components/Graph/functional';
import CrudComponent from '@/components/Widget/CrudComponent';
import { objectSorter } from '@/helpers/functional';
import { durationString } from '@/helpers/functional';
import { Session, SessionViewConfig } from '@/plugins/spark/features/SessionView/types';
import historyStore, { DisplayNames } from '@/store/history';

@Component
export default class SessionViewForm extends CrudComponent {
  graphSessionId: string | null = null;
  sessionInput: string = '';

  @Prop({ default: null })
  readonly activeSession!: Session;

  get widgetConfig(): SessionViewConfig {
    return this.widget.config;
  }

  get sessions(): Session[] {
    return this.widgetConfig.sessions
      .sort(objectSorter('name'));
  }

  get graphSession() {
    return this.graphSessionId
      ? this.sessions.find(session => session.id === this.graphSessionId)
      : null;
  }

  get graphModalOpen() {
    return this.graphSessionId !== null;
  }

  set graphModalOpen(val: boolean) {
    if (!val) {
      this.graphSessionId = null;
    }
  }

  updateSession(session: Session) {
    session.graphCfg.layout.title = session.name;
    this.saveConfig({
      ...this.widgetConfig,
      sessions: this.sessions
        .map(s => (s.id === session.id ? session : s)),
    });
  }

  startSession(session: Session, time: number) {
    if (time && session.end && time > session.end) {
      this.$q.notify({ message: 'Session start must be before its end' });
      return;
    }
    session.start = time;
    session.graphCfg.params.start = time;
    this.updateSession(session);
  }

  endSession(session: Session, time: number) {
    if (time && session.start && time < session.start) {
      this.$q.notify({ message: 'Session end must be after its start' });
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
    session.graphCfg.targets = targetBuilder(selected || [], false);
    this.updateSession(session);
  }

  updateSessionRenames(session: Session, vals: DisplayNames) {
    session.graphCfg.renames = vals;
    this.updateSession(session);
  }

  sessionDuration(session: Session) {
    if (session.start === null || session.end === null) {
      return '---';
    }
    return durationString(session.end - session.start);
  }

  created() {
    historyStore.fetchKnownKeys();
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar :title="widget.title"/>
    <BlockGraph
      v-if="graphModalOpen"
      v-model="graphModalOpen"
      :id="`SessionView::form::${graphSession.id}`"
      :config="graphSession.graphCfg"
      no-duration
      @update:config="v => { graphSession.graphCfg = v; updateSession(graphSession); }"
    />

    <q-scroll-area style="height: 75vh">
      <q-expansion-item
        v-for="session in sessions"
        :key="session.id"
        :label="`Session ${session.name}`"
        :default-opened="activeSession && activeSession.id === session.id"
        group="modal"
        icon="help"
      >
        <q-list>
          <q-item dark>
            <q-item-section>
              <q-btn flat rounded icon="mdi-chart-line" @click="graphSessionId = session.id">
                <q-tooltip>Show Graph</q-tooltip>
              </q-btn>
            </q-item-section>
            <q-item-section>
              <q-btn flat rounded icon="mdi-content-copy" @click="duplicateSession(session)">
                <q-tooltip>Duplicate Session</q-tooltip>
              </q-btn>
            </q-item-section>
            <q-item-section>
              <q-toggle
                :value="!session.hidden"
                checked-icon="visibility"
                unchecked-icon="visibility_off"
                @input="v => { session.hidden = !v; updateSession(session); }"
              >
                <q-tooltip>Show/hide Session in widget</q-tooltip>
              </q-toggle>
            </q-item-section>
            <q-item-section>
              <q-btn flat rounded icon="delete" @click="deleteSession(session)">
                <q-tooltip>Delete Session</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
          <q-separator dark/>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>Session name</q-item-label>
              <InputField
                :value="session.name"
                title="Session name"
                @input="v => { session.name = v; updateSession(session); }"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Duration</q-item-label>
              <span v-if="session.start && session.end">{{ sessionDuration(session) }}</span>
              <span v-else-if="session.start">In progress...</span>
              <span v-else>Not yet started</span>
            </q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>Start</q-item-label>
              <DatetimeField
                :value="session.start"
                title="Start"
                reset-icon="mdi-clock-start"
                clear-label="<click to start>"
                @input="v => startSession(session, v)"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label caption>End</q-item-label>
              <DatetimeField
                :value="session.end"
                title="End"
                reset-icon="mdi-clock-end"
                clear-label="<click to end>"
                @input="v => endSession(session, v)"
              />
            </q-item-section>
          </q-item>

          <q-expansion-item group="sub-modal" icon="mdi-file-tree" label="Fields">
            <div class="scroll-parent">
              <q-scroll-area>
                <MetricSelector
                  :selected="sessionSelected(session)"
                  @update:selected="v => updateSessionSelected(session, v)"
                />
              </q-scroll-area>
            </div>
          </q-expansion-item>

          <q-expansion-item group="sub-modal" icon="mdi-tag-multiple" label="Legend">
            <div class="scroll-parent">
              <q-scroll-area>
                <LabelSelector
                  :selected="sessionSelected(session)"
                  :renames="session.graphCfg.renames"
                  @update:renames="v => updateSessionRenames(session, v)"
                />
              </q-scroll-area>
            </div>
          </q-expansion-item>

          <q-expansion-item group="sub-modal" icon="edit" label="Notes">
            <textarea
              :value="session.notes"
              class="full-width"
              style="min-height: 200px;"
              @change="ev => { session.notes = ev.target.value; updateSession(session); }"
            />
          </q-expansion-item>
        </q-list>
      </q-expansion-item>
      <q-item dark>
        <q-item-section/>
        <q-item-section side>
          <q-btn fab outline icon="add" @click="$emit('create-session')">
            <q-tooltip>Add Session</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-scroll-area>
  </q-card>
</template>

<style scoped>
.scroll-parent {
  height: 300px;
  max-height: 30vh;
}
</style>
