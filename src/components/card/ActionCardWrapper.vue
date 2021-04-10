<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { WidgetContext } from '@/store/features';


export default defineComponent({
  props: {
    context: {
      required: true,
      type: Object as PropType<WidgetContext>,
    },
  },
});
</script>

<template>
  <CardWrapper no-scroll v-bind="{context}">
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    <ActionCardBody>
      <slot />
      <template #actions>
        <slot name="actions" />
      </template>
    </ActionCardBody>
  </CardWrapper>
</template>
