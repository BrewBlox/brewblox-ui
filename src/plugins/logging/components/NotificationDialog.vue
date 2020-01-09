<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { shortDateString } from '@/helpers/functional';

import { loggingStore } from '../store';
import { LogEntry } from '../types';


@Component
export default class NotificationDialog extends DialogBase {
  shortDateString = shortDateString;

  get logEntries(): LogEntry[] {
    return loggingStore.entries;
  }

}
</script>

<template>
  <q-dialog ref="dialog" :maximized="$dense" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="widget-modal">
      <DialogToolbar>
        <q-icon name="mdi-bell" class="q-mx-sm" />
        Notifications
      </DialogToolbar>

      <div class="dialog-content scroll">
        <q-card-section>
          <q-list>
            <q-item v-if="logEntries.length === 0">
              <q-item-section class="text-center">
                No log messages yet
              </q-item-section>
            </q-item>
            <q-item v-for="(entry, idx) in logEntries" :key="'entry-'+idx">
              <q-item-section side>
                {{ entry.level }}
              </q-item-section>
              <q-item-section>
                <q-item-label caption>
                  {{ shortDateString(entry.time) }}
                </q-item-label>
                {{ entry.message }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
</template>
