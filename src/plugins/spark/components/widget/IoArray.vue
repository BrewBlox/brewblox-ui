<script setup lang="ts">
import {
  Block,
  BlockIntfType,
  BlockOrIntfType,
  BlockType,
  ChannelCapabilities,
  DigitalActuatorBlock,
  DigitalState,
  FastPwmBlock,
  IoArrayInterfaceBlock,
  IoChannel,
  Link,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { PWM_SELECT_OPTIONS } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { setExclusiveChannelActuator } from '@/plugins/spark/utils/configuration';
import {
  channelName,
  prettyLimitations,
} from '@/plugins/spark/utils/formatting';
import { ifCompatible } from '@/plugins/spark/utils/info';
import { createDialog } from '@/utils/dialog';
import { bloxLink } from '@/utils/link';

interface EditableChannel extends IoChannel {
  name: string;
  digitalActuator: DigitalActuatorBlock | null;
  pwmActuator: FastPwmBlock | null;
  actuatorClaimed: boolean;
  compatibleTypes: BlockOrIntfType[];
}

const sparkStore = useSparkStore();
const { serviceId, block } = useBlockWidget.setup<IoArrayInterfaceBlock>();

const channels = computed<EditableChannel[]>(() =>
  block.value.data.channels.map((c): EditableChannel => {
    const actuator = sparkStore.blockByLink(serviceId, c.claimedBy);
    const compatibleTypes: BlockOrIntfType[] = [];
    if (c.capabilities & ChannelCapabilities.CHAN_SUPPORTS_DIGITAL_OUTPUT) {
      compatibleTypes.push(BlockOrIntfType.DigitalActuator);
    }
    if (c.capabilities & ChannelCapabilities.CHAN_SUPPORTS_PWM_100HZ) {
      compatibleTypes.push(BlockOrIntfType.FastPwm);
    }
    return {
      ...c,
      compatibleTypes,
      name: channelName(block.value, c.id) ?? 'Unknown',
      digitalActuator: ifCompatible(
        actuator,
        BlockIntfType.ActuatorDigitalInterface,
      ),
      pwmActuator: ifCompatible(actuator, BlockType.FastPwm),
      actuatorClaimed: actuator?.data.claimedBy.id != null,
    };
  }),
);

function actuatorLimitations(block: Block): string | null {
  return prettyLimitations(block.data.constraints) || null;
}

async function replaceActuator(
  channel: EditableChannel,
  link: Link,
): Promise<void> {
  setExclusiveChannelActuator(
    sparkStore.blockByLink(serviceId, link),
    bloxLink(block.value.id),
    channel.id,
  );
}

async function updateDigitalState(
  channel: EditableChannel,
  storedState: DigitalState,
): Promise<void> {
  await sparkStore.patchBlock(channel.digitalActuator, { storedState });
}

async function updatePwmSetting(channel: EditableChannel): Promise<void> {
  if (channel.pwmActuator) {
    createDialog({
      component: 'SliderDialog',
      componentProps: {
        modelValue: channel.pwmActuator.data.storedSetting,
        title: 'Edit PWM setting',
        label: 'Pwm %',
        min: 0,
        max: 100,
        quickActions: PWM_SELECT_OPTIONS,
      },
    }).onOk((storedSetting) =>
      sparkStore.patchBlock(channel.pwmActuator, { storedSetting }),
    );
  }
}
</script>

<template>
  <div class="widget-body column">
    <div
      v-for="channel in channels"
      :key="channel.id"
      class="col row q-gutter-x-sm q-gutter-y-xs q-mt-none items-stretch justify-start"
    >
      <div class="col-auto q-pt-sm self-baseline text-h6 min-width-md">
        {{ channel.name }}
      </div>
      <div class="col-auto row items-baseline min-width-sm">
        <DigitalStateButton
          v-if="channel.digitalActuator"
          :disable="channel.actuatorClaimed"
          :model-value="channel.digitalActuator.data.desiredState"
          :pending="
            channel.digitalActuator.data.state !==
            channel.digitalActuator.data.desiredState
          "
          :pending-reason="actuatorLimitations(channel.digitalActuator)"
          class="col-auto self-center"
          @update:model-value="(v) => updateDigitalState(channel, v)"
        />
        <div
          v-else-if="channel.pwmActuator"
          class="col-auto clickable rounded-borders depth-1 text-bold"
        >
          <q-btn
            unelevated
            :disable="channel.actuatorClaimed"
            :label="`${channel.pwmActuator.data.desiredSetting}%`"
            @click="updatePwmSetting(channel)"
          />
        </div>
        <div
          v-else
          class="darkened text-italic q-pa-sm"
        >
          Not set
        </div>
      </div>
      <LinkField
        :model-value="channel.claimedBy"
        :service-id="serviceId"
        :compatible="channel.compatibleTypes"
        title="Actuator"
        label="Actuator"
        dense
        class="col-grow"
        @update:model-value="(link) => replaceActuator(channel, link)"
      />
    </div>
  </div>
</template>
