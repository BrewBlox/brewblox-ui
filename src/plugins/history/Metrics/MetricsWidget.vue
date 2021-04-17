<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useContext, useWidget } from '@/composables';

import MetricsBasic from './MetricsBasic.vue';
import MetricsFull from './MetricsFull.vue';

export default defineComponent({
  name: 'MetricsWidget',
  components: {
    Basic: MetricsBasic,
    Full: MetricsFull,
  },
  props: {
    ...useWidget.props,
    ...useContext.props,
  },
  setup(props) {
    const {
      mode,
      inDialog,
    } = useContext.setup(props.context);

    const revision = ref<number>(0);

    return {
      mode,
      inDialog,
      revision,
    };
  },
});
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <WidgetToolbar v-model:mode="mode" :in-dialog="inDialog" :widget-id="widgetId">
        <template #actions>
          <ActionItem
            v-if="mode === 'Basic'"
            icon="refresh"
            label="Refresh"
            @click="revision++"
          />
        </template>
      </WidgetToolbar>
    </template>

    <component
      :is="mode"
      :widget-id="widgetId"
      :revision="revision"
      @mode="v => mode = v"
    />
  </CardWrapper>
</template>
