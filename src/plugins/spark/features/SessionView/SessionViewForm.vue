<script lang="ts">
import Component from 'vue-class-component';
import shortid from 'shortid';
import { objectSorter } from '@/helpers/functional';
import FormBase from '@/components/Form/FormBase';
import { nodeBuilder, targetSplitter, targetBuilder, QuasarNode, expandedNodes } from '@/components/Graph/functional';
import { SessionViewConfig, Session } from '@/plugins/spark/features/SessionView/state';
import { durationString } from '@/helpers/functional';
import { fields } from '@/store/history/getters';
import { fetchKnownKeys } from '@/store/history/actions';

@Component({
  props: {
    activeSession: {
      default: null,
    },
  },
})
export default class SessionViewForm extends FormBase {
  graphSessionId: string | null = null;
  sessionInput: string = '';
  selectFilter: string | null = null;
  expandedKeys: string[] = [];

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

  get graphSession() {
    return this.graphSessionId
      ? this.sessions.find(session => session.id === this.graphSessionId)
      : null;
  }

  saveConfig(config: SessionViewConfig = this.widgetConfig) {
    this.$props.onChangeField({ ...config });
  }

  callAndSaveConfig(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConfig(); };
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

  nodeFilter(node: QuasarNode, filter: string): boolean {
    return node && node.value.toLowerCase().match(filter.toLowerCase());
  }

  updateExpanded(filter: string) {
    if (filter) {
      this.expandedKeys = expandedNodes(this.nodes, filter);
    }
  }

  created() {
    fetchKnownKeys(this.$store);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!$props.embedded" v-bind="$props"/>
    <BlockGraph
      v-if="graphSession"
      :value="true"
      :id="`SessionView::form::${graphSession.id}`"
      :config="graphSession.graphCfg"
      :change="v => { graphSession.graphCfg = v; updateSession(graphSession); }"
      no-duration
      @input="v => {if(!v) { graphSessionId = null; }}"
    />

    <q-scroll-area style="height: 75vh">
      <q-expansion-item
        v-for="session in sessions"
        :key="session.id"
        :label="`Session ${session.name}`"
        :default-opened="$props.activeSession && $props.activeSession.id === session.id"
        group="modal"
        icon="help"
      >
        <q-list>
          <q-item dark>
            <q-item-section>
              <q-btn flat rounded icon="mdi-chart-line" @click="graphSessionId = session.id"/>
            </q-item-section>
            <q-item-section>
              <q-btn flat rounded icon="mdi-content-copy" @click="duplicateSession(session)"/>
            </q-item-section>
            <q-item-section>
              <q-toggle
                :value="!session.hidden"
                checked-icon="visibility"
                unchecked-icon="visibility_off"
                @input="v => { session.hidden = !v; updateSession(session); }"
              />
            </q-item-section>
            <q-item-section>
              <q-btn flat rounded icon="delete" @click="deleteSession(session)"/>
            </q-item-section>
          </q-item>
          <q-separator dark/>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>Session name</q-item-label>
              <InputPopupEdit
                :field="session.name"
                :change="v => { session.name = v; updateSession(session); }"
                label="Session name"
                tag="span"
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
              <DatetimePopupEdit
                :field="session.start"
                :change="v => startSession(session, v)"
                reset-icon="mdi-clock-start"
                label="Start"
                tag="span"
                clear-label="<click to start>"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label caption>End</q-item-label>
              <DatetimePopupEdit
                :field="session.end"
                :change="v => endSession(session, v)"
                reset-icon="mdi-clock-end"
                label="End"
                tag="span"
                clear-label="<click to end>"
              />
            </q-item-section>
          </q-item>

          <q-expansion-item group="sub-modal" icon="mdi-file-tree" label="Fields">
            <q-item dark>
              <q-item-section>
                <q-input
                  :value="selectFilter"
                  placeholder="Filter keys"
                  class="q-ma-none"
                  dark
                  clearable
                  @input="v => { selectFilter = v; updateExpanded(v); }"
                >
                  <template v-slot:append>
                    <q-btn flat round icon="mdi-close-circle" @click.stop="selectFilter = ''">
                      <q-tooltip>Clear filter</q-tooltip>
                    </q-btn>
                    <q-icon name="search"/>
                  </template>
                </q-input>
              </q-item-section>
            </q-item>
            <q-item dark>
              <q-item-section class="col-auto">
                <q-btn
                  flat
                  label="Expand"
                  icon="mdi-expand-all"
                  @click="$refs.tree[0].expandAll()"
                />
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn
                  flat
                  label="Collapse"
                  icon="mdi-collapse-all"
                  @click="$refs.tree[0].collapseAll()"
                />
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn flat label="clear" icon="clear" @click="updateSessionSelected(session, [])"/>
              </q-item-section>
            </q-item>
            <q-item dark>
              <q-item-section>
                <q-tree
                  ref="tree"
                  :nodes="nodes"
                  :ticked="sessionSelected(session)"
                  :filter="selectFilter"
                  :expanded.sync="expandedKeys"
                  :filter-method="nodeFilter"
                  tick-strategy="leaf-filtered"
                  dark
                  node-key="value"
                  @update:ticked="v => updateSessionSelected(session, v)"
                />
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item group="sub-modal" icon="mdi-tag-multiple" label="Legend">
            <q-list dark>
              <q-item dark>
                <q-item-section>Metric</q-item-section>
                <q-item-section>Display as</q-item-section>
              </q-item>
              <q-separator dark inset/>
              <q-item v-for="field in sessionSelected(session)" :key="field" dark>
                <q-item-section>{{ field }}</q-item-section>
                <q-item-section>
                  <InputPopupEdit
                    :field="session.graphCfg.renames[field]"
                    :change="v => updateSessionRename(session, field, v)"
                    label="Legend"
                    clearable
                    tag="span"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="sessionSelected(session).length === 0" dark>
                <q-item-section>No metrics selected</q-item-section>
              </q-item>
            </q-list>
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
    </q-scroll-area>
  </q-card>
</template>
