<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';

import { database } from '@/database';
import { eventbus } from '@/eventbus';
import { startup } from '@/startup';

/**
 * Order of startup is important here.
 * We first ensure that the database is working.
 * Startup functions may register eventbus listeners.
 * If they do so after the eventbus started,
 * they will miss the first (immediate) data push.
 */
async function onAppSetup(): Promise<void> {
  await database.connect();
  await startup.start();
  await eventbus.connect();
}

export default defineComponent({
  name: 'App',
  setup() {
    useMeta({
      script: process.env.DEV
        ? { devtools: { src: 'http://localhost:8098' } }
        : {},
    });
    onAppSetup();
    return {};
  },
});
</script>

<template>
  <router-view />
  <WatcherContainer />
</template>
