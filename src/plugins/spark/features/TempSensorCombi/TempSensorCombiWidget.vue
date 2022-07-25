<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { combineFuncLabels } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { createDialog } from '@/utils/dialog';
import { bloxLink } from '@/utils/link';
import { prettyQty } from '@/utils/quantity';
import { BlockIntfType, Link, TempSensorCombiBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

const combineFuncOpts: SelectOption[] = Object.entries(combineFuncLabels).map(
  ([value, label]) => ({ label, value }),
);

export default defineComponent({
  name: 'TempSensorCombiWidget',
  setup() {
    const { context, inDialog } = useContext.setup();
    const sparkStore = useSparkStore();
    const { serviceId, block, patchBlock } =
      useBlockWidget.setup<TempSensorCombiBlock>();

    const hasValue = computed<boolean>(
      () => block.value.data.value.value !== null,
    );

    const sensors = computed<Link[]>(() => block.value.data.sensors);

    function addSensor(): void {
      createDialog({
        component: 'LinkDialog',
        componentProps: {
          modelValue: bloxLink(null, BlockIntfType.TempSensorInterface),
          title: 'Add sensor',
          message:
            'All linked sensors are evaluated to determine the output value',
          label: 'Sensor',
          serviceId,
        },
      }).onOk((sensor: Link) => {
        patchBlock({ sensors: [...block.value.data.sensors, sensor] });
      });
    }

    function removeSensor(idx: number): void {
      patchBlock({ sensors: [...block.value.data.sensors].splice(idx, 1) });
    }

    function updateSensor(idx: number, value: Link): void {
      patchBlock({
        sensors: [...block.value.data.sensors].splice(idx, 1, value),
      });
    }

    function sensorValue(link: Link): string {
      const block = sparkStore.blockByLink(serviceId, link);
      return prettyQty(block?.data.value ?? null);
    }

    return {
      combineFuncOpts,
      context,
      inDialog,
      serviceId,
      block,
      patchBlock,
      sensors,
      hasValue,
      addSensor,
      removeSensor,
      updateSensor,
      sensorValue,
    };
  },
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

    <div>
      <CardWarning v-if="sensors.length === 0">
        <template #message> No sensors set. </template>
      </CardWarning>
      <CardWarning v-else-if="!hasValue">
        <template #message> No sensors could be read. </template>
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

        <div class="q-ma-md row q-gutter-xs">
          <SelectField
            :model-value="block.data.combineFunc"
            :options="combineFuncOpts"
            title="Select function"
            label="Value calculation"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ combineFunc: v })"
          />

          <div class="col-break" />

          <div
            v-for="(link, idx) in sensors"
            :key="`link-${idx}-${link.id}`"
            class="col-12 row q-gutter-xs q-mt-none"
          >
            <LinkField
              :model-value="link"
              :service-id="serviceId"
              title="Sensor Block"
              :label="`Sensor ${idx + 1}`"
              tag="span"
              class="col-grow"
              @update:model-value="(v) => updateSensor(idx, v)"
            />
            <LabeledField
              label="Value"
              class="col-auto min-width-sm"
            >
              {{ sensorValue(link) }}
            </LabeledField>
            <q-btn
              flat
              dense
              round
              icon="close"
              class="col-auto self-center"
              @click="removeSensor(idx)"
            >
              <q-tooltip>Remove sensor</q-tooltip>
            </q-btn>
          </div>
          <div class="col-grow column q-mt-sm">
            <q-btn
              v-if="sensors.length < 8"
              flat
              dense
              color="secondary"
              icon="add"
              label="Add sensor"
              class="self-end"
              @click="addSensor"
            />
          </div>
        </div>
      </template>
    </div>
  </PreviewCard>
</template>
