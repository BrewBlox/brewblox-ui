<script lang="ts">
import set from 'lodash/set';
import { computed, defineComponent, PropType } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { Block, BlockType, ChannelMapping, MotorValveBlock } from '@/plugins/spark/types';
import { DigitalState, IoChannel, IoPin } from '@/plugins/spark/types';
import { isBlockDriven } from '@/plugins/spark/utils';
import { Link } from '@/shared-types';
import { bloxLink } from '@/utils/bloxfield';
import { makeObjectSorter, makeTypeFilter } from '@/utils/functional';


interface EditableChannel extends IoChannel {
  id: string;
  nid: number;
  name: string;
  driver: MotorValveBlock | null;
}

interface ValveArrayBlock extends Block {
  data: {
    pins: IoPin[];
  };
}

interface ChannelClaims {
  [nid: number]: MotorValveBlock
}

const motorValveFilter = makeTypeFilter<MotorValveBlock>(BlockType.MotorValve);

export default defineComponent({
  name: 'ValveArray',
  props: {
    mapping: {
      type: Array as PropType<ChannelMapping[]>,
      default: () => [],
    },
  },
  setup(props) {
    const {
      serviceId,
      sparkModule,
      block,
    } = useBlockWidget.setup<ValveArrayBlock>();

    const claimedChannels = computed<ChannelClaims>(
      () => sparkModule
        .blocks
        .filter(motorValveFilter)
        .filter(v => v.data.hwDevice.id === block.value.id)
        .reduce((acc, v) => set(acc, v.data.startChannel, v), {}),
    );

    function mappedName(id: string): string | null {
      return props.mapping.length
        ? props.mapping.find(m => m.id === id)?.name ?? null
        : id;
    }

    const channels = computed<EditableChannel[]>(
      () => block.value.data.pins
        .reduce(
          (acc: EditableChannel[], pin: IoPin, idx: number) => {
            const nid = idx + 1;
            const [[id, channel]] = Object.entries(pin);
            const name = mappedName(id);
            if (name) {
              const driver = claimedChannels.value[nid] ?? null;
              acc.push({ ...channel, id, nid, name, driver });
            }
            return acc;
          },
          [],
        )
        .sort(makeObjectSorter('name')),
    );

    function driverLink(channel: EditableChannel): Link {
      return bloxLink(channel.driver?.id ?? null, BlockType.MotorValve);
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
        newDriver.data.startChannel = channel.nid;
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
      channels,
      driverDriven,
      driverLimitedBy,
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
