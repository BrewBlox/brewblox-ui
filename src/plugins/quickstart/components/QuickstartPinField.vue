<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { BlockType } from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';

import { PinChannel } from '../types';

const validTypes: BlockType[] = [
  BlockType.Spark2Pins,
  BlockType.Spark3Pins,
  BlockType.MockPins,
  BlockType.DS2413,
];

export default defineComponent({
  name: 'QuickstartPinField',
  props: {
    modelValue: {
      type: Object as PropType<PinChannel | null>,
      default: null,
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {

    const local = computed<PinChannel | null>({
      get: () => props.modelValue,
      set: v => emit('update:modelValue', v),
    });

    const opts = computed<SelectOption[]>(
      () => sparkStore.serviceBlocks(props.serviceId)
        .filter(block => isCompatible(block.type, validTypes))
        .flatMap((block): PinChannel[] =>
          block.data.pins.map((pin, idx) => {
            const [pinName] = Object.keys(block.data.pins[idx]);
            return { pinName, arrayId: block.id, pinId: idx + 1 };
          }))
        .map(channel => ({ label: `${channel.arrayId} ${channel.pinName}`, value: channel })),
    );

    const status = computed<string>(
      () => {
        if (!local.value) {
          return '';
        }
        const block = sparkStore.blockById(props.serviceId, local.value.arrayId);
        if (!block) {
          return `Block '${local.value.arrayId}' not found`;
        }
        return (block.data.connected === false)
          ? `${local.value.arrayId} is not connected`
          : `${local.value.arrayId} is connected`;
      },
    );

    return {
      local,
      opts,
      status,
    };
  },
});
</script>

<template>
  <q-select
    v-model="local"
    :options="opts"
    :hint="status"
    :rules="[v => !!v || 'Pin must be selected']"
    emit-value
    map-options
  />
</template>
