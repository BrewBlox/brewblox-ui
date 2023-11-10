<script setup lang="ts">
import { authRefresh } from '@/auth';
import { database } from '@/database';
import { eventbus } from '@/eventbus';
import { startup } from '@/startup';
import { AUTH_REFRESH_INTERVAL_MS } from './const';
import { createDialogPromise } from './utils/dialog';

/**
 * Order of startup is important here.
 * We first ensure that the database is working.
 * Startup functions may register eventbus listeners.
 * If they do so after the eventbus started,
 * they will miss the first (immediate) data push.
 */
async function onAppSetup(): Promise<void> {
  if (!(await authRefresh())) {
    await createDialogPromise({ component: 'LoginDialog' });
  }
  setInterval(() => authRefresh().catch(), AUTH_REFRESH_INTERVAL_MS);

  await database.connect();
  await startup.start();
  await eventbus.connect();
}

onAppSetup();
</script>

<template>
  <router-view />
  <WatcherContainer />
</template>
