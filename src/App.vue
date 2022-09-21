<script lang="ts">
import { database } from '@/database';
import { eventbus } from '@/eventbus';
import { startup } from '@/startup';
import { defineComponent } from 'vue';

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
    onAppSetup();
    return {};
  },
});
</script>

<template>
  <router-view />
  <WatcherContainer />
</template>
