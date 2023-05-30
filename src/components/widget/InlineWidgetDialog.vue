<script lang="ts">
import { useGlobals, useWidget } from '@/composables';
import { WidgetContext, WidgetMode } from '@/store/features';
import { ContextKey } from '@/symbols';
import { computed, defineComponent, PropType, provide, reactive } from 'vue';

export default defineComponent({
  name: 'InlineWidgetDialog',
  props: {
    active: {
      type: Boolean,
      required: true,
    },
    mode: {
      type: String as PropType<WidgetMode>,
      default: 'Full',
    },
  },
  emits: ['update:active'],
  setup(props, { emit }) {
    const { dense } = useGlobals.setup();
    const { widgetComponent } = useWidget.setup();

    const dialogActive = computed<boolean>({
      get: () => props.active,
      set: (v) => emit('update:active', v),
    });

    const context = reactive<WidgetContext>({
      container: 'Dialog',
      mode: props.mode,
      size: 'Fixed',
    });

    // Overrides parent context
    provide(ContextKey, context);

    return {
      dense,
      dialogActive,
      widgetComponent,
    };
  },
});
</script>

<template>
  <q-dialog
    v-model="dialogActive"
    :maximized="dense"
    no-route-dismiss
    no-backdrop-dismiss
    transition-show="fade"
    @hide="dialogActive = false"
  >
    <component :is="widgetComponent" />
  </q-dialog>
</template>
