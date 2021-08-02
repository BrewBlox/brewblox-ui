<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { LogEntry, loggingStore } from '@/store/logging';
import { shortDateString } from '@/utils/formatting';
import { notifyColors, notifyIcons } from '@/utils/notify';

export default defineComponent({
  name: 'LayoutFooter',
  setup() {
    const logButtonColor = ref<string>('');

    const logEntries = computed<LogEntry[]>(
      () => loggingStore.entries.slice().reverse(),
    );

    function color(entry: LogEntry): string {
      return notifyColors[entry.level];
    }

    function icon(entry: LogEntry): string {
      return notifyIcons[entry.level];
    }

    function time(entry: LogEntry): string {
      return shortDateString(entry.time);
    }

    return {
      logButtonColor,
      logEntries,
      color,
      icon,
      time,
    };
  },
});
</script>

<template>
  <q-footer class="bg-dark shadow-up-1">
    <q-bar class="bg-transparent q-px-none row justify-end">
      <q-btn
        flat
        stretch
        icon="mdi-bell"
        :color="logButtonColor"
        @click="logButtonColor = ''"
      >
        <q-menu>
          <q-list bordered>
            <q-item v-if="logEntries.length === 0">
              <q-item-section>
                No messages
              </q-item-section>
            </q-item>
            <q-item v-for="(entry, idx) in logEntries" :key="'entry-'+idx">
              <q-item-section avatar>
                <q-icon :name="icon(entry)" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>
                  {{ time(entry) }}
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
