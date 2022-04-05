<script lang="ts">
import { computed, defineComponent } from 'vue';

import { eventbus } from '@/eventbus';
import { useHistoryStore } from '@/plugins/history/store';
import { useLoggingStore } from '@/store/logging';
import { shortDateString } from '@/utils/formatting';
import { notifyColors, notifyIcons } from '@/utils/notify';

interface LogEntryDisplay {
  message: string;
  color: string;
  icon: string;
  time: string;
}

export default defineComponent({
  name: 'LayoutFooter',
  setup() {
    const loggingStore = useLoggingStore();
    const historyStore = useHistoryStore();

    const historyConnected = computed<boolean>(
      () => historyStore.streamConnected,
    );

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

    return {
      logEntries,
      historyConnected,
      eventbusConnected,
    };
  },
});
</script>

<template>
  <q-footer class="bg-dark shadow-up-1">
    <q-bar class="bg-transparent q-px-none row justify-end">
      <div v-if="!eventbusConnected" class="text-negative">
        No eventbus
      </div>
      <div v-if="!historyConnected" class="text-negative">
        No history
      </div>
      <q-btn flat stretch icon="mdi-bell">
        <div v-if="logEntries.length">
          {{ logEntries.length }}
        </div>
        <q-menu>
          <q-list bordered>
            <q-item v-if="logEntries.length === 0">
              <q-item-section> No messages </q-item-section>
            </q-item>
            <q-item v-for="(entry, idx) in logEntries" :key="'entry-' + idx">
              <q-item-section avatar>
                <q-icon :name="entry.icon" :color="entry.color" />
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
    </q-bar>
  </q-footer>
</template>
