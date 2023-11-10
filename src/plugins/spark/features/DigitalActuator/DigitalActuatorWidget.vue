<script setup lang="ts">
import {
  ChannelCapabilities,
  DigitalActuatorBlock,
  IoArrayInterfaceBlock,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_TRANSITION_PRESET } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { setExclusiveChannelActuator } from '@/plugins/spark/utils/configuration';
import { selectable } from '@/utils/collections';
import { prettyQty } from '@/utils/quantity';

const transitionPresetOpts = selectable(ENUM_LABELS_TRANSITION_PRESET);

const sparkStore = useSparkStore();
const { inDialog, context } = useContext.setup();
const { serviceId, block, patchBlock, isClaimed, limitations } =
  useBlockWidget.setup<DigitalActuatorBlock>();

const hwBlock = computed<IoArrayInterfaceBlock | null>(() =>
  sparkStore.blockById(serviceId, block.value.data.hwDevice.id),
);

const softStartSupported = computed<boolean>(() => {
  const channel = hwBlock.value?.data.channels.find(
    (c) => c.id === block.value.data.channel,
  );
  return (
    channel != null &&
    Boolean(channel.capabilities & ChannelCapabilities.CHAN_SUPPORTS_PWM_100HZ)
  );
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
          :disable="isClaimed"
          class="col-auto"
          @update:model-value="(v) => patchBlock({ storedState: v })"
        />
      </LabeledField>

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
          :capabilities="ChannelCapabilities.CHAN_SUPPORTS_DIGITAL_OUTPUT"
          clearable
          title="Target channel"
          label="Channel"
          class="col-grow"
          @update:model-value="
            ({ hwDevice, channel }) =>
              setExclusiveChannelActuator(block, hwDevice, channel)
          "
        />
        <LabeledField
          label="Invert"
          class="col-grow"
        >
          <q-toggle
            :model-value="block.data.invert"
            dense
            @update:model-value="(v) => patchBlock({ invert: v })"
          />
        </LabeledField>

        <div class="col-break" />

        <template v-if="softStartSupported">
          <SelectField
            :model-value="block.data.transitionDurationPreset"
            :options="transitionPresetOpts"
            title="Soft start preset"
            label="Soft start preset"
            class="col-grow"
            @update:model-value="
              (v) => patchBlock({ transitionDurationPreset: v })
            "
          />
          <DurationField
            v-if="
              block.data.transitionDurationPreset ===
              TransitionDurationPreset.ST_CUSTOM
            "
            :model-value="block.data.transitionDurationSetting"
            title="Custom soft start duration"
            label="Soft start"
            class="col-grow"
            @update:model-value="
              (v) => patchBlock({ transitionDurationSetting: v })
            "
          />
          <LabeledField
            v-else
            label="Soft start"
            class="col-grow"
          >
            {{ prettyQty(block.data.transitionDurationValue) }}
          </LabeledField>
        </template>
        <template v-else>
          <LabeledField
            label="Soft start"
            class="col-grow"
          >
            Soft start is not supported on target channel
          </LabeledField>
        </template>

        <div class="col-break" />

        <DigitalConstraintsEditor
          :model-value="block.data.constraints"
          :service-id="serviceId"
          class="col-auto"
          @update:model-value="(v) => patchBlock({ constraints: v })"
        />
      </div>
    </template>
  </PreviewCard>
</template>
