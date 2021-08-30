<script lang="ts">
import set from 'lodash/set';
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
import { OneWireGpioModuleBlock } from '@/shared-types';
import { makeTypeFilter } from '@/utils/functional';
import { matchesType } from '@/utils/objects';

interface ClaimDict {
  [channel: number]: string; // block ID of driver
}

const actuatorFilter = makeTypeFilter<DigitalActuatorBlock>(
  BlockType.DigitalActuator,
);

export default defineComponent({
  name: 'DigitalActuatorWidget',
  setup() {
    const { inDialog, context } = useContext.setup();
    const { serviceId, sparkModule, block, saveBlock, isDriven, limitations } =
      useBlockWidget.setup<DigitalActuatorBlock>();

    const hwBlock = computed<Block | null>(() =>
      sparkModule.blockById(block.value.data.hwDevice.id),
    );

    const claimedChannels = computed<ClaimDict>(() => {
      if (!hwBlock.value) {
        return {};
      }
      const targetId = hwBlock.value.id;
      return sparkModule.blocks
        .filter(actuatorFilter)
        .filter((block) => block.data.hwDevice.id === targetId)
        .reduce((acc, b) => set(acc, b.data.channel, b.id), {});
    });

    function pinOptName(idx: number): string {
      const driver = claimedChannels.value[idx + 1];
      const [name] = Object.keys(hwBlock.value!.data.pins[idx]);
      return driver && driver !== block.value.id
        ? `${name} (replace '${driver}')`
        : name;
    }

    const channelOpts = computed<SelectOption<number>[]>(() => {
      const opts = [{ label: 'Not set', value: 0 }];
      if (hwBlock.value) {
        if (
          matchesType<OneWireGpioModuleBlock>(
            BlockType.OneWireGpioModule,
            hwBlock.value,
          )
        ) {
          opts.push(
            ...hwBlock.value.data.channels.map((c) => ({
              label: `${c.deviceType} ${c.pinsMask.toString(2)}`,
              value: c.id,
            })),
          );
        } else {
          opts.push(
            ...Object.keys(
              hwBlock.value.data.pins || hwBlock.value.data.channels,
            ).map((k, idx) => ({ label: pinOptName(idx), value: idx + 1 })),
          );
        }
      }
      return opts;
    });

    async function claimChannel(pinId: number): Promise<void> {
      if (block.value.data.channel === pinId) {
        return;
      }
      const currentDriverId = claimedChannels.value[pinId] ?? null;
      if (currentDriverId) {
        const currentDriverBlock =
          sparkModule.blockById<DigitalActuatorBlock>(currentDriverId)!;
        currentDriverBlock.data.channel = 0;
        await sparkModule.saveBlock(currentDriverBlock);
      }
      block.value.data.channel = pinId;
      await saveBlock();
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
        <LabeledField class="col" tag-class="full-width row justify-center">
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
          <LabeledField label="Invert" class="col-grow">
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
