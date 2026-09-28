<script setup lang="ts">
import { Block, BlockType, DigitalState } from 'brewblox-proto/ts';
import { computed, inject, nextTick, onMounted, ref } from 'vue';
import { useBlockWidget, useShowBlock } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockChainKey } from '@/plugins/spark/symbols';
import { ChainItem } from '@/plugins/spark/types';
import { ChainStep } from '@/plugins/spark/utils/chains';
import { channelName } from '@/plugins/spark/utils/formatting';
import { useFeatureStore } from '@/store/features';
import { fixedNumber, prettyQty } from '@/utils/quantity';

const sparkStore = useSparkStore();
const featureStore = useFeatureStore();
const { serviceId, blockId } = useBlockWidget.setup();
const showBlock = useShowBlock.setup(serviceId);
// Provided by the block widget wrapper, which shows this component in the footer
const chain = inject(BlockChainKey)!;

function stepValue(block: Block): string {
  const { data } = block;
  switch (block.type) {
    case BlockType.SetpointSensorPair:
    case BlockType.SetpointProfile:
      return prettyQty(data.setting, 1);
    case BlockType.ActuatorOffset:
      return prettyQty(data.value, 1);
    case BlockType.ActuatorPwm:
    case BlockType.FastPwm:
      return `${fixedNumber(data.value, 0)}%`;
    case BlockType.ActuatorAnalogMock:
      return fixedNumber(data.value, 1);
    case BlockType.DigitalActuator:
    case BlockType.MotorValve:
      return data.state === DigitalState.STATE_ACTIVE
        ? 'On'
        : data.state === DigitalState.STATE_INACTIVE
          ? 'Off'
          : '';
    default:
      return '';
  }
}

function chainItem(blocks: Block[], step: ChainStep): ChainItem {
  const block = blocks.find((b) => b.id === step.id);
  const type = featureStore.widgetTitle(block?.type);
  const channel =
    step.channel != null
      ? (channelName(block, step.channel) ?? step.channel)
      : null;
  return {
    id: step.id,
    channel: step.channel,
    label: channel != null ? `${type} ${channel}` : type,
    name: channel != null ? `${step.id} ${channel}` : step.id,
    value: channel == null && block ? stepValue(block) : '',
    // Also an IO module, opened from its channel in the chain
    current: step.id === blockId,
    enabled: block?.data.enabled !== false,
    active: step.active,
    alternatives: step.alternatives.map((id) => ({ id, type: typeTitle(id) })),
  };
}

const rows = computed(() => {
  const blocks = sparkStore.blocksByService(serviceId);
  const toItems = (steps: ChainStep[]): ChainItem[] =>
    steps.map((step) => chainItem(blocks, step));
  return {
    steps: toItems(chain.value.chain.steps),
    branches: chain.value.chain.branches.map(toItems),
  };
});

// A chain wider than the footer scrolls: center this block in it.
// Only the chain scrolls: scrollIntoView would also scroll the page to it.
const chainRef = ref<HTMLElement>();
onMounted(() =>
  nextTick(() => {
    const el = chainRef.value;
    const current = el?.querySelector<HTMLElement>('.current-step');
    if (el && current) {
      const left =
        current.getBoundingClientRect().left - el.getBoundingClientRect().left;
      el.scrollLeft += left - (el.clientWidth - current.offsetWidth) / 2;
    }
  }),
);

// The wheel scrolls a chain wider than the footer sideways
function onWheel(evt: WheelEvent): void {
  const el = chainRef.value;
  if (!el || el.scrollWidth <= el.clientWidth || evt.deltaX !== 0) {
    return;
  }
  const before = el.scrollLeft;
  el.scrollLeft += evt.deltaY;
  // At either end of the chain, the page scrolls on
  if (el.scrollLeft !== before) {
    evt.preventDefault();
  }
}

function typeTitle(id: string): string {
  return featureStore.widgetTitle(sparkStore.blockById(serviceId, id)?.type);
}

function show(id: string): void {
  if (id !== blockId) {
    showBlock(id, chain.value.anchor);
  }
}
</script>

<template>
  <div
    ref="chainRef"
    class="block-chain absolute-full row no-wrap items-start q-px-sm text-small"
    @wheel="onWheel"
  >
    <BlockChainSteps
      :items="rows.steps"
      @show="show"
    />
    <!-- Where PIDs read the same setpoint, the chain splits: a tee -->
    <div
      v-if="rows.branches.length"
      class="column no-wrap"
    >
      <BlockChainSteps
        v-for="(branch, idx) in rows.branches"
        :key="idx"
        :items="branch"
        class="chain-branch"
        @show="show"
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
$tee-color: rgba(255, 255, 255, 0.35)

// A chain wider than the footer scrolls sideways, without a scrollbar
.block-chain
  overflow-x: auto
  overflow-y: hidden
  scrollbar-width: none

  &::-webkit-scrollbar
    display: none

.chain-branch
  position: relative
  padding-left: 18px

  // Into the branch
  &::before
    content: ''
    position: absolute
    left: 6px
    top: 50%
    width: 10px
    border-top: 1px solid $tee-color

  // Along the branches
  &::after
    content: ''
    position: absolute
    left: 6px
    top: 0
    bottom: 0
    border-left: 1px solid $tee-color

  &:first-child::after
    top: 50%

  &:last-child::after
    bottom: 50%
</style>
