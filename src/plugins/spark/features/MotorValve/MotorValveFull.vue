<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { DS2408StartChannels } from '@/plugins/spark/getters';
import { Block, BlockType, DS2408Block, DS2408ConnectMode, MotorValveBlock } from '@/plugins/spark/types';
import { typeMatchFilter } from '@/utils/functional';
import { mutate } from '@/utils/functional';

interface ClaimDict {
  [startChannel: number]: string; // block ID
}

export default defineComponent({
  name: 'MotorValveFull',
  setup() {
    const {
      serviceId,
      sparkModule,
      block,
      saveBlock,
      constrainers,
      isDriven,
    } = useBlockWidget.setup<MotorValveBlock>();

    const hwBlock = computed<DS2408Block | null>(
      () => sparkModule.blockById(block.value.data.hwDevice.id),
    );

    const claimedChannels = computed<ClaimDict>(
      () => {
        if (!hwBlock.value) {
          return {};
        }
        const targetId = hwBlock.value.id;
        return sparkModule
          .blocks
          .filter(typeMatchFilter<MotorValveBlock>(BlockType.MotorValve))
          .filter(block => block.data.hwDevice.id === targetId)
          .reduce((acc: ClaimDict, b) => mutate(acc, b.data.startChannel, b.id), {});
      },
    );

    function driverStr(startChannel: number): string {
      const driver = claimedChannels.value[startChannel];
      return driver && driver !== block.value.id
        ? ` (replace '${driver}')`
        : '';
    }

    const channelOpts = computed<SelectOption<number>[]>(
      () => [
        { label: 'Not set', value: 0 },
        ...DS2408StartChannels
          .map(({ name, nid }) => ({
            label: `${name}${driverStr(nid)}`,
            value: nid,
          })),
      ],
    );

    async function claimChannel(pinId: number): Promise<void> {
      if (block.value.data.startChannel === pinId) {
        return;
      }
      const currentDriverId = claimedChannels.value[pinId] ?? null;
      if (currentDriverId) {
        const currentDriverBlock = sparkModule.blockById<MotorValveBlock>(currentDriverId)!;
        currentDriverBlock.data.startChannel = 0;
        await sparkModule.saveBlock(currentDriverBlock);
      }
      block.value.data.startChannel = pinId;
      await saveBlock();
    }

    function filterDS2408(b: Block): boolean {
      return b.type !== BlockType.DS2408
        || (b as DS2408Block).data.connectMode === DS2408ConnectMode.CONNECT_VALVE;
    }

    return {
      serviceId,
      block,
      saveBlock,
      constrainers,
      isDriven,
      channelOpts,
      claimChannel,
      filterDS2408,
    };
  },
});
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <LinkField
        :model-value="block.data.hwDevice"
        :service-id="serviceId"
        :creatable="false"
        :block-filter="filterDS2408"
        title="Target DS2408 Chip"
        label="Target DS2408 Chip"
        class="col-grow"
        @update:model-value="v => { block.data.hwDevice = v; block.data.startChannel = 0; saveBlock(); }"
      />
      <SelectField
        :model-value="block.data.startChannel"
        :options="channelOpts"
        :readonly="!block.data.hwDevice.id"
        title="DS2408 Channel"
        label="DS2408 Channel"
        class="col-grow"
        @update:model-value="claimChannel"
      />
      <div class="col-break" />
      <LabeledField
        label="State"
        class="col-grow"
      >
        <DigitalStateButton
          :model-value="block.data.desiredState"
          :pending="block.data.state !== block.data.desiredState"
          :pending-reason="constrainers"
          :disable="isDriven"
          @update:model-value="v => { block.data.desiredState = v; saveBlock(); }"
        />
      </LabeledField>
      <LabeledField
        :model-value="block.data.valveState"
        label="Valve State"
        class="col-grow"
      />
      <div class="col-break" />
      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
      <ConstraintsField
        :model-value="block.data.constrainedBy"
        :service-id="serviceId"
        type="digital"

        class="col-grow"
        @update:model-value="v => { block.data.constrainedBy = v; saveBlock(); }"
      />
    </div>
  </div>
</template>
