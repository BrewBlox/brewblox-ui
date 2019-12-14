<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { shortDateString } from '@/helpers/functional';
import { deepCopy } from '@/helpers/units/parseObject';

import { historyStore } from '../store';
import { SessionNote } from '../types';
import SessionCreateDialog from './SessionCreateDialog.vue';
import SessionViewBasic from './SessionViewBasic.vue';
import SessionViewFull from './SessionViewFull.vue';
import { Session, SessionViewConfig } from './types';


@Component({
  components: {
    Basic: SessionViewBasic,
    Full: SessionViewFull,
    SessionCreateDialog,
  },
})
export default class SessionViewWidget extends WidgetBase<SessionViewConfig> {
  graphSessionId: string | null = null;
  sessionFilter = '';

  @Prop({ default: null })
  readonly initialSession!: Session | null;

  get sessions(): Session[] {
    return this.config.sessions
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
      ? this.config.sessions.find(session => session.id === this.graphSessionId) || null
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

  showSessionDialog(initialSession: Session | null = null): void {
    this.showDialog({
      getProps: () => ({ initialSession }),
    });
  }

  showSessionGraph(id: string): void {
    this.graphSessionId = id;
  }

  createSession(): void {
    createDialog({
      parent: this,
      component: SessionCreateDialog,
    })
      .onOk(session => {
        this.saveConfig({
          ...this.config,
          sessions: [...this.config.sessions, session],
        });
        this.showSessionDialog(session);
      });
  }

  async migrate(): Promise<void> {
    for (const session of this.config.sessions) {
      const notes: SessionNote[] = [
        {
          id: uid(),
          title: `${session.name} graph`,
          col: 12,
          type: 'Graph',
          start: session.start,
          end: session.end,
          config: deepCopy(session.graphCfg),
        },
        {
          id: uid(),
          title: `${session.name} text`,
          col: 12,
          type: 'Text',
          value: session.notes,
        },
      ];
      await historyStore.createSession({
        id: uid(),
        title: session.name,
        date: session.start ?? new Date().getTime(),
        tags: [`Session View: ${this.widget.title}`],
        notes,
      });
    }
    this.$q.notify({
      icon: 'mdi-check-all',
      color: 'positive',
      message: `Migrated ${this.config.sessions.length} sessions`,
    });
  }
}
</script>

<template>
  <component
    :is="mode"
    :crud="crud"
    :class="cardClass"
    :initial-session="initialSession"
    @create="createSession"
    @graph="showSessionGraph"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>
    <template #warnings>
      <CardWarning>
        <template #message>
          <span>
            Session View has been replaced by the <b>Session Log</b> widget.
          </span>
        </template>
        <template #actions>
          <q-btn flat label="Migrate" @click="migrate" />
        </template>
      </CardWarning>
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
