<script setup lang="ts">
import { TempSensorAnalogBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import {
  ENUM_LABELS_ANALOG_SENSOR_TYPE,
  ENUM_LABELS_TEMP_SENSOR_ANALOG_SPEC,
  ENUM_LABELS_TEMP_SENSOR_ANALOG_TYPE,
} from '@/plugins/spark/const';
import { setExclusiveAnalogChannelClaimer } from '@/plugins/spark/utils/configuration';
import { selectable } from '@/utils/collections';

const tempSensorAnalogTypeOpts = selectable(
  ENUM_LABELS_TEMP_SENSOR_ANALOG_TYPE,
);
const tempSensorAnalogSpecOpts = selectable(
  ENUM_LABELS_TEMP_SENSOR_ANALOG_SPEC,
);

const { context, inDialog } = useContext.setup();
const { block, serviceId, patchBlock } =
  useBlockWidget.setup<TempSensorAnalogBlock>();

const hasValue = computed<boolean>(() => block.value.data.value.value !== null);
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <CardWarning v-if="!hasValue">
        <template #message> Analog Sensor could not be read. </template>
      </CardWarning>

      <div class="q-ma-md row justify-center">
        <div
          v-if="hasValue"
          class="col-auto row items-center"
        >
          <q-icon
            name="mdi-thermometer"
            size="md"
            color="green-3"
            class="col-auto"
          />
          <QuantityField
            :model-value="block.data.value"
            readonly
            tag="big"
            class="col-auto"
          />
        </div>
      </div>

      <template v-if="context.mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
          <AnalogChannelSelectField
            :model-value="{
              analogDevice: block.data.analogDevice,
              analogChannel: block.data.analogChannel,
            }"
            :service-id="serviceId"
            clearable
            title="Target channel"
            label="Channel"
            class="col-grow"
            @update:model-value="
              ({ analogDevice, analogChannel }) =>
                setExclusiveAnalogChannelClaimer(
                  block,
                  analogDevice,
                  analogChannel,
                )
            "
          />
          <SelectField
            :model-value="block.data.sensorType"
            :options="tempSensorAnalogTypeOpts"
            title="Sensor type"
            label="Sensor type"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ sensorType: v })"
          />
          <SelectField
            :model-value="block.data.spec"
            :options="tempSensorAnalogSpecOpts"
            title="Sensor spec"
            label="Sensor spec"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ spec: v })"
          />

          <div class="col-break" />

          <QuantityField
            :model-value="block.data.offset"
            title="Offset"
            label="Offset"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ offset: v })"
          />
          <LabeledField
            v-model="ENUM_LABELS_ANALOG_SENSOR_TYPE[block.data.detected]"
            readonly
            label="Detected type"
            class="col-grow"
          />
        </div>
      </template>
    </div>
  </PreviewCard>
</template>
