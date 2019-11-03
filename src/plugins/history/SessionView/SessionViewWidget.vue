<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { shortDateString } from '@/helpers/functional';

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
export default class SessionViewWidget extends WidgetBase {
  graphSessionId: string | null = null;
  sessionFilter = '';

  @Prop({ default: null })
  readonly initialSession!: Session | null;

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
    :initial-session="initialSession"
    @create="createSession"
    @graph="showSessionGraph"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
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
