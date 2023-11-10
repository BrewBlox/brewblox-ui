<script setup lang="ts">
import {
  ChannelCapabilities,
  DigitalInputBlock,
  ToggleBehavior,
} from 'brewblox-proto/ts';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { setExclusiveChannelActuator } from '@/plugins/spark/utils/configuration';

const behaviorOpts: SelectOption<ToggleBehavior>[] = [
  { value: ToggleBehavior.DIRECT, label: 'Direct' },
  { value: ToggleBehavior.ALTERNATING, label: 'Toggle ON/OFF' },
];

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

        <div class="col-break" />

        <DurationField
          :model-value="block.data.minActiveTime"
          :disable="block.data.behavior === ToggleBehavior.ALTERNATING"
          title="Minimum active time"
          label="Minimum active time"
          message="
            If the input channel turns ON, the Input block will stay ON for at least this period.
            If the input channel turns OFF after the minimum active time has elapsed,
            the Input block turns OFF immediately.
          "
          class="col-grow"
          @update:model-value="(v) => patchBlock({ minActiveTime: v })"
        />

        <SelectField
          :model-value="block.data.behavior"
          :options="behaviorOpts"
          title="Behavior"
          label="Behavior"
          message="
            <p>
              The Input block can respond to the input channel in two ways:
            </p>
            <ul>
              <li>
                <b>Direct:</b> the state of the Input block is the same as the input channel.
              </li>
              <li>
                <b>Toggle ON/OFF:</b> the state of the input block is separate from
                the input channel. The input channel is a toggle button for the input block.
                Push to turn ON, push again to turn OFF.
              </li>
            </ul>
          "
          html
          class="col-grow"
          @update:model-value="(v) => patchBlock({ behavior: v })"
        />
      </div>
    </template>
  </Card>
</template>
