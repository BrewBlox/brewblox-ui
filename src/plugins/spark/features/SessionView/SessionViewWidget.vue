<script lang="ts">
import shortid from 'shortid';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { shortDateString } from '@/helpers/functional';

import SessionViewBasic from './SessionViewBasic.vue';
import SessionViewFull from './SessionViewFull.vue';
import { Session, SessionViewConfig } from './types';


@Component({
  components: {
    Basic: SessionViewBasic,
    Full: SessionViewFull,
  },
})
export default class SessionViewWidget extends WidgetBase {
  graphSessionId: string | null = null;
  sessionFilter = '';

  get widgetConfig(): SessionViewConfig {
    return this.widget.config;
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

  get graphSession(): Session | null {
    return this.graphSessionId
      ? this.widgetConfig.sessions.find(session => session.id === this.graphSessionId) || null
      : null;
  }

  periodString(session: Session): string {
    if (!session.start && !session.end) {
      return '<not yet started>';
    }
    if (!session.end) {
      return `${shortDateString(session.start)} to <now>`;
    }
    return `${shortDateString(session.start)} to ${shortDateString(session.end)}`;
  }

  showSessionDialog(activeSession: Session | null = null): void {
    this.showDialog({
      getProps: () => ({ activeSession }),
    });
  }

  showSessionGraph(id: string): void {
    this.graphSessionId = id;
  }

  createSession(): void {
    createDialog({
      title: 'Create session',
      dark: true,
      ok: 'Create',
      cancel: 'Cancel',
      prompt: {
        model: '',
        type: 'text',
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
            colors: {},
          },
          notes: '',
        };
        this.saveConfig({
          ...this.widgetConfig,
          sessions: [...this.widgetConfig.sessions, session],
        });
        this.showSessionDialog(session);
      });
  }
}
</script>

<template>
  <component
    :is="mode"
    :crud="crud"
    :class="cardClass"
    @create="createSession"
    @graph="showSessionGraph"
  >
    <template #toolbar>
      <WidgetDialogToolbar v-if="inDialog" :crud="crud" :mode.sync="mode" />
      <WidgetToolbar v-else :crud="crud" :mode.sync="mode">
        <q-item-section side>
          <q-btn-dropdown flat split icon="settings" @click="showSessionDialog">
            <q-list dark bordered>
              <WidgetActions :crud="crud" />
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </WidgetToolbar>
    </template>
    <template #graph>
      <BlockGraph
        v-if="graphSession"
        :id="`${widget.id}::${graphSession.id}`"
        :value="true"
        :config="graphSession.graphCfg"
        no-duration
        @update:config="v => { graphSession.graphCfg = v; saveConfig(widgetConfig); }"
        @input="v => {if(!v) graphSessionId = null;}"
      />
    </template>
  </component>
</template>
