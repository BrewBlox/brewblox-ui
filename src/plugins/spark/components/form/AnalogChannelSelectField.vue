<script setup lang="ts">
import {
  AnalogArrayInterfaceBlock,
  BlockIntfType,
  Link,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { ENUM_LABELS_ANALOG_SENSOR_TYPE } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import {
  analogChannelReaders,
  isBlockCompatible,
} from '@/plugins/spark/utils/info';
import { bloxLink } from '@/utils/link';
import { analogChannelName } from '../../utils/formatting';

interface ChannelAddress {
  analogDevice: Link;
  analogChannel: number;
}

interface Props {
  serviceId: string;
  modelValue: ChannelAddress;
}

const emit = defineEmits<{
  'update:modelValue': [payload: ChannelAddress];
}>();

const props = defineProps<Props>();

const sparkStore = useSparkStore();

const channelNameWithBlock = (
  blockId: string | null,
  channelId: number,
): string => {
  return `${analogChannelName(channelId)} ${blockId ? `on ${blockId}` : ''}`;
};

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

const channelOpts = computed<SelectOption[]>(() => {
  const blocks = sparkStore.blocksByService(props.serviceId);
  return blocks
    .filter((block): block is AnalogArrayInterfaceBlock =>
      isBlockCompatible(block, BlockIntfType.AnalogArrayInterface),
    )
    .flatMap((block: AnalogArrayInterfaceBlock) =>
      block.data.analogChannels.map((analogChannel) => {
        const readers = analogChannelReaders(blocks, block.id, analogChannel.id)
          .map((reader) => reader.id)
          .join(', ');
        return {
          label:
            `<b>${channelNameWithBlock(block.id, analogChannel.id)}: </b>` +
            `<small> ${ENUM_LABELS_ANALOG_SENSOR_TYPE[analogChannel.sensorType]}` +
            (readers ? ` -> ${readers}` : '') +
            '</small>',
          value: `${block.id}/${analogChannel.id}`,
          html: true,
        };
      }),
    );
});
</script>

<template>
  <SelectField
    v-model="model"
    :options="channelOpts"
    :select-props="{ displayValueHtml: true }"
    title="Analog channel"
  >
    <template #value>
      {{
        channelNameWithBlock(
          modelValue.analogDevice.id,
          modelValue.analogChannel,
        )
      }}
    </template>
  </SelectField>
</template>
