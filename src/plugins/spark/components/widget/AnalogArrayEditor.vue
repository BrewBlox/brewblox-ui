<script setup lang="ts">
import {
  AnalogModuleChannel,
  AnalogSensorType,
  Block,
  BlockOrIntfType,
} from 'brewblox-proto/ts';
import { defineProps } from 'vue';
import { ENUM_LABELS_ANALOG_SENSOR_TYPE } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';

interface Props {
  channels: AnalogModuleChannel[];
  serviceId: string;
  blockId: string;
}
const sparkStore = useSparkStore();

const props = defineProps<Props>();

function existingSensors(channel: number): Block[] {
  return sparkStore
    .blocksByType(props.serviceId, BlockOrIntfType.TempSensorAnalog)
    .filter(
      (block) =>
        block.data.analogDevice.id === props.blockId &&
        block.data.analogChannel === channel,
    );
}

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
  if (sensorType === null) {
    return;
  }
  createDialog({
    component: 'BlockWizardDialog',
    componentProps: {
      serviceId: props.serviceId,
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
        Analog {{ channel.id }}
      </LabeledField>
      <LabeledField
        label="Sensor Type"
        readonly
        class="col-2"
      >
        {{ ENUM_LABELS_ANALOG_SENSOR_TYPE[channel.sensorType] }}
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
        v-if="existingSensors(channel.id).length > 0"
        label="Used by"
        readonly
        class="col-grow row"
      >
        <q-btn
          v-for="userBlock in existingSensors(channel.id)"
          :key="userBlock.id"
          :label="userBlock.id"
          dense
          no-caps
          flat
          class="depth-1"
          @click="createBlockDialog(userBlock)"
        />
      </LabeledField>
      <LabeledField
        v-if="
          sensorToBlockType(channel.sensorType) !== null &&
          existingSensors(channel.id).length == 0
        "
        label="Not used"
        readonly
        class="col-grow row"
      >
        <q-btn
          label="New Sensor"
          dense
          no-caps
          flat
          class="depth-1"
          @click="createSensor(sensorToBlockType(channel.sensorType))"
        />
      </LabeledField>
    </div>
  </div>
</template>
