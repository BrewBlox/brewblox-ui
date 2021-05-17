<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { sparkStore } from '@/plugins/spark/store';
import { fetchStoredBlock } from '@/plugins/spark/store/api';
import { Block, DeprecatedObjectBlock } from '@/plugins/spark/types';

export default defineComponent({
  name: 'DeprecatedObjectWidget',
  setup() {
    const {
      inDialog,
    } = useContext.setup();
    const {
      serviceId,
      widget,
      featureTitle,
      block,
    } = useBlockWidget.setup<DeprecatedObjectBlock>();

    const actual = ref<Block | null>(null);

    onBeforeMount(async () => {
      actual.value = await fetchStoredBlock(serviceId, { nid: block.value.data.actualId });
    });

    function removeBlock(): void {
      sparkStore.removeBlock(block.value);
    }

    return {
      inDialog,
      serviceId,
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
      <DialogToolbar v-if="inDialog" :title="widget.title" :subtitle="featureTitle" />
      <WidgetToolbar v-else readonly />
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
      <q-btn
        icon="delete"
        flat
        class="col-grow"
        @click="removeBlock"
      />
    </div>
  </Card>
</template>
