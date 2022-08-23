<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { channelName } from '@/plugins/spark/utils/formatting';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { bloxLink } from '@/utils/link';
import { prettyLink } from '@/utils/quantity';
import { BlockIntfType, IoArrayInterfaceBlock, Link } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';

interface ChannelAddress {
  hwDevice: Link;
  channel: number;
}

export default defineComponent({
  name: 'ChannelSelectField',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Object as PropType<ChannelAddress>,
      default: (): ChannelAddress => ({ hwDevice: bloxLink(null), channel: 0 }),
    },
    capabilities: {
      type: Number, // ChannelCapabilities combined flag
      default: 0,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const sparkStore = useSparkStore();

    const model = computed<string | null>({
      get: () => {
        const { hwDevice, channel } = props.modelValue;
        return hwDevice.id && channel ? `${hwDevice.id}/${channel}` : '';
      },
      set: (v) => {
        if (v) {
          const [blockId, channelId] = v.split('/');
          emit('update:modelValue', {
            hwDevice: bloxLink(blockId),
            channel: Number(channelId),
          });
        } else {
          emit('update:modelValue', {
            hwDevice: bloxLink(null),
            channel: 0,
          });
        }
      },
    });

    const channelLabel = computed<string>(() => {
      const block = sparkStore.blockByLink(
        props.serviceId,
        props.modelValue.hwDevice,
      );
      return channelName(block, props.modelValue.channel) ?? '';
    });

    const channelOpts = computed<SelectOption[]>(() =>
      sparkStore
        .blocksByService(props.serviceId)
        .filter((block): block is IoArrayInterfaceBlock =>
          isBlockCompatible(block, BlockIntfType.IoArrayInterface),
        )
        .flatMap((block: IoArrayInterfaceBlock) =>
          block.data.channels.map((channel) => ({ block, channel })),
        )
        .filter(({ channel }) => {
          return (
            props.capabilities === 0 ||
            (channel.capabilities & props.capabilities) > 0
          );
        })
        .map(({ block, channel }) => ({
          label:
            `<b>${block.id}</b> ${channelName(block, channel.id)}` +
            (channel.claimedBy.id
              ? ` <small>(${channel.claimedBy.id})</small>`
              : ''),
          value: `${block.id}/${channel.id}`,
          html: true,
        })),
    );

    return {
      prettyLink,
      model,
      channelOpts,
      channelLabel,
    };
  },
});
</script>

<template>
  <SelectField
    v-model="model"
    :options="channelOpts"
    :select-props="{ displayValueHtml: true }"
  >
    <template #value>
      {{ prettyLink(modelValue.hwDevice) }} {{ channelLabel }}
    </template>
  </SelectField>
</template>
