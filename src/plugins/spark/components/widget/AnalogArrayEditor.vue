<script setup lang="ts">
import {
  AnalogModuleChannel,
  AnalogSensorType,
  Block,
  BlockOrIntfType,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { ENUM_LABELS_ANALOG_SENSOR_TYPE } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { analogChannelReaders } from '@/plugins/spark/utils/info';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { adcErrorLabel, analogChannelName } from '../../utils/formatting';

interface Props {
  channels: Readonly<AnalogModuleChannel[]>;
  address: BlockAddress;
}
const sparkStore = useSparkStore();

const props = defineProps<Props>();

const existingSensors = computed<{ [channelId: number]: Block[] }>(() => {
  const blocks = sparkStore.blocksByService(props.address.serviceId);
  return props.channels.reduce((acc, channel) => {
    acc[channel.id] = props.address.id
      ? analogChannelReaders(blocks, props.address.id, channel.id)
      : [];
    return acc;
  }, {});
});

function sensorToBlockType(
  sensorType: AnalogSensorType,
): BlockOrIntfType | null {
  if (
    sensorType === AnalogSensorType.ANALOG_SENSOR_TYPE_RTD_2WIRE ||
    sensorType === AnalogSensorType.ANALOG_SENSOR_TYPE_RTD_3WIRE ||
    sensorType === AnalogSensorType.ANALOG_SENSOR_TYPE_RTD_4WIRE
  ) {
    return BlockOrIntfType.TempSensorAnalog;
  }
  return null;
}

function createSensor(sensorType: BlockOrIntfType | null): void {
  if (sensorType == null) {
    return;
  }
  createDialog({
    component: 'BlockWizardDialog',
    componentProps: {
      serviceId: props.address.serviceId,
      compatible: sensorType,
    },
  });
}
</script>

<template>
  <div class="column">
    <div
      v-for="channel in channels"
      :key="`channel-${channel.id}`"
      class="row q-gutter-xs"
    >
      <LabeledField
        label="Channel"
        readonly
        class="col-2"
      >
        {{ analogChannelName(channel.id) }}
      </LabeledField>
      <LabeledField
        label="Sensor Type"
        readonly
        class="col-2"
      >
        {{ ENUM_LABELS_ANALOG_SENSOR_TYPE[channel.sensorType] }}
      </LabeledField>
      <LabeledField
        v-if="adcErrorLabel(channel.error)"
        label="ADC stopped"
        readonly
        class="col-2 text-negative"
        tooltip="Channels A1 and A2 share an ADC, as do channels B1 and B2.
        While their ADC is stopped, both channels have no readings.
        The module keeps trying to restart it."
      >
        {{ adcErrorLabel(channel.error) }}
      </LabeledField>
      <QuantityField
        v-if="channel.resistance !== undefined"
        v-model="channel.resistance"
        label="Resistance"
        readonly
        class="col-2"
      />
      <QuantityField
        v-if="channel.leadResistance !== undefined"
        v-model="channel.leadResistance"
        label="Lead-wire"
        readonly
        class="col-2"
      />
      <NumberField
        v-if="channel.bridgeOutput !== undefined"
        v-model="channel.bridgeOutput"
        label="Sensor output"
        readonly
        class="col-2"
      />
      <QuantityField
        v-if="channel.bridgeResistance !== undefined"
        v-model="channel.bridgeResistance"
        label="Sensor resistance"
        readonly
        class="col-2"
      />
      <LabeledField
        v-if="existingSensors[channel.id].length > 0"
        label="Used by"
        readonly
        class="col-auto"
      >
        <q-btn
          v-for="userBlock in existingSensors[channel.id]"
          :key="userBlock.id"
          :label="userBlock.id"
          dense
          no-caps
          class="depth-1 q-mx-xs"
          color="primary"
          @click="createBlockDialog(userBlock)"
        />
      </LabeledField>
      <LabeledField
        v-if="
          sensorToBlockType(channel.sensorType) !== null &&
          existingSensors[channel.id].length == 0
        "
        label="Not used"
        readonly
        class="col-auto"
      >
        <q-btn
          label="New Sensor"
          dense
          no-caps
          flat
          class="depth-1 q-mx-xs"
          @click="createSensor(sensorToBlockType(channel.sensorType))"
        />
      </LabeledField>
    </div>
  </div>
</template>
