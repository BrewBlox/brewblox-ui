<script setup lang="ts">
import {
  AnalogArrayInterfaceBlock,
  BlockIntfType,
  ChannelCapabilities,
  Link,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { channelName } from '@/plugins/spark/utils/formatting';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { bloxLink } from '@/utils/link';
import { prettyLink } from '@/utils/quantity';

interface ChannelAddress {
  analogDevice: Link;
  analogChannel: number;
}

interface Props {
  serviceId: string;
  modelValue: ChannelAddress;
  capabilities?: ChannelCapabilities;
}

const props = withDefaults(defineProps<Props>(), {
  capabilities: ChannelCapabilities.CHAN_SUPPORTS_NONE,
});

const emit = defineEmits<{
  'update:modelValue': [payload: ChannelAddress];
}>();

const sparkStore = useSparkStore();

const model = computed<string | null>({
  get: () => {
    const { analogDevice, analogChannel } = props.modelValue;
    return analogDevice.id && analogChannel
      ? `${analogDevice.id}/${analogChannel}`
      : '';
  },
  set: (v) => {
    if (v) {
      const [blockId, channelId] = v.split('/');
      emit('update:modelValue', {
        analogDevice: bloxLink(blockId),
        analogChannel: Number(channelId),
      });
    } else {
      emit('update:modelValue', {
        analogDevice: bloxLink(null),
        analogChannel: 0,
      });
    }
  },
});

const channelLabel = computed<string>(() => {
  const block = sparkStore.blockByLink(
    props.serviceId,
    props.modelValue.analogDevice,
  );
  return channelName(block, props.modelValue.analogChannel) ?? '';
});

const channelOpts = computed<SelectOption[]>(() =>
  sparkStore
    .blocksByService(props.serviceId)
    .filter((block): block is AnalogArrayInterfaceBlock =>
      isBlockCompatible(block, BlockIntfType.AnalogArrayInterface),
    )
    .flatMap((block: AnalogArrayInterfaceBlock) =>
      block.data.analogChannels.map((analogChannel) => ({
        block,
        analogChannel,
      })),
    )
    .map(({ block, analogChannel }) => ({
      label:
        `<b>${block.id}</b> ${channelName(block, analogChannel.id)}` +
        (analogChannel.claimedBy.id
          ? ` <small>(replace ${analogChannel.claimedBy.id})</small>`
          : ''),
      value: `${block.id}/${analogChannel.id}`,
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
      {{ prettyLink(modelValue.analogDevice) }} {{ channelLabel }}
    </template>
  </SelectField>
</template>
