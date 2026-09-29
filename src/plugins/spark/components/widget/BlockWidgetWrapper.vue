<script setup lang="ts">
import { Block } from 'brewblox-proto/ts';
import {
  computed,
  ComputedRef,
  inject,
  onErrorCaptured,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockChainKey, BlockKey } from '@/plugins/spark/symbols';
import { BlockWidget } from '@/plugins/spark/types';
import {
  blockChain,
  chainIncludes,
  isChained,
} from '@/plugins/spark/utils/chains';
import { useFeatureStore } from '@/store/features';
import {
  CardFooter,
  CardFooterKey,
  ChainOfKey,
  ChangeWidgetTitleKey,
  ContextKey,
  InvalidateKey,
  WidgetFooterKey,
  WidgetKey,
} from '@/symbols';
import { startRemoveWidget } from '@/utils/widgets';
import { startChangeBlockId } from '../../utils/actions';

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
const serviceBlocks = computed<Block[]>(() =>
  sparkStore.blocksByService(serviceId.value),
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

  // We don't recover errors in dialogs, but we do wait out transient states.
  // The store empties the service block list when the service is disconnected,
  // or when a periodic state update fails or is stale.
  // A missing block while other blocks are present means it was removed or renamed.
  if (error.value && context?.container === 'Dialog') {
    const transient =
      sparkStore.has(serviceId.value) &&
      !storeBlock.value &&
      serviceBlocks.value.length === 0;
    if (!transient) {
      invalidate(error.value);
    }
  }
}

// We handle checking up here to guarantee block.value
// is never undefined in render components
provide(BlockKey, block as ComputedRef<Block>);

// A block in a control chain shows the chain in the footer of its card.
// A block without its own chain, such as an IO module,
// shows the chain it was opened from, if it is in that chain.
const chainOf = inject(
  ChainOfKey,
  computed(() => null),
);
const chain = computed(() => {
  const own = blockChain(serviceBlocks.value, blockId.value);
  if (isChained(own) || !chainOf.value) {
    return { chain: own, anchor: blockId.value };
  }
  const via = blockChain(serviceBlocks.value, chainOf.value);
  return chainIncludes(via, blockId.value)
    ? { chain: via, anchor: chainOf.value }
    : { chain: own, anchor: blockId.value };
});
provide(BlockChainKey, chain);
// Cards show it in dialogs only: on a dashboard, it would take space from the widget
const footer = computed<CardFooter | null>(() =>
  isChained(chain.value.chain)
    ? {
        component: 'BlockChain',
        rows: Math.max(1, chain.value.chain.branches.length),
      }
    : null,
);
provide(CardFooterKey, footer);
provide(WidgetFooterKey, footer);

// Override the function provided in WidgetWrapper
provide(ChangeWidgetTitleKey, () => startChangeBlockId(block.value));

// The block count is also watched:
// storeBlock remains null if the block is gone
// when blocks are received again after a transient state.
watch(
  () => [storeBlock, serviceBlocks.value.length],
  () => assignBlock(),
  { immediate: true, deep: true },
);

onErrorCaptured((err: Error) => {
  error.value = err.message;
  // eslint-disable-next-line no-console
  console.trace(err);
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
      v-if="context?.container === 'Dialog'"
      v-close-popup
      label="Close"
      flat
      color="secondary"
      icon="mdi-close-circle"
      class="q-mt-lg"
    />
    <q-btn
      v-else
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
