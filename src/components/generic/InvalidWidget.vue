<script lang="ts">
import { defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';

export default defineComponent({
  name: 'InvalidWidget',
  props: {
    ...useWidget.props,
    ...useContext.props,
    error: {
      type: String,
      default: 'Unknown error',
    },
  },
  setup(props) {
    const { inDialog } = useContext.setup(props.context);

    return {
      inDialog,
    };
  },
});
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <WidgetToolbar :in-dialog="inDialog" :widget-id="widgetId" />
    </template>

    <CardWarning color="negative" class="items-center">
      <template #message>
        {{ error }}
      </template>
    </CardWarning>
  </CardWrapper>
</template>
