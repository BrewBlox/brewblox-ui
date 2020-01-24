<script lang="ts">
import { Component, Emit } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { shortDateString } from '@/helpers/functional';

import { Session, SessionViewConfig } from './types';


@Component
export default class SessionViewBasic extends CrudComponent<SessionViewConfig> {
  sessionFilter = '';

  @Emit('create')
  createSession(): void { }

  @Emit('graph')
  showSession(session: Session): string {
    return session.id;
  }

  get sessions(): Session[] {
    return this.widget.config.sessions
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
      widgetProps: { initialSession },
    });
  }
}
</script>

<template>
  <div>
    <slot name="warnings" />
    <slot name="graph" />

    <q-card-section>
      <q-item>
        <q-item-section>
          <q-input v-model="sessionFilter" placeholder="Search Session" clearable>
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded icon="add" label="New" class="text-white" @click="createSession" />
        </q-item-section>
      </q-item>
      <q-item v-for="session in sessions" :key="session.id">
        <q-item-section>
          {{ session.name }}
          <q-item-label caption>
            {{ periodString(session) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded icon="settings" @click="showSessionDialog(session)" />
        </q-item-section>
        <q-item-section side>
          <q-btn flat rounded icon="mdi-chart-line" @click="showSession(session)" />
        </q-item-section>
      </q-item>
    </q-card-section>
  </div>
</template>
