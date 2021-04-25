<script lang="ts">
import { defineComponent, inject, onBeforeMount } from 'vue';

import { systemStore } from './store/system';
import { DatabaseKey, EventbusKey, StartupKey } from './symbols';

export default defineComponent({
  setup() {
    const database = inject(DatabaseKey)!;
    const startup = inject(StartupKey)!;
    const eventbus = inject(EventbusKey)!;

    onBeforeMount(async () => {
      await database.connect();
      systemStore.setConnected();
      await startup.start();
      systemStore.setStarted();
      await eventbus.connect();
    });
  },
});
</script>

<template>
  <router-view />
  <Watchers />
</template>
