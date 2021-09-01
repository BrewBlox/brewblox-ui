<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { BlockIntfType, IoArrayBlock, IoChannel } from '@/plugins/spark/types';
import { channelName, isCompatible } from '@/plugins/spark/utils';

import { PinChannel } from '../types';

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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const local = computed<PinChannel | null>({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    });

    const opts = computed<SelectOption<PinChannel>[]>(() =>
      sparkStore
        .serviceBlocks(props.serviceId)
        .filter((block): block is IoArrayBlock =>
          isCompatible(block.type, BlockIntfType.IoArrayInterface),
        )
        .flatMap((block): PinChannel[] =>
          block.data.channels.map((channel: IoChannel) => {
            const { id } = channel;
            const pinName = channelName(block, channel.id) ?? `Channel ${id}`;
            return { pinName, arrayId: block.id, pinId: id };
          }),
        )
        .map((channel) => ({
          label: `${channel.arrayId} ${channel.pinName}`,
          value: channel,
        })),
    );

    const status = computed<string>(() => {
      if (!local.value) {
        return '';
      }
      const block = sparkStore.blockById(props.serviceId, local.value.arrayId);
      if (!block) {
        return `Block '${local.value.arrayId}' not found`;
      }
      return block.data.connected === false
        ? `${local.value.arrayId} is not connected`
        : `${local.value.arrayId} is connected`;
    });

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
    :rules="[(v) => !!v || 'Pin must be selected']"
    emit-value
    map-options
  />
</template>
