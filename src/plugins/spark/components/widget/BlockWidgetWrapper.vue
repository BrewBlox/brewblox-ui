<script lang="ts">
import { startChangeBlockId } from '../../utils/actions';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockKey } from '@/plugins/spark/symbols';
import { BlockWidget } from '@/plugins/spark/types';
import { useFeatureStore } from '@/store/features';
import {
  ChangeWidgetTitleKey,
  ContextKey,
  InvalidateKey,
  WidgetKey,
} from '@/symbols';
import { startRemoveWidget } from '@/utils/widgets';
import { Block } from 'brewblox-proto/ts';
import {
  computed,
  ComputedRef,
  defineComponent,
  inject,
  onErrorCaptured,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';

export default defineComponent({
  name: 'BlockWidgetWrapper',
  setup() {
    const sparkStore = useSparkStore();
    const featureStore = useFeatureStore();
    const widget = inject<ComputedRef<BlockWidget>>(WidgetKey)!;
    const context = inject(ContextKey)!;
    const invalidate = inject(InvalidateKey)!;
    const error = ref<string | null>('Waiting for block...');

    const serviceId = computed<string>(() => widget.value.config.serviceId);
    const blockId = computed<string>(() => widget.value.config.blockId);

    const feature = featureStore.widgetById(widget.value.feature);
    const widgetComponent = feature?.component ?? null;

    const block = ref<Block>();
    const storeBlock = computed<Block | null>(() =>
      sparkStore.blockById(serviceId.value, blockId.value),
    );

    function assignBlock(): void {
      if (storeBlock.value) {
        if (storeBlock.value.type === widget.value.feature) {
          error.value = null;
          block.value = reactive(storeBlock.value);
        } else {
          error.value = `Invalid block type: '${storeBlock.value.type}'`;
        }
      } else {
        error.value = `Waiting for block: '${serviceId.value}/${blockId.value}'`;
      }

      // We don't recover errors in dialogs
      if (error.value && context?.container === 'Dialog') {
        invalidate(error.value);
      }
    }

    // We handle checking up here to guarantee block.value
    // is never undefined in render components
    provide(BlockKey, block as ComputedRef<Block>);

    // Override the function provided in WidgetWrapper
    provide(ChangeWidgetTitleKey, () => startChangeBlockId(block.value));

    watch(
      () => storeBlock,
      () => assignBlock(),
      { immediate: true, deep: true },
    );

    onErrorCaptured((err: Error) => {
      error.value = err.message;
      return false;
    });

    return {
      widget,
      error,
      widgetComponent,
      startRemoveWidget,
    };
  },
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
