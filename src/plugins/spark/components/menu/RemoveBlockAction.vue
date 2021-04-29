<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { featureStore } from '@/store/features';

export default defineComponent({
  name: 'RemoveBlockAction',
  props: {
    label: {
      type: String,
      default: 'Remove block',
    },
    icon: {
      type: String,
      default: 'delete',
    },
  },
  setup() {
    const {
      block,
      isVolatileBlock,
      startRemoveBlock,
    } = useBlockWidget.setup();

    console.log(isVolatileBlock.value);

    const canRemove = computed<boolean>(
      () => !isVolatileBlock.value
        && featureStore.widgetRemoveActions(block.value.type).length > 0,
    );

    return {
      canRemove,
      startRemoveBlock,
    };
  },
});
</script>

<template>
  <ActionItem
    v-if="canRemove"
    v-bind="{...$attrs, ...$props}"
    @click="startRemoveBlock"
  />
</template>
