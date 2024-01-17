<script setup lang="ts">
import {
  ChannelCapabilities,
  MotorValveBlock,
  Spark3PinsBlock,
  ValveState,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_VALVE_STATE } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { setExclusiveChannelActuator } from '@/plugins/spark/utils/configuration';
import { getSpark3PinsBlock } from '@/plugins/spark/utils/system';

const sparkStore = useSparkStore();
const { context, inDialog } = useContext.setup();
const { serviceId, block, limitations, isClaimed, patchBlock } =
  useBlockWidget.setup<MotorValveBlock>();

// Spark 2 pins have no support for toggling 12V
const spark3Pins = computed<Spark3PinsBlock | null>(
  () => getSpark3PinsBlock(serviceId) ?? null,
);

const disabled12V = computed<boolean>(
  () => spark3Pins.value?.data.enableIoSupply12V === false,
);

const valveLabel = computed<string>(
  () =>
    ENUM_LABELS_VALVE_STATE[
      block.value.data.valveState ?? ValveState.VALVE_UNKNOWN
    ],
);

function enable12V(): void {
  sparkStore.patchBlock(spark3Pins.value, { enableIoSupply12V: true });
}
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <CardWarning v-if="disabled12V">
      <template #message>
        <span>12V is disabled.</span>
      </template>
      <template #actions>
        <q-btn
          text-color="white"
          flat
          label="Enable 12V"
          @click="enable12V"
        />
      </template>
    </CardWarning>
    <CardWarning v-else-if="!block.data.hwDevice.id || !block.data.channel">
      <template #message>
        <span>This Motor Valve has no channel selected.</span>
      </template>
    </CardWarning>

    <div class="widget-body row">
      <LabeledField
        label="Digital state"
        class="col-grow"
      >
        <DigitalStateButton
          :model-value="block.data.desiredState"
          :pending="block.data.state !== block.data.desiredState"
          :pending-reason="limitations"
          :disable="isClaimed"
          @update:model-value="(v) => patchBlock({ storedState: v })"
        />
      </LabeledField>
      <LabeledField
        :model-value="valveLabel"
        label="Valve state"
        class="col-grow"
      />

      <div class="col-break" />

      <ClaimIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
      <DigitalConstraintsField
        :model-value="block.data.constraints"
        :service-id="serviceId"
        class="col-grow"
      />
    </div>

    <template v-if="context.mode === 'Full'">
      <q-separator inset />

      <div class="widget-body row">
        <ChannelSelectField
          :model-value="{
            hwDevice: block.data.hwDevice,
            channel: block.data.channel,
          }"
          :service-id="serviceId"
          :capabilities="ChannelCapabilities.CHAN_SUPPORTS_BIDIRECTIONAL"
          clearable
          title="Target channel"
          label="Channel"
          class="col-grow"
          @update:model-value="
            ({ hwDevice, channel }) =>
              setExclusiveChannelActuator(block, hwDevice, channel)
          "
        />

        <div class="col-break" />

        <DigitalConstraintsEditor
          :model-value="block.data.constraints"
          :service-id="serviceId"
          @update:model-value="(v) => patchBlock({ constraints: v })"
        />
      </div>
    </template>
  </PreviewCard>
</template>
