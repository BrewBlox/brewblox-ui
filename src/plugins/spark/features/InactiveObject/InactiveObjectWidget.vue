<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { InactiveObjectBlock } from '@/plugins/spark/types';
import { useFeatureStore } from '@/store/features';

export default defineComponent({
  name: 'InactiveObjectWidget',
  setup() {
    const featureStore = useFeatureStore();
    const { block } = useBlockWidget.setup<InactiveObjectBlock>();

    const actualFeatureTitle = computed<string>(() =>
      featureStore.widgetTitle(block.value.data.actualType),
    );

    return {
      actualFeatureTitle,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>
    <CardWarning>
      <template #message>
        This {{ actualFeatureTitle }} block is disabled. <br />To enable it,
        ensure that it is in an enabled group.
      </template>
    </CardWarning>
  </Card>
</template>
