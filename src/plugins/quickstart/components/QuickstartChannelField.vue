<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import {
  BlockIntfType,
  BlockType,
  GpioDeviceType,
  GpioPins,
  IoArrayBlock,
  IoChannel,
} from '@/plugins/spark/types';
import { channelName, isCompatible } from '@/plugins/spark/utils';

import { GpioChange, IoChannelAddress } from '../types';

function unusedId(change: GpioChange): number {
  const ids = change.channels.map((c) => c.id);
  let i = 1;
  while (ids.includes(i)) {
    i++;
  }
  return i;
}

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
    desc: {
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
      set: (addr) => {
        if (addr && addr.channelId === -1) {
          const change = props.changedGpio.find(
            (c) => c.blockId === addr.blockId,
          );
          if (change) {
            const channelId = unusedId(change);
            change.channels.push({
              id: channelId,
              name: addr.name.slice(0, 32),
              deviceType: GpioDeviceType.GPIO_DEV_SSR_2P,
              width: 2,
              pinsMask: GpioPins.NONE,
            });
            emit('update:modelValue', { ...addr, channelId });
          }
        } else {
          emit('update:modelValue', addr);
        }
      },
    });

    const opts = computed<SelectOption<IoChannelAddress>[]>(() => {
      return [
        // Existing channels from blocks except GPIO
        ...sparkStore
          .serviceBlocks(props.serviceId)
          .filter(
            (block): block is IoArrayBlock =>
              isCompatible(block.type, BlockIntfType.IoArrayInterface) &&
              block.type !== BlockType.OneWireGpioModule,
          )
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
        // Add new channel
        ...props.changedGpio
          .filter((change) => change.channels.length < 8)
          .map((change) => ({
            label: `<span class="text-secondary">Add channel on ${change.blockId}</span>`,
            html: true,
            value: {
              blockId: change.blockId,
              name: props.desc,
              channelId: -1,
            },
          })),
      ];
    });

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
