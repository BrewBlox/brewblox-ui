<script lang="ts">
import { defineComponent, inject, onBeforeMount } from 'vue';

import { DatabaseKey, EventbusKey, StartupKey } from './symbols';

export default defineComponent({
  setup() {
    const database = inject(DatabaseKey);
    const startup = inject(StartupKey);
    const eventbus = inject(EventbusKey);

    onBeforeMount(async () => {
      await database?.connect();
      await startup?.start();
      await eventbus?.connect();
    });
  },
});
</script>

<template>
  <router-view />
  <!-- TODO: watchers -->
</template>
