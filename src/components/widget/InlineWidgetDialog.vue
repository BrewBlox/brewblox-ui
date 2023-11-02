<script setup lang="ts">
import { useGlobals, useWidget } from '@/composables';
import { WidgetContext, WidgetMode } from '@/store/features';
import { ContextKey } from '@/symbols';
import { computed, provide, reactive } from 'vue';

interface Props {
  active: boolean;
  mode?: WidgetMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'Full',
});

const emit = defineEmits<{
  'update:active': [value: boolean];
}>();

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
