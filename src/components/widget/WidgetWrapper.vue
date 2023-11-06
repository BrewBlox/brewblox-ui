<script setup lang="ts">
import { useFeatureStore, WidgetContext } from '@/store/features';
import { Widget } from '@/store/widgets';
import {
  ChangeWidgetTitleKey,
  ContextKey,
  InvalidateKey,
  PatchWidgetKey,
  VolatileKey,
  WidgetKey,
} from '@/symbols';
import { startChangeWidgetTitle, startRemoveWidget } from '@/utils/widgets';
import cloneDeep from 'lodash/cloneDeep';
import { computed, inject, onErrorCaptured, provide, reactive, ref } from 'vue';

interface Props {
  widget: Widget;
  context: WidgetContext;
  volatile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  volatile: false,
});

const emit = defineEmits<{
  'update:widget': [payload: Widget];
}>();

const featureStore = useFeatureStore();
const error = ref<string>();

const invalidateParent = inject(
  InvalidateKey,
  (reason?: string) => void reason,
);

const feature = featureStore.widgetById(props.widget.feature);
const widgetComponent = feature?.wrapperComponent ?? feature?.component ?? null;

provide(
  WidgetKey,
  computed<Widget>(() => props.widget),
);

provide(PatchWidgetKey, (patch: Partial<Widget>) => {
  emit('update:widget', { ...props.widget, ...patch });
});

provide(ContextKey, reactive<WidgetContext>(cloneDeep(props.context)));

provide(InvalidateKey, (reason?: string) => {
  error.value = reason ?? 'Unknown error';
  invalidateParent(reason);
});

provide(VolatileKey, props.volatile);

provide(ChangeWidgetTitleKey, () => startChangeWidgetTitle(props.widget));

onErrorCaptured((err: Error) => {
  error.value = err.message;
  return false;
});
</script>

<template>
  <div
    v-if="!widgetComponent"
    class="darkened text-h6 text-center q-px-lg"
    style="border: 1px dashed silver"
  >
    <div>Unknown widget type: '{{ widget.feature }}'</div>
    <q-btn
      label="Remove widget"
      flat
      color="secondary"
      icon="mdi-delete"
      class="q-mt-lg"
      @click="startRemoveWidget(widget)"
    />
  </div>
  <div
    v-else-if="error"
    class="darkened text-h6 text-center q-px-lg"
    style="border: 1px dashed silver"
  >
    <div>{{ error }}</div>
    <q-btn
      label="Retry"
      flat
      color="secondary"
      icon="mdi-reload"
      class="q-mt-lg"
      @click="error = undefined"
    />
    <q-btn
      label="Remove widget"
      flat
      color="secondary"
      icon="mdi-delete"
      class="q-mt-lg"
      @click="startRemoveWidget(widget)"
    />
  </div>
  <component
    :is="widgetComponent"
    v-else
  />
</template>
