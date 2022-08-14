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
      <LabeledField
        label="State"
        class="col-grow"
      >
        <DigitalStateButton
          :model-value="block.data.desiredState"
          :pending="block.data.state !== block.data.desiredState"
          :pending-reason="limitations"
          :disable="isClaimed"
          @update:model-value="(v) => patchBlock({ desiredState: v })"
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
      <ConstraintsField
        :model-value="block.data.constrainedBy"
        :service-id="serviceId"
        type="digital"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ constrainedBy: v })"
      />
    </div>
  </div>
</template>
