<script setup lang="ts">
import { login } from '@/auth';
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
  await login({ username: 'username', password: 'password' });
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
