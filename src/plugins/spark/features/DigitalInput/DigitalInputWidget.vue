<script setup lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { setExclusiveChannelActuator } from '@/plugins/spark/utils/configuration';
import { ChannelCapabilities, DigitalInputBlock } from 'brewblox-proto/ts';

const { context } = useContext.setup();
const { serviceId, block, patchBlock } =
  useBlockWidget.setup<DigitalInputBlock>();
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <CardWarning v-if="!block.data.hwDevice.id || !block.data.channel">
      <template #message>
        <span>Digital Input has no channel selected.</span>
      </template>
    </CardWarning>

    <div class="widget-body column">
      <LabeledField
        class="col"
        tag-class="full-width row justify-center"
      >
        <DigitalStateButton
          :model-value="block.data.state"
          class="col-auto"
          disable
        />
      </LabeledField>
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
          :capabilities="ChannelCapabilities.CHAN_SUPPORTS_DIGITAL_INPUT"
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
      </div>
    </template>
  </Card>
</template>
