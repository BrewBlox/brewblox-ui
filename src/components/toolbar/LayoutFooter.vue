<script setup lang="ts">
import { computed } from 'vue';
import { authEnabled } from '@/auth';
import { eventbus } from '@/eventbus';
import { useHistoryStore } from '@/plugins/history/store';
import { useLoggingStore } from '@/store/logging';
import { createDialog } from '@/utils/dialog';
import { notifyColors, notifyIcons } from '@/utils/notify';
import { shortDateString } from '@/utils/quantity';

interface LogEntryDisplay {
  message: string;
  color: string;
  icon: string;
  time: string;
}

const loggingStore = useLoggingStore();
const historyStore = useHistoryStore();

const historyConnected = computed<boolean>(() => historyStore.streamConnected);

const eventbusConnected = computed<boolean>(() => eventbus.connected.value);

const logEntries = computed<LogEntryDisplay[]>(() =>
  loggingStore.entries
    .map((e) => ({
      message: e.message,
      color: notifyColors[e.level],
      icon: notifyIcons[e.level],
      time: shortDateString(e.time),
    }))
    .reverse(),
);

function showAuthExplanation(): void {
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      html: true,
      title: 'Authentication',
      message: `
      <p>
        To enable password authentication, run:
      </p>
      <b/>
      <p class="monospace">
        brewblox-ctl auth init
      </p>`,
    },
  });
}
</script>

<template>
  <q-footer class="bg-dark">
    <q-bar class="bg-transparent q-px-none row justify-end">
      <div
        v-if="!eventbusConnected"
        class="text-negative"
      >
        No eventbus
      </div>
      <div
        v-if="!historyConnected"
        class="text-negative"
      >
        No history
      </div>
      <q-btn
        flat
        stretch
        icon="mdi-bell"
      >
        <div v-if="logEntries.length">
          {{ logEntries.length }}
        </div>
        <q-menu>
          <q-list bordered>
            <q-item v-if="logEntries.length === 0">
              <q-item-section> No messages </q-item-section>
            </q-item>
            <q-item
              v-for="(entry, idx) in logEntries"
              :key="'entry-' + idx"
            >
              <q-item-section avatar>
                <q-icon
                  :name="entry.icon"
                  :color="entry.color"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>
                  {{ entry.time }}
                </q-item-label>
                <span v-html="entry.message" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        v-if="authEnabled"
        flat
        stretch
        icon="mdi-account"
        @click="createDialog({ component: 'LoginDialog' })"
      >
        <q-tooltip>Login</q-tooltip>
      </q-btn>
      <q-btn
        v-else
        flat
        stretch
        icon="mdi-account"
        @click="showAuthExplanation"
      >
        <q-tooltip>Authentication</q-tooltip>
      </q-btn>
    </q-bar>
  </q-footer>
</template>
