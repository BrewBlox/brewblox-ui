<script setup lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { useFeatureStore } from '@/store/features';
import { InactiveObjectBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';

const featureStore = useFeatureStore();
const { block } = useBlockWidget.setup<InactiveObjectBlock>();

const actualFeatureTitle = computed<string>(() =>
  featureStore.widgetTitle(block.value.data.actualType),
);
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
