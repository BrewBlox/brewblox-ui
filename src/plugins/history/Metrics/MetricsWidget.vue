<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useContext } from '@/composables';

import MetricsBasic from './MetricsBasic.vue';
import MetricsFull from './MetricsFull.vue';

export default defineComponent({
  name: 'MetricsWidget',
  components: {
    Basic: MetricsBasic,
    Full: MetricsFull,
  },
  setup() {
    const { context } = useContext.setup();
    const revision = ref<Date>(new Date());

    return {
      context,
      revision,
    };
  },
});
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

    <component :is="context.mode" :revision="revision" />
  </Card>
</template>
