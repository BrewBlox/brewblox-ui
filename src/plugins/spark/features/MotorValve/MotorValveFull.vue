<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import {
  Block,
  BlockType,
  DS2408Block,
  DS2408ConnectMode,
  MotorValveBlock,
} from '@/plugins/spark/types';
import { makeTypeFilter } from '@/utils/functional';
import { matchesType } from '@/utils/objects';

import { useSparkStore } from '../../store';

interface Claim {
  driverId: string;
  channelId: number;
}

function targetFilter(b: Block): boolean {
  // DS2408 is only valid if in valve mode
  if (matchesType<DS2408Block>(BlockType.DS2408, b)) {
    return b.data.connectMode === DS2408ConnectMode.CONNECT_VALVE;
  }
  // Filter is in addition to the default compatibility check
  return true;
}

const motorValveFilter = makeTypeFilter<MotorValveBlock>(BlockType.MotorValve);

export default defineComponent({
  name: 'MotorValveFull',
  setup() {
    const sparkStore = useSparkStore();
    const { serviceId, block, saveBlock, limitations, isDriven } =
      useBlockWidget.setup<MotorValveBlock>();

    const hwBlock = computed<DS2408Block | null>(() =>
      sparkStore.blockByLink(serviceId, block.value.data.hwDevice),
    );

    const claims = computed<Claim[]>(() => {
      if (!hwBlock.value) {
        return [];
      }
      const targetId = hwBlock.value.id;
      return sparkStore
        .blocksByService(serviceId)
        .filter(motorValveFilter)
        .filter((b) => b.id !== block.value.id)
        .filter((b) => b.data.hwDevice.id === targetId)
        .map((b) => ({ driverId: b.id, channelId: b.data.startChannel }));
    });

    function driverStr(startChannel: number): string {
      const claim = claims.value.find((c) => c.channelId === startChannel);
      return claim ? ` (replace '${claim.driverId}')` : '';
    }

    const channelOpts = computed<SelectOption<number>[]>(() => [
      { value: 0, label: 'Not set' },
      { value: 5, label: `A${driverStr(5)}` },
      { value: 1, label: `B${driverStr(1)}` },
    ]);

    async function claimChannel(channelId: number): Promise<void> {
      if (block.value.data.startChannel === channelId) {
        return;
      }
      const claim = claims.value.find((c) => c.channelId === channelId);
      if (claim) {
        const driver = sparkStore.blockById<MotorValveBlock>(
          serviceId,
          claim.driverId,
        )!;
        driver.data.startChannel = 0;
        await sparkStore.saveBlock(driver);
      }
      block.value.data.startChannel = channelId;
      await saveBlock();
    }

    return {
      serviceId,
      block,
      saveBlock,
      limitations,
      isDriven,
      channelOpts,
      claimChannel,
      targetFilter,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <LinkField
        :model-value="block.data.hwDevice"
        :service-id="serviceId"
        :creatable="false"
        :block-filter="targetFilter"
        title="Target DS2408 Chip"
        label="Target DS2408 Chip"
        class="col-grow"
        @update:model-value="
          (v) => {
            block.data.hwDevice = v;
            block.data.startChannel = 0;
            saveBlock();
          }
        "
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
          :pending-reason="limitations"
          :disable="isDriven"
          @update:model-value="
            (v) => {
              block.data.desiredState = v;
              saveBlock();
            }
          "
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
        @update:model-value="
          (v) => {
            block.data.constrainedBy = v;
            saveBlock();
          }
        "
      />
    </div>
  </div>
</template>
