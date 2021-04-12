<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useWidget } from '@/composables';

import MetricsBasic from './MetricsBasic.vue';
import MetricsFull from './MetricsFull.vue';
import { MetricsConfig } from './types';

export default defineComponent({
  name: 'MetricsWidget',
  components: {
    Basic: MetricsBasic,
    Full: MetricsFull,
  },
  props: {
    ...useWidget.props,
  },
  setup(props) {
    const {
      crud,
      mode,
      toolbarComponent,
    } = useWidget.setup<MetricsConfig>(props.crud, props.context);

    const revision = ref<number>(0);

    return {
      crud,
      mode,
      toolbarComponent,
      revision,
    };
  },
});
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" v-model:mode="mode" :crud="crud">
        <template #actions>
          <ActionItem
            v-if="mode === 'Basic'"
            icon="refresh"
            label="Refresh"
            @click="revision++"
          />
        </template>
      </component>
    </template>

    <component
      :is="mode"
      :crud="crud"
      :revision="revision"
      @mode="v => mode = v"
    />
  </CardWrapper>
</template>
