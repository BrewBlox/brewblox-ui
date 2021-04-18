<script lang="ts">
import { defineComponent, PropType, provide, reactive } from 'vue';

import { WidgetContext } from '@/store/features';
import { ContextKey, WidgetIdKey } from '@/symbols';
import { deepCopy } from '@/utils/functional';

export default defineComponent({
  name: 'WidgetProvider',
  props: {
    widgetId: {
      type: String,
      required: true,
    },
    context: {
      type: Object as PropType<WidgetContext>,
      required: true,
    },
  },
  setup(props) {
    provide(WidgetIdKey, props.widgetId);
    provide(ContextKey, reactive<WidgetContext>(deepCopy(props.context)));

    return {};
  },
});
</script>

<template>
  <template v-if="true">
    <slot />
  </template>
</template>
