<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';

export default defineComponent({
  name: 'InvalidWidget',
  props: {
    ...useWidget.props,
    error: {
      type: String,
      default: 'Unknown error',
    },
  },
  setup(props) {
    const {
      crud,
      toolbarComponent,
    } = useWidget.setup(props.crud, props.context);

    return {
      crud,
      toolbarComponent,
    };
  },
});
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" />
    </template>

    <CardWarning color="negative" class="items-center">
      <template #message>
        {{ error }}
      </template>
    </CardWarning>
  </CardWrapper>
</template>
