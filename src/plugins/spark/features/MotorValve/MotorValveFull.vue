<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { setExclusiveChannelActuator } from '@/plugins/spark/utils/configuration';
import { ChannelCapabilities, MotorValveBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MotorValveFull',
  setup() {
    const { serviceId, block, patchBlock, limitations, isClaimed } =
      useBlockWidget.setup<MotorValveBlock>();

    return {
      ChannelCapabilities,
      setExclusiveChannelActuator,
      serviceId,
      block,
      patchBlock,
      limitations,
      isClaimed,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <LabeledField
        label="State"
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
        :model-value="block.data.valveState"
        label="Valve State"
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

      <div class="col-break" />

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
  </div>
</template>
