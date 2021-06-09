<script lang="ts">
import set from 'lodash/set';
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { BlockType, DigitalActuatorBlock } from '@/plugins/spark/types';
import { Block, DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';
import { isBlockDriven } from '@/plugins/spark/utils';
import { Link } from '@/shared-types';
import { bloxLink } from '@/utils/bloxfield';
import { makeObjectSorter, makeTypeFilter } from '@/utils/functional';

interface EditableChannel extends IoChannel {
  id: number;
  name: string;
  driver: DigitalActuatorBlock | null;
}

interface IoArrayBlock extends Block {
  data: {
    pins: IoPin[];
  };
}

interface ClaimDict {
  [channel: number]: string; // block ID of driver
}

export default defineComponent({
  name: 'IoArray',
  setup() {
    const {
      serviceId,
      sparkModule,
      block,
    } = useBlockWidget.setup<IoArrayBlock>();

    const claimedChannels = computed<ClaimDict>(
      () => sparkModule
        .blocks
        .filter(makeTypeFilter<DigitalActuatorBlock>(BlockType.DigitalActuator))
        .filter(v => v.data.hwDevice.id === block.value.id)
        .reduce((acc, v) => set(acc, v.data.channel, v.id), {}),
    );

    const channels = computed<EditableChannel[]>(
      () => block.value.data.pins
        .map((pin, idx) => {
          const id = idx + 1;
          const driverId = claimedChannels.value[id];
          const [name] = Object.keys(pin);
          const driver = sparkModule.blockById<DigitalActuatorBlock>(driverId);
          return { ...pin[name], id, driver, name };
        })
        .sort(makeObjectSorter('name')),
    );

    function driverLink(channel: EditableChannel): Link {
      return bloxLink(channel.driver?.id ?? null, BlockType.DigitalActuator);
    }

    function driverDriven(block: Block): boolean {
      return isBlockDriven(block);
    }

    function driverLimitedBy(block: Block): string {
      return sparkModule
        .limiters[block.id]
        ?.join(', ')
        ?? '';
    }

    async function saveDriver(channel: EditableChannel, link: Link): Promise<void> {
      const currentDriver = channel.driver;
      if (currentDriver && currentDriver.id === link.id) {
        return;
      }
      if (currentDriver) {
        currentDriver.data.channel = 0;
        await sparkModule.saveBlock(currentDriver);
      }
      if (link.id) {
        const newDriver = sparkModule.blockById<DigitalActuatorBlock>(link.id)!;
        const { id, type } = block.value;
        newDriver.data.hwDevice = bloxLink(id, type);
        newDriver.data.channel = channel.id;
        await sparkModule.saveBlock(newDriver);
      }
    }

    async function saveState(channel: EditableChannel, state: DigitalState): Promise<void> {
      if (channel.driver) {
        channel.driver.data.desiredState = state;
        await sparkModule.saveBlock(channel.driver);
      }
    }

    return {
      serviceId,
      channels,
      driverDriven,
      driverLimitedBy,
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
          :pending="channel.driver.data.state !== channel.driver.data.desiredState"
          :pending-reason="driverLimitedBy(channel.driver)"
          class="col-auto self-center"
          @update:model-value="v => saveState(channel, v)"
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
        @update:model-value="link => saveDriver(channel, link)"
      />
    </div>
  </div>
</template>
