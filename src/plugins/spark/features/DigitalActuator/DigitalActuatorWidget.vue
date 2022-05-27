<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import {
  Block,
  BlockType,
  DigitalActuatorBlock,
  DS2408Block,
  DS2408ConnectMode,
} from '@/plugins/spark/types';
import { channelName } from '@/plugins/spark/utils/formatting';
import { IoArrayBlock } from '@/shared-types';
import { makeTypeFilter } from '@/utils/functional';
import { matchesType } from '@/utils/objects';

import { useSparkStore } from '../../store';

interface Claim {
  driverId: string;
  channelId: number;
}

function targetFilter(b: Block): boolean {
  // Special exception for DS2408 targets
  // They are only compatible in actuator mode
  if (matchesType<DS2408Block>(BlockType.DS2408, b)) {
    return b.data.connectMode === DS2408ConnectMode.CONNECT_ACTUATOR;
  }
  // Filter is in addition to the default compatibility check
  return true;
}

const actuatorFilter = makeTypeFilter<DigitalActuatorBlock>(
  BlockType.DigitalActuator,
);

export default defineComponent({
  name: 'DigitalActuatorWidget',
  setup() {
    const sparkStore = useSparkStore();
    const { inDialog, context } = useContext.setup();
    const { serviceId, block, saveBlock, isDriven, limitations } =
      useBlockWidget.setup<DigitalActuatorBlock>();

    const hwBlock = computed<IoArrayBlock | null>(() =>
      sparkStore.blockById(serviceId, block.value.data.hwDevice.id),
    );

    const claims = computed<Claim[]>(() => {
      if (!hwBlock.value) {
        return [];
      }
      const targetId = hwBlock.value.id;
      return sparkStore
        .blocksByService(serviceId)
        .filter(actuatorFilter)
        .filter((b) => b.id !== block.value.id)
        .filter((b) => b.data.hwDevice.id === targetId)
        .map((b) => ({ driverId: b.id, channelId: b.data.channel }));
    });

    const channelOpts = computed<SelectOption<number>[]>(() => {
      if (!hwBlock.value) {
        return [{ value: 0, label: 'Not set' }];
      }
      const targetBlock = hwBlock.value;
      return [
        { value: 0, label: 'Not set' },
        ...targetBlock.data.channels.map((channel) => {
          const claim = claims.value.find((c) => c.channelId === channel.id);
          const name = channelName(targetBlock, channel.id) ?? 'Unknown';
          const desc = claim ? `${name} (replace ${claim.driverId})` : name;
          return { value: channel.id, label: desc };
        }),
      ];
    });

    async function claimChannel(channelId: number): Promise<void> {
      if (block.value.data.channel === channelId) {
        return;
      }
      const claim = claims.value.find((c) => c.channelId === channelId);
      if (claim) {
        const driver = sparkStore.blockById<DigitalActuatorBlock>(
          serviceId,
          claim.driverId,
        )!;
        driver.data.channel = 0;
        await sparkStore.saveBlock(driver);
      }
      block.value.data.channel = channelId;
      await saveBlock();
    }

    return {
      inDialog,
      context,
      serviceId,
      block,
      saveBlock,
      isDriven,
      limitations,
      channelOpts,
      claimChannel,
      targetFilter,
    };
  },
});
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <CardWarning v-if="!block.data.hwDevice.id || !block.data.channel">
        <template #message>
          <span>Digital Actuator has no channel selected.</span>
        </template>
      </CardWarning>

      <div class="widget-body row">
        <LabeledField
          class="col"
          tag-class="full-width row justify-center"
        >
          <DigitalStateButton
            :model-value="block.data.desiredState"
            :pending="block.data.state !== block.data.desiredState"
            :pending-reason="limitations"
            :disable="isDriven"
            dense
            class="col-auto"
            @update:model-value="
              (v) => {
                block.data.desiredState = v;
                saveBlock();
              }
            "
          />
        </LabeledField>

        <template v-if="context.mode === 'Full'">
          <div class="col-break" />

          <LinkField
            :model-value="block.data.hwDevice"
            :service-id="serviceId"
            :creatable="false"
            :block-filter="targetFilter"
            title="Pin Array"
            label="Target Pin Array"
            class="col-grow"
            @update:model-value="
              (v) => {
                block.data.hwDevice = v;
                block.data.channel = 0;
                saveBlock();
              }
            "
          />
          <SelectField
            :model-value="block.data.channel"
            :options="channelOpts"
            :readonly="!block.data.hwDevice.id"
            title="Pin Channel"
            label="Pin Channel"
            class="col-grow"
            @update:model-value="claimChannel"
          />
          <LabeledField
            label="Invert"
            class="col-grow"
          >
            <q-toggle
              :model-value="block.data.invert"
              dense
              @update:model-value="
                (v) => {
                  block.data.invert = v;
                  saveBlock();
                }
              "
            />
          </LabeledField>
        </template>

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
  </PreviewCard>
</template>
