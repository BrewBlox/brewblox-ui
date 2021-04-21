<script lang="ts">
import { defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';

export default defineComponent({
  name: 'GenericBlockWidget',
  setup() {
    const {
      widget,
      featureTitle,
      block,
      sparkModule,
    } = useBlockWidget.setup();

    function refreshBlock(): void {
      sparkModule.fetchBlock(block.value);
    }

    return {
      widget,
      featureTitle,
      block,
      refreshBlock,
    };
  },
});
</script>

<template>
  <q-card class="column">
    <q-card-title class="title-bar">
      <div class="ellipsis">
        {{ widget.title }}
      </div>
      <template #right>
        <span class="vertical-middle on-left">{{ featureTitle }}</span>
        <q-btn flat round dense icon="refresh" @click="refreshBlock" />
      </template>
    </q-card-title>
    <q-card-separator />

    <q-card-main>
      <q-item>
        <pre>{{ block.data }}</pre>
      </q-item>
    </q-card-main>
  </q-card>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
