<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import {
  BlockIntfType,
  BlockType,
  IoArrayBlock,
  IoChannel,
} from '@/plugins/spark/types';
import { channelName, isCompatible } from '@/plugins/spark/utils';

import { GpioChange, IoChannelAddress } from '../types';

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
    changedGpio: {
      type: Array as PropType<GpioChange[]>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const local = computed<IoChannelAddress | null>({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    });

    const opts = computed<SelectOption<IoChannelAddress>[]>(() => [
      // Based on IO arrays except OneWireGPIO
      ...sparkStore
        .serviceBlocks(props.serviceId)
        .filter((block): block is IoArrayBlock =>
          isCompatible(block.type, BlockIntfType.IoArrayInterface),
        )
        .filter((block) => block.type !== BlockType.OneWireGpioModule)
        .flatMap((block): IoChannelAddress[] =>
          block.data.channels.map((channel: IoChannel) => ({
            blockId: block.id,
            channelId: channel.id,
            name: channelName(block, channel.id) || `Channel ${channel.id}`,
          })),
        )
        .map((channel) => ({
          label: `${channel.blockId} ${channel.name}`,
          value: channel,
        })),
      // Based on GPIO changes
      ...props.changedGpio.flatMap((change) =>
        change.channels.map((channel) => ({
          label: `${change.blockId} ${channel.name}`,
          value: {
            blockId: change.blockId,
            name: channel.name,
            channelId: channel.id,
          },
        })),
      ),
    ]);

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
