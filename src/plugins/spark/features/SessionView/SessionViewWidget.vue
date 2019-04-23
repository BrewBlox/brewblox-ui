<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import shortid from 'shortid';
import { SessionViewConfig, Session } from './state';
import { shortDateString } from '@/helpers/functional';


@Component
export default class SessionViewWidget extends WidgetBase {
  modalOpen: boolean = false;
  modalSession: Session | null = null;
  graphSessionId: string | null = null;
  sessionFilter: string = '';

  get widgetConfig(): SessionViewConfig {
    return this.$props.config;
  }

  get sessions(): Session[] {
    return this.widgetConfig.sessions
      .filter(session => !session.hidden)
      .filter(session => session.name.toLowerCase().match(this.sessionFilter.toLowerCase()))
      .sort((left: Session, right: Session) => {
        // Sessions are sorted on their end date
        // In order:
        // - running (start, no end)
        // - undefined (no start, no end)
        // - completed (start, end), most recent first
        if (left.end === null && right.end !== null) {
          return -1;
        }
        if (right.end === null && left.end !== null) {
          return 1;
        }
        return Number(right.end) - Number(left.end);
      });
  }

  get graphSession() {
    return this.graphSessionId
      ? this.widgetConfig.sessions.find(session => session.id === this.graphSessionId)
      : null;
  }

  periodString(session: Session) {
    if (!session.start && !session.end) {
      return '<not yet started>';
    }
    if (!session.end) {
      return `${shortDateString(session.start)} to <now>`;
    }
    return `${shortDateString(session.start)} to ${shortDateString(session.end)}`;
  }


  openModal(session: Session | null = null) {
    this.modalSession = session;
    this.modalOpen = true;
  }

  callAndSaveConfig(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConfig(this.widgetConfig); };
  }

  createSession() {
    this.$q.dialog({
      title: 'Create session',
      ok: 'Create',
      cancel: 'Cancel',
      prompt: {
        model: '',
      },
    })
      .onOk((name) => {
        const session = {
          name,
          id: shortid.generate(),
          hidden: false,
          start: null,
          end: null,
          graphCfg: {
            layout: { title: name },
            params: {},
            targets: [],
            renames: {},
            axes: {},
          },
          notes: '',
        };
        this.saveConfig({
          ...this.widgetConfig,
          sessions: [...this.widgetConfig.sessions, session],
        });
        this.modalSession = session;
        this.modalOpen = true;
      });
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <SessionViewForm
        v-if="modalOpen"
        v-bind="$props"
        :field="widgetConfig"
        :on-change-field="saveConfig"
        :active-session="modalSession"
      />
    </q-dialog>
    <BlockGraph
      v-if="graphSession"
      :value="true"
      :id="`${widgetId}::${graphSession.id}`"
      :config="graphSession.graphCfg"
      :change="callAndSaveConfig(v => graphSession.graphCfg = v)"
      no-duration
      @input="v => {if(!v) { graphSessionId = null; }}"
    />

    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="openModal()">
          <q-list dark bordered>
            <ActionItem
              v-if="$props.onCopy"
              icon="file_copy"
              label="Copy widget"
              @click="$props.onCopy(widgetId)"
            />
            <ActionItem
              v-if="$props.onMove"
              icon="exit_to_app"
              label="Move widget"
              @click="$props.onMove(widgetId)"
            />
            <ActionItem
              v-if="$props.onDelete"
              icon="delete"
              label="Delete widget"
              @click="$props.onDelete(widgetId)"
            />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="sessionFilter" placeholder="Search Session" clearable dark>
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded icon="add" label="New" class="text-white" @click="createSession"/>
        </q-item-section>
      </q-item>
      <q-item v-for="session in sessions" :key="session.id" dark>
        <q-item-section>
          {{ session.name }}
          <q-item-label caption>{{ periodString(session) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded icon="settings" @click="openModal(session)"/>
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded icon="mdi-chart-line" @click="graphSessionId = session.id"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
