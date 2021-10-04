<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { Block, DeprecatedObjectBlock } from '@/plugins/spark/types';

export default defineComponent({
  name: 'DeprecatedObjectWidget',
  setup() {
    const sparkStore = useSparkStore();
    const { serviceId, widget, featureTitle, block } =
      useBlockWidget.setup<DeprecatedObjectBlock>();

    const actual = ref<Block | null>(null);

    onBeforeMount(async () => {
      actual.value = await sparkStore.fetchStoredBlock(
        serviceId,
        block.value.data.actualId,
      );
    });

    function removeBlock(): void {
      sparkStore.removeBlock(block.value);
    }

    return {
      widget,
      featureTitle,
      actual,
      removeBlock,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <Toolbar :title="widget.title" :subtitle="featureTitle" />
    </template>

    <div class="widget-body">
      <LabeledField
        :model-value="actual ? actual.id : 'Unknown'"
        label="ID"
        class="col-grow"
      />
      <LabeledField
        :model-value="actual ? actual.type : 'Unknown'"
        label="Type"
        class="col-grow"
      />
      <q-btn icon="delete" flat class="col-grow" @click="removeBlock" />
    </div>
  </Card>
</template>
