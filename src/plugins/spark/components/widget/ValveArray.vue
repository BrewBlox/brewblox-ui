<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { Block, BlockType, MotorValveBlock } from '@/plugins/spark/types';
import { DigitalState, IoChannel } from '@/plugins/spark/types';
import {
  channelName,
  isBlockDriven,
  limitationString,
} from '@/plugins/spark/utils';
import { IoArrayBlock, Link } from '@/shared-types';
import { makeTypeFilter } from '@/utils/functional';
import { bloxLink } from '@/utils/link';

interface EditableChannel extends IoChannel {
  name: string;
  driver: MotorValveBlock | null;
}

interface Claim {
  driverId: string;
  channelId: number;
}

const motorValveFilter = makeTypeFilter<MotorValveBlock>(BlockType.MotorValve);

export default defineComponent({
  name: 'ValveArray',
  setup() {
    const { serviceId, sparkModule, block } =
      useBlockWidget.setup<IoArrayBlock>();

    const claims = computed<Claim[]>(() =>
      sparkModule.blocks
        .filter(motorValveFilter)
        .filter((b) => b.data.hwDevice.id === block.value.id)
        .map((b) => ({ driverId: b.id, channelId: b.data.startChannel })),
    );

    const channels = computed<EditableChannel[]>(() =>
      block.value.data.channels.map((channel: IoChannel) => {
        const { id } = channel;
        const claim = claims.value.find((c) => c.channelId === id);
        const name = channelName(block.value, id) ?? 'Unknown';
        const driver = sparkModule.blockById<MotorValveBlock>(claim?.driverId);
        return { id, driver, name };
      }),
    );

    function driverLink(channel: EditableChannel): Link {
      return bloxLink(channel.driver?.id ?? null, BlockType.MotorValve);
    }

    function driverDriven(block: Block): boolean {
      return isBlockDriven(block);
    }

    function driverLimitations(block: Block): string | null {
      return limitationString(
        sparkModule.limitations.filter((v) => v.target === block.id),
      );
    }

    async function saveDriver(
      channel: EditableChannel,
      link: Link,
    ): Promise<void> {
      if (channel.driver && channel.driver.id === link.id) {
        return;
      }
      if (channel.driver) {
        channel.driver.data.startChannel = 0;
        await sparkModule.saveBlock(channel.driver);
      }
      if (link.id) {
        const newDriver = sparkModule.blockById<MotorValveBlock>(link.id)!;
        const { id, type } = block.value;
        newDriver.data.hwDevice = bloxLink(id, type);
        newDriver.data.startChannel = channel.id;
        await sparkModule.saveBlock(newDriver);
      }
    }

    async function saveState(
      channel: EditableChannel,
      state: DigitalState,
    ): Promise<void> {
      if (channel.driver) {
        channel.driver.data.desiredState = state;
        await sparkModule.saveBlock(channel.driver);
      }
    }

    return {
      channels,
      driverDriven,
      driverLimitations,
      saveState,
      driverLink,
      serviceId,
      saveDriver,
    };
  },
});
</script>

<template>
  <div class="widget-body column">
    <div
      v-for="channel in channels"
      :key="`channel-${channel.id}`"
      class="
        col
        row
        q-gutter-x-sm q-gutter-y-xs q-mt-none
        items-stretch
        justify-start
      "
    >
      <div class="col-auto q-pt-sm self-baseline text-h6 min-width-sm">
        {{ channel.name }}
      </div>
      <div class="col-auto row items-baseline min-width-sm">
        <DigitalStateButton
          v-if="channel.driver"
          :disable="driverDriven(channel.driver)"
          :model-value="channel.driver.data.desiredState"
          :pending="
            channel.driver.data.state !== channel.driver.data.desiredState
          "
          :pending-reason="driverLimitations(channel.driver)"
          class="col-auto self-center"
          @update:model-value="(v) => saveState(channel, v)"
        />
        <div v-else class="darkened text-italic q-pa-sm">
          Not set
        </div>
      </div>
      <LinkField
        :model-value="driverLink(channel)"
        :service-id="serviceId"
        title="Driver"
        label="Driver"
        dense
        class="col-grow"
        @update:model-value="(link) => saveDriver(channel, link)"
      />
    </div>
  </div>
</template>
