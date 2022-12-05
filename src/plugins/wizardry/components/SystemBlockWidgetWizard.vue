<script lang="ts">
import { BlockType } from 'brewblox-proto/ts';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'SystemBlockWidgetWizard',
  props: {
    featureId: {
      type: String as PropType<BlockType>,
      required: true,
    },
  },
});
</script>

<template>
  <BlockWidgetWizard
    :feature-id="featureId"
    single-mode="existing"
  />
</template>
