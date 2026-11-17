<script setup lang="ts">
import {
  Block,
  BlockIntfType,
  BlockOrIntfType,
  ChannelCapabilities,
  IoArrayInterfaceBlock,
  Link,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import {
  claimedChannels,
  ioChannelClaimers,
} from '@/plugins/spark/utils/configuration';
import { channelName } from '@/plugins/spark/utils/formatting';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { bloxLink } from '@/utils/link';
import { prettyLink } from '@/utils/quantity';

interface ChannelAddress {
  hwDevice: Link;
  channel: number;
}

interface Props {
  serviceId: string;
  modelValue: ChannelAddress;
  capabilities?: ChannelCapabilities;
  /** The block that takes the channel: its type gives the channels it holds */
  claimer?: Block | null;
  /** The devices the block can link, where not every IO array */
  deviceType?: BlockOrIntfType;
}

const props = withDefaults(defineProps<Props>(), {
  capabilities: ChannelCapabilities.CHAN_SUPPORTS_NONE,
  claimer: null,
  deviceType: BlockIntfType.IoArrayInterface,
});

function holders(block: IoArrayInterfaceBlock, start: number): string[] {
  const self = props.claimer?.id ?? null;
  const channels = claimedChannels(props.claimer?.type ?? '', start);
  const reported = block.data.channels
    .filter((c) => channels.includes(c.id))
    .map((c) => c.claimedBy.id);
  const linked = ioChannelClaimers(
    props.serviceId,
    bloxLink(block.id),
    channels,
    self,
  ).map((b) => b.id);
  return [
    ...new Set(
      [...reported, ...linked].filter(
        (id): id is string => !!id && id !== self,
      ),
    ),
  ];
}

const emit = defineEmits<{
  'update:modelValue': [payload: ChannelAddress];
}>();

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
    .filter(
      (block): block is IoArrayInterfaceBlock =>
        isBlockCompatible(block, BlockIntfType.IoArrayInterface) &&
        isBlockCompatible(block, props.deviceType),
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
      block,
      channel,
      ids: holders(block, channel.id),
    }))
    .map(({ block, channel, ids }) => ({
      label:
        `<b>${block.id}</b> ${channelName(block, channel.id)}` +
        (ids.length ? ` <small>(replace ${ids.join(', ')})</small>` : ''),
      value: `${block.id}/${channel.id}`,
      html: true,
    })),
);
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
