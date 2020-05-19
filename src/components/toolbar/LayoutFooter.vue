<script lang="ts">
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { shortDateString } from '@/helpers/functional';
import { notifyColors, notifyIcons } from '@/helpers/notify';
import { automationStore } from '@/plugins/automation/store';
import { LogEntry, loggingStore } from '@/store/logging';

@Component
export default class LayoutFooter extends Vue {
  logButtonColor = '';

  @Watch('logEntries')
  onEntriesChanged(newV: LogEntry[], oldV: LogEntry[]): void {
    if (newV.length > oldV.length) {
      this.logButtonColor = 'primary';
    }
  }

  get automationAvailable(): boolean {
    return automationStore.lastEvent !== null;
  }

  get numTasks(): number {
    return automationStore.tasks.length;
  }

  get logEntries(): LogEntry[] {
    return loggingStore.entries.slice().reverse();
  }

  color(entry: LogEntry): string {
    return notifyColors[entry.level];
  }

  icon(entry: LogEntry): string {
    return notifyIcons[entry.level];
  }

  time(entry: LogEntry): string {
    return shortDateString(entry.time);
  }
}
</script>

<template>
  <q-footer class="bg-dark shadow-up-1">
    <q-bar class="bg-transparent q-px-none row justify-end">
      <q-btn
        v-if="automationAvailable"
        flat
        stretch
        icon="mdi-check-all"
      >
        <q-tooltip>Automation tasks</q-tooltip>
        <AutomationTaskMenu />
        <q-badge class="q-ml-sm">
          {{ numTasks }}
        </q-badge>
      </q-btn>
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
                {{ entry.message }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-bar>
  </q-footer>
</template>
