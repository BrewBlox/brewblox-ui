<script lang="ts">
import { defineComponent, inject, PropType, provide, reactive, ref } from 'vue';

import { WidgetContext } from '@/store/features';
import { ContextKey, InvalidateKey, WidgetIdKey } from '@/symbols';
import { deepCopy } from '@/utils';

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
    const valid = ref(true);
    const invalidateParent = inject(InvalidateKey, () => { });

    function invalidate(): void {
      valid.value = false;
      invalidateParent();
    }

    provide(WidgetIdKey, props.widgetId);
    provide(ContextKey, reactive<WidgetContext>(deepCopy(props.context)));
    provide(InvalidateKey, invalidate);

    return {
      valid,
    };
  },
});
</script>

<template>
  <template v-if="valid">
    <slot />
  </template>
</template>
