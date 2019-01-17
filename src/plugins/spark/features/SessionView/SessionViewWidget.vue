<script lang="ts">
import Vue from 'vue';
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import shortid from 'shortid';
import { SessionViewConfig, Session } from './state';
import { durationString } from '@/helpers/functional';


@Component
export default class SessionViewWidget extends WidgetBase {
  modalOpen: boolean = false;
  modalSession: Session | null = null;
  sessionInput: string = '';

  get widgetConfig(): SessionViewConfig {
    return this.$props.config;
  }

  get sessions(): Session[] {
    return this.widgetConfig.sessions
      .filter(session => !session.hidden)
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

  openModal(session: Session | null = null) {
    this.modalSession = session;
    this.modalOpen = true;
  }

  saveConfig(config: SessionViewConfig = this.widgetConfig) {
    console.log('change', config);
    this.$props.onConfigChange(this.widgetId, { ...config });
  }

  callAndSaveConfig(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConfig(); };
  }

  createSession() {
    const session = {
      id: shortid.generate(),
      name: this.sessionInput,
      hidden: false,
      start: null,
      end: null,
      graphCfg: {
        layout: {},
        params: {},
        targets: [],
        renames: {},
      },
      notes: '',
    };
    this.saveConfig({
      ...this.widgetConfig,
      sessions: [...this.widgetConfig.sessions, session],
    });
    this.sessionInput = '';
    this.modalSession = session;
    this.modalOpen = true;
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <SessionViewForm
        v-if="modalOpen"
        :field="widgetConfig"
        :change="saveConfig"
        :active-session="modalSession"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        class="ellipsis"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat dense round icon="settings" @click="openModal()"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-item>
          <q-item-main>
            <q-input v-model="sessionInput" placeholder="New Session" clearable/>
          </q-item-main>
          <q-item-side right>
            <q-btn :disable="!sessionInput" flat rounded label="Create" @click="createSession"/>
          </q-item-side>
        </q-item>
        <q-list dark no-border separator>
          <q-item v-for="session in sessions" :key="session.id">
            <q-item-main>
              {{ session.name }}
              <span
                class="row darkened"
              >{{ session.start | shortDateString }} to {{ session.end | shortDateString }}</span>
            </q-item-main>
            <q-item-side right>
              <q-btn flat rounded icon="settings" @click="openModal(session)"/>
              <BlockGraph
                :id="`${widgetId}::${session.id}`"
                :config="session.graphCfg"
                :change="callAndSaveConfig(v => session.graphCfg = v)"
                button-size="lg"
                no-duration
              />
            </q-item-side>
          </q-item>
        </q-list>
      </div>
    </q-card-main>
  </q-card>
</template>
