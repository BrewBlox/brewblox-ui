<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { BlockType, DigitalActuatorBlock } from '@/plugins/spark/types';
import { Block, DigitalState, IoChannel } from '@/plugins/spark/types';
import {
  channelName,
  findLimitations,
  isBlockDriven,
  limitationString,
} from '@/plugins/spark/utils';
import { IoArrayBlock, Link } from '@/shared-types';
import { makeTypeFilter } from '@/utils/functional';
import { bloxLink } from '@/utils/link';

import { useSparkStore } from '../../store';

interface EditableChannel extends IoChannel {
  name: string;
  driver: DigitalActuatorBlock | null;
}

interface Claim {
  driverId: string;
  channelId: number;
}

const actuatorFilter = makeTypeFilter<DigitalActuatorBlock>(
  BlockType.DigitalActuator,
);

export default defineComponent({
  name: 'IoArray',
  setup() {
    const sparkStore = useSparkStore();
    const { serviceId, block } = useBlockWidget.setup<IoArrayBlock>();

    const claims = computed<Claim[]>(() =>
      sparkStore
        .blocksByService(serviceId)
        .filter(actuatorFilter)
        .filter((b) => b.data.hwDevice.id === block.value.id)
        .map((b) => ({ driverId: b.id, channelId: b.data.channel })),
    );

    const channels = computed<EditableChannel[]>(() =>
      block.value.data.channels.map((channel: IoChannel) => {
        const { id } = channel;
        const claim = claims.value.find((c) => c.channelId === id);
        const name = channelName(block.value, id) ?? 'Unknown';
        const driver = sparkStore.blockById<DigitalActuatorBlock>(
          serviceId,
          claim?.driverId,
        );
        return { id, driver, name };
      }),
    );

    function driverLink(channel: EditableChannel): Link {
      return bloxLink(channel.driver?.id ?? null, BlockType.DigitalActuator);
    }

    function driverDriven(block: Block): boolean {
      return isBlockDriven(block);
    }

    function driverLimitations(block: Block): string | null {
      return limitationString(findLimitations(block));
    }

    async function saveDriver(
      channel: EditableChannel,
      link: Link,
    ): Promise<void> {
      const currentDriver = channel.driver;
      if (currentDriver && currentDriver.id === link.id) {
        return;
      }
      if (currentDriver) {
        currentDriver.data.channel = 0;
        await sparkStore.saveBlock(currentDriver);
      }
      if (link.id) {
        const newDriver = sparkStore.blockById<DigitalActuatorBlock>(
          serviceId,
          link.id,
        )!;
        const { id, type } = block.value;
        newDriver.data.hwDevice = bloxLink(id, type);
        newDriver.data.channel = channel.id;
        await sparkStore.saveBlock(newDriver);
      }
    }

    async function saveState(
      channel: EditableChannel,
      state: DigitalState,
    ): Promise<void> {
      if (channel.driver) {
        channel.driver.data.desiredState = state;
        await sparkStore.saveBlock(channel.driver);
      }
    }

    return {
      serviceId,
      channels,
      driverDriven,
      driverLimitations,
      saveState,
      driverLink,
      saveDriver,
    };
  },
});
</script>

<template>
  <div class="widget-body column">
    <div
      v-for="channel in channels"
      :key="channel.id"
      class="col row q-gutter-x-sm q-gutter-y-xs q-mt-none items-stretch justify-start"
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
        <div
          v-else
          class="darkened text-italic q-pa-sm"
        >
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
