<script lang="ts">
import { useContext, useWidget } from '@/composables';
import { useDashboardStore } from '@/store/dashboards';
import { createDialog } from '@/utils/dialog';
import { makeTypeFilter } from '@/utils/functional';
import { saveFile } from '@/utils/import-export';
import { notify } from '@/utils/notify';
import { dateString } from '@/utils/quantity';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { computed, defineComponent } from 'vue';
import { useHistoryStore } from '../store';
import { LoggedSession, SessionGraphNote, SessionNote } from '../types';
import { selectGraphPrecision } from '../utils';
import SessionCreateDialog from './SessionCreateDialog.vue';
import SessionLoadDialog from './SessionLoadDialog.vue';
import SessionLogBasic from './SessionLogBasic.vue';
import SessionLogFull from './SessionLogFull.vue';
import { SessionLogWidget } from './types';

const graphFilter = makeTypeFilter<SessionGraphNote>('Graph');

export default defineComponent({
  name: 'SessionLogWidget',
  components: {
    SessionCreateDialog,
    SessionLoadDialog,
    Basic: SessionLogBasic,
    Full: SessionLogFull,
  },
  setup() {
    const historyStore = useHistoryStore();
    const dashboardStore = useDashboardStore();
    const { context } = useContext.setup();
    const { widget, config, patchConfig } = useWidget.setup<SessionLogWidget>();

    const sessions = computed<LoggedSession[]>(() => historyStore.sessions);

    const session = computed<LoggedSession | null>(() =>
      historyStore.sessionById(config.value.currentSession),
    );

    function saveSession(sess: LoggedSession | null = session.value): void {
      if (sess != null) {
        historyStore.saveSession(sess);
      }
    }

    const notes = computed<SessionNote[]>(() => session.value?.notes ?? []);

    function startAddSession(): void {
      createDialog({
        component: SessionCreateDialog,
        componentProps: {
          title: 'New session',
          preselected: config.value.currentSession,
          widgetTags: [
            `on: ${dashboardStore.dashboardTitle(widget.value.dashboard)}`,
          ],
        },
      }).onOk((session: LoggedSession) => {
        patchConfig({ currentSession: session.id });
      });
    }

    function startLoadSession(): void {
      createDialog({
        component: SessionLoadDialog,
        componentProps: {
          title: 'Open existing session',
        },
      }).onOk((session: LoggedSession) => {
        patchConfig({ currentSession: session?.id ?? null });
      });
    }

    function exitSession(): void {
      patchConfig({ currentSession: null });
    }

    function* sessionLines(): Generator<string, void, unknown> {
      yield '';
      for (const note of notes.value) {
        yield note.title;
        yield '-'.repeat(note.title.length);
        if (note.type === 'Text') {
          yield note.value;
        }
        if (note.type === 'Graph') {
          yield `${dateString(note.start)} - ${dateString(note.end)}`;
          yield '';
          for (const annotation of note.config.layout?.annotations ?? []) {
            yield `${annotation.x} :: ${annotation.text}`;
            yield '';
          }
        }
        yield '';
      }
    }

    function exportSession(): void {
      if (session.value === null) {
        return;
      }
      const name = `${widget.value.title} ${session.value.title} ${dateString(
        session.value.date,
      )}`;
      const lines: string[] = [name, ...sessionLines()];
      saveFile(
        DOMPurify.sanitize(marked.parse(lines.join('\n'))),
        `${name}.html`,
        true,
      );
    }

    async function exportSessionGraphs(): Promise<void> {
      if (session.value === null) {
        return;
      }
      const sessionDate = dateString(session.value.date);
      const validNotes = notes.value
        .filter(graphFilter)
        .filter((v) => v.config.fields.length);

      if (!validNotes.length) {
        notify.warn('No valid graph notes found');
        return;
      }

      const precision = await selectGraphPrecision();
      if (!precision) {
        return;
      }

      notify.info('Generating CSV... This may take a few seconds.');

      for (const note of validNotes) {
        await historyStore.downloadGraphCsv(
          note.config,
          precision,
          `${session.value.title}__${note.title}__${sessionDate}`,
        );
      }
    }

    function clearNotes(): void {
      notes.value.forEach((note) => {
        if (note.type === 'Text') {
          note.value = '';
        } else if (note.type === 'Graph') {
          note.start = null;
          note.end = null;
        }
      });
      saveSession();
    }

    function startRemoveSession(): void {
      if (session.value === null) {
        return;
      }
      const activeSession = session.value;
      createDialog({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Remove session',
          message: `Do you want remove session '${activeSession.title}'?`,
        },
      }).onOk(() => {
        const active = sessions.value.find((s) => s.id !== activeSession?.id);
        patchConfig({
          currentSession: active?.id ?? null,
        });
        historyStore.removeSession(activeSession);
      });
    }

    return {
      context,
      session,
      startLoadSession,
      startAddSession,
      exitSession,
      exportSession,
      exportSessionGraphs,
      clearNotes,
      startRemoveSession,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle>
        <template #actions>
          <ActionItem
            icon="mdi-file-plus"
            label="New session"
            @click="startAddSession"
          />
          <ActionItem
            icon="mdi-file-document-edit"
            label="Open session"
            @click="startLoadSession"
          />
          <ActionItem
            :disabled="!session"
            icon="mdi-file-remove"
            label="Close session"
            @click="exitSession"
          />
          <ActionItem
            :disabled="!session"
            icon="mdi-file-export"
            label="Export session"
            @click="exportSession"
          />
          <ActionItem
            :disabled="!session"
            icon="mdi-file-export"
            label="Export graphs to CSV"
            @click="exportSessionGraphs"
          />
          <ActionItem
            icon="mdi-file-restore"
            label="Clear session fields"
            @click="clearNotes"
          />
          <ActionItem
            icon="delete"
            label="Remove session"
            @click="startRemoveSession"
          />
        </template>
      </WidgetToolbar>
    </template>
    <component :is="context.mode">
      <template
        v-if="session === null"
        #warnings
      >
        <div class="column">
          <div class="text-italic text-h6 q-pa-md darkened text-center">
            Open or create a session to get started.
          </div>
          <div class="column q-pa-md items-end">
            <q-btn
              flat
              dense
              color="secondary"
              icon="mdi-file-document-edit"
              label="Open session"
              @click="startLoadSession"
            />
            <q-btn
              flat
              dense
              color="secondary"
              icon="add"
              label="New session"
              @click="startAddSession"
            />
          </div>
        </div>
      </template>
    </component>
  </Card>
</template>
