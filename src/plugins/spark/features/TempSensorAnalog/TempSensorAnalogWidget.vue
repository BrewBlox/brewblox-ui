<script setup lang="ts">
import {
  Quantity,
  TempSensorAnalogBlock,
  TempSensorAnalogSpec,
  TempSensorAnalogType,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import {
  ENUM_LABELS_ANALOG_SENSOR_TYPE,
  ENUM_LABELS_TEMP_SENSOR_ANALOG_SPEC,
  ENUM_LABELS_TEMP_SENSOR_ANALOG_TYPE,
} from '@/plugins/spark/const';
import { setAnalogChannelClaimer } from '@/plugins/spark/utils/configuration';
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
                setAnalogChannelClaimer(
                  block,
                  analogDevice,
                  analogChannel,
                  false,
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
          >
            <template
              v-if="
                block.data.sensorType ===
                TempSensorAnalogType.TEMP_SENSOR_TYPE_NOT_SET
              "
              #prepend
            >
              <q-icon
                name="warning"
                color="warning"
              />
            </template>
          </SelectField>
          <LabeledField
            v-model="ENUM_LABELS_ANALOG_SENSOR_TYPE[block.data.detected]"
            readonly
            label="Detected type"
            class="col-grow"
            tooltip="Detected sensor type.
            If this doesn't match the selected type, the sensor will not give a value.
            Detected 3-wire when 4-wires was configured is allowed,
            beause the lead-wire resistance can still be corrected for."
          />
          <div class="col-break" />
          <SelectField
            :model-value="block.data.spec"
            :options="tempSensorAnalogSpecOpts"
            title="Sensor spec"
            label="Sensor spec"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ spec: v })"
          >
            <template
              v-if="block.data.spec === TempSensorAnalogSpec.SPEC_NOT_SET"
              #prepend
            >
              <q-icon
                name="warning"
                color="warning"
              />
            </template>
          </SelectField>
          <QuantityField
            :model-value="block.data.spec_r0"
            title="R0 (Resistance at 0°C)"
            label="R0 (Resistance at 0°C)"
            class="col-grow"
            :suffix="block.data.spec_r0_override ? ' (custom)' : '(default)'"
            placeholder=""
            message="<p>Set a custom R0 for the Callendar-Van Dusen equation.</p>
                     <p>Clear or set to 0 to revert back to the default for the spec.</p>"
            html
            clearable
            @update:model-value="
              (v: Quantity) => {
                if (v.value === null) {
                  v.value = 0;
                }
                return patchBlock({ spec_r0_override: v });
              }
            "
          />
          <div class="col-break" />
          <ScientificNumberField
            :model-value="block.data.spec_a"
            title="Custom temperature coefficient A"
            label="Temperature coefficient A"
            class="col-grow"
            :suffix="block.data.spec_a_override ? ' (custom)' : '(default)'"
            dialog-suffix="custom"
            placeholder=""
            message="<p>Set a custom coefficient A for the Callendar-Van Dusen equation.</p>
                     <p>Clear or set to 0 to revert back to the default for the spec.</p>"
            html
            @update:model-value="(v) => patchBlock({ spec_a_override: v })"
          />
          <ScientificNumberField
            :model-value="block.data.spec_b"
            title="Temperature coefficient B"
            label="Temperature coefficient B"
            class="col-grow"
            :suffix="block.data.spec_a_override ? ' (custom)' : '(default)'"
            dialog-suffix="custom"
            placeholder=""
            message="<p>Set a custom coefficient B for the Callendar-Van Dusen equation.</p>
                     <p>Clear or set to 0 to revert back to the default for the spec.</p>"
            html
            @update:model-value="(v) => patchBlock({ spec_b_override: v })"
          />
          <ScientificNumberField
            :model-value="block.data.spec_c"
            title="Temperature coefficient C"
            label="Temperature coefficient C"
            class="col-grow"
            :suffix="block.data.spec_a_override ? ' (custom)' : '(default)'"
            dialog-suffix="custom"
            placeholder=""
            message="<p>Set a custom coefficient C for the Callendar-Van Dusen equation.</p>
                     <p>Clear or set to 0 to revert back to the default for the spec.</p>"
            html
            @update:model-value="(v) => patchBlock({ spec_c_override: v })"
          />
        </div>
      </template>
    </div>
  </PreviewCard>
</template>
