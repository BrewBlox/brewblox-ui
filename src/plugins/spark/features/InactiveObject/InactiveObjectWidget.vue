<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { InactiveObjectBlock } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

export default defineComponent({
  name: 'InactiveObjectWidget',
  setup() {
    const { block } = useBlockWidget.setup<InactiveObjectBlock>();

    const actualFeatureTitle = computed<string>(
      () => featureStore.widgetTitle(block.value.data.actualType),
    );

    return {
      block,
      actualFeatureTitle,
    };
  },
});
</script>

<template>
  <CardWrapper>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>
    <CardWarning>
      <template #message>
        This {{ actualFeatureTitle }} block is disabled.
        <br>To enable it, ensure that it is in an enabled group.
      </template>
    </CardWarning>
  </CardWrapper>
</template>
