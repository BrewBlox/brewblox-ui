<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { BlockIntfType, IoArrayBlock, IoChannel } from '@/plugins/spark/types';
import { channelName, isCompatible } from '@/plugins/spark/utils';

import { IoChannelAddress } from '../types';

export default defineComponent({
  name: 'QuickstartChannelField',
  props: {
    modelValue: {
      type: Object as PropType<IoChannelAddress | null>,
      default: null,
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const local = computed<IoChannelAddress | null>({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    });

    const opts = computed<SelectOption<IoChannelAddress>[]>(() =>
      sparkStore
        .serviceBlocks(props.serviceId)
        .filter((block): block is IoArrayBlock =>
          isCompatible(block.type, BlockIntfType.IoArrayInterface),
        )
        .flatMap((block): IoChannelAddress[] =>
          block.data.channels.map((channel: IoChannel) => ({
            channel,
            blockId: block.id,
            name: channelName(block, channel.id) || `Channel ${channel.id}`,
          })),
        )
        .map((channel) => ({
          label: `${channel.blockId} ${channel.name}`,
          value: channel,
        })),
    );

    const status = computed<string>(() => {
      if (!local.value) {
        return '';
      }
      const block = sparkStore.blockById(props.serviceId, local.value.blockId);
      if (!block) {
        return `Block '${local.value.blockId}' not found`;
      }
      return block.data.connected === false
        ? `${local.value.blockId} is not connected`
        : `${local.value.blockId} is connected`;
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
    :rules="[(v) => !!v || 'Channel must be selected']"
    emit-value
    map-options
  />
</template>
