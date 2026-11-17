<script setup lang="ts">
import {
  BlockIntfType,
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
import {
  claimedChannels,
  ioChannelClaimers,
  setExclusiveIoChannelClaimer,
} from '@/plugins/spark/utils/configuration';
import { claimReason } from '@/plugins/spark/utils/formatting';
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

// A valve refused one of its four channels takes none and sends no valve state
const drivesNothing = computed<string | null>(() => {
  const { hwDevice, channel, valveState } = block.value.data;
  if (!hwDevice.id || !channel || valveState != null) {
    return null;
  }
  if (!sparkStore.blockByLink(serviceId, hwDevice)) {
    return `its device ${hwDevice.id} is gone`;
  }
  const holders = ioChannelClaimers(
    serviceId,
    hwDevice,
    claimedChannels(block.value.type, channel),
    block.value.id,
  ).map((b) => b.id);
  if (holders.length > 1) {
    return `${holders.join(', ')} hold some of its channels`;
  }
  return holders.length ? `${holders[0]} holds one of its channels` : null;
});

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
    <CardWarning v-else-if="drivesNothing">
      <template #message>
        <span>This Motor Valve drives nothing: {{ drivesNothing }}.</span>
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
          :disable-reason="claimReason(block)"
          @update:model-value="(v) => patchBlock({ storedState: v })"
        />
      </LabeledField>
      <LabeledField
        :model-value="valveLabel"
        label="Valve state"
        class="col-grow"
      />

      <div class="col-break" />

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
          :claimer="block"
          :model-value="{
            hwDevice: block.data.hwDevice,
            channel: block.data.channel,
          }"
          :service-id="serviceId"
          :capabilities="ChannelCapabilities.CHAN_SUPPORTS_BIDIRECTIONAL"
          :device-type="BlockIntfType.DS2408Interface"
          clearable
          title="Target channel"
          label="Channel"
          class="col-grow"
          @update:model-value="
            ({ hwDevice, channel }) =>
              setExclusiveIoChannelClaimer(block, hwDevice, channel)
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
