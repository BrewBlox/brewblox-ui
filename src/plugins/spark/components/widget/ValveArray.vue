<script setup lang="ts">
import {
  Block,
  BlockType,
  DigitalState,
  IoArrayInterfaceBlock,
  IoChannel,
  Link,
  MotorValveBlock,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { setExclusiveIoChannelClaimer } from '@/plugins/spark/utils/configuration';
import {
  channelName,
  prettyLimitations,
} from '@/plugins/spark/utils/formatting';
import { bloxLink } from '@/utils/link';

interface EditableChannel extends IoChannel {
  name: string;
  actuator: MotorValveBlock | null;
}

const sparkStore = useSparkStore();
const { serviceId, block } = useBlockWidget.setup<IoArrayInterfaceBlock>();

const channels = computed<EditableChannel[]>(() =>
  block.value.data.channels.map((channel: IoChannel) => ({
    ...channel,
    name: channelName(block.value, channel.id) ?? 'Unknown',
    actuator: sparkStore.blockByLink(serviceId, channel.claimedBy),
  })),
);

function actuatorLimitations(block: Block): string | null {
  return prettyLimitations(block.data.constraints) || null;
}

async function replaceActuator(
  channel: EditableChannel,
  link: Link,
): Promise<void> {
  setExclusiveIoChannelClaimer(
    sparkStore.blockByLink(serviceId, link),
    bloxLink(block.value.id),
    channel.id,
  );
}

async function updateDigitalState(
  channel: EditableChannel,
  desiredState: DigitalState,
): Promise<void> {
  await sparkStore.patchBlock(channel.actuator, { desiredState });
}
</script>

<template>
  <div class="widget-body column">
    <div
      v-for="channel in channels"
      :key="`channel-${channel.id}`"
      class="col row q-gutter-x-sm q-gutter-y-xs q-mt-none items-stretch justify-start"
    >
      <div class="col-auto q-pt-sm self-baseline text-h6 min-width-sm">
        {{ channel.name }}
      </div>
      <div class="col-auto row items-baseline min-width-sm">
        <DigitalStateButton
          v-if="channel.actuator"
          :disable="channel.actuator.data.claimedBy.id != null"
          :model-value="channel.actuator.data.desiredState"
          :pending="
            channel.actuator.data.state !== channel.actuator.data.desiredState
          "
          :pending-reason="actuatorLimitations(channel.actuator)"
          class="col-auto self-center"
          @update:model-value="(v) => updateDigitalState(channel, v)"
        />
        <div
          v-else
          class="darkened text-italic q-pa-sm"
        >
          Not set
        </div>
      </div>
      <LinkField
        :model-value="channel.claimedBy"
        :service-id="serviceId"
        :compatible="BlockType.MotorValve"
        title="Driver"
        label="Driver"
        dense
        class="col-grow"
        @update:model-value="(link) => replaceActuator(channel, link)"
      />
    </div>
  </div>
</template>
