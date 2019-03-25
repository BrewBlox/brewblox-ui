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

  saveConfig(config: SessionViewConfig = this.widgetConfig) {
    this.$props.onChangeConfig(this.widgetId, { ...config });
  }

  callAndSaveConfig(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConfig(); };
  }

  createSession() {
    this.$q.dialog({
      title: 'Create session',
      ok: 'Create',
      cancel: 'Cancel',
      prompt: {
        model: '',
      },
    }).then((name) => {
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

    <WidgetToolbar :title="widgetId" :subtitle="displayName">
      <q-item-section side>
        <q-btn flat dense round icon="settings" @click="openModal()"/>
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
          <q-btn outline icon="add" label="New" class="text-white" @click="createSession"/>
        </q-item-section>
      </q-item>
      <q-item dark v-for="session in sessions" :key="session.id">
        <q-item-section>
          {{ session.name }}
          <q-item-label caption>{{ periodString(session) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded icon="settings" @click="openModal(session)"/>
        </q-item-section>
        <q-item-section side>
          <BlockGraph
            :id="`${widgetId}::${session.id}`"
            :config="session.graphCfg"
            :change="callAndSaveConfig(v => session.graphCfg = v)"
            button-size="lg"
            no-duration
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
