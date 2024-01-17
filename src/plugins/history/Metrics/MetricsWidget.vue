<script setup lang="ts">
import { ref } from 'vue';
import { useContext } from '@/composables';
import MetricsBasic from './MetricsBasic.vue';
import MetricsFull from './MetricsFull.vue';

const modes = {
  Basic: MetricsBasic,
  Full: MetricsFull,
} as const;

const { context } = useContext.setup();
const revision = ref<Date>(new Date());
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle>
        <template #actions>
          <ActionItem
            v-if="context.mode === 'Basic'"
            icon="refresh"
            label="Refresh"
            @click="revision = new Date()"
          />
        </template>
      </WidgetToolbar>
    </template>

    <component
      :is="modes[context.mode]"
      :revision="revision"
    />
  </Card>
</template>
