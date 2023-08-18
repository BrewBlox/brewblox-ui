<script setup lang="ts">
import { authRefresh } from '@/auth';
import { database } from '@/database';
import { eventbus } from '@/eventbus';
import { startup } from '@/startup';
import { createDialog } from './utils/dialog';

/**
 * Order of startup is important here.
 * We first ensure that the database is working.
 * Startup functions may register eventbus listeners.
 * If they do so after the eventbus started,
 * they will miss the first (immediate) data push.
 */
async function onAppSetup(): Promise<void> {
  if (!(await authRefresh())) {
    createDialog({ component: 'LoginDialog' });
  }
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
