<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { combineFuncLabels } from '@/plugins/spark/getters';
import { BlockIntfType, Link, TempSensorCombiBlock } from '@/plugins/spark/types';
import { bloxLink, prettyQty } from '@/utils/bloxfield';
import { createDialog } from '@/utils/dialog';

const combineFuncOpts: SelectOption[] =
  Object.entries(combineFuncLabels)
    .map(([value, label]) => ({ label, value }));

export default defineComponent({
  name: 'TempSensorCombiWidget',
  setup() {
    const { context, inDialog } = useContext.setup();
    const {
      serviceId,
      sparkModule,
      block,
      saveBlock,
    } = useBlockWidget.setup<TempSensorCombiBlock>();

    const hasValue = computed<boolean>(
      () => block.value.data.value.value !== null,
    );

    const sensors = computed<Link[]>(
      () => block.value.data.sensors,
    );

    function addSensor(): void {
      createDialog({
        component: 'LinkDialog',
        componentProps: {
          modelValue: bloxLink(null, BlockIntfType.TempSensorInterface),
          title: 'Add sensor',
          message: 'All linked sensors are evaluated to determine the output value',
          label: 'Sensor',
          serviceId,
        },
      })
        .onOk((value: Link) => {
          block.value.data.sensors.push(value);
          saveBlock();
        });
    }

    function removeSensor(idx): void {
      block.value.data.sensors.splice(idx, 1);
      saveBlock();
    }

    function updateSensor(idx: number, value: Link): void {
      block.value.data.sensors.splice(idx, 1, value);
      saveBlock();
    }

    function sensorValue(link: Link): string {
      const block = sparkModule.blockByLink(link);
      return prettyQty(block?.data.value ?? null);
    }

    return {
      combineFuncOpts,
      context,
      inDialog,
      serviceId,
      block,
      saveBlock,
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
  <PreviewCardWrapper :enabled="inDialog">
    <template #graph>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <CardWarning v-if="sensors.length === 0">
        <template #message>
          No sensors set.
        </template>
      </CardWarning>
      <CardWarning v-else-if="!hasValue">
        <template #message>
          No sensors could be read.
        </template>
      </CardWarning>

      <div class="q-ma-md row justify-center">
        <div v-if="hasValue" class="col-auto row items-center">
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
            @update:model-value="v => { block.data.combineFunc = v; saveBlock(); }"
          />

          <div class="col-break" />

          <div
            v-for="(link, idx) in sensors"
            :key="`link-${idx}-${link.id}`"
            class="col-12 row q-gutter-xs q-mt-none "
          >
            <LinkField
              :model-value="link"
              :service-id="serviceId"
              title="Sensor Block"
              :label="`Sensor ${idx+1}`"
              tag="span"
              class="col-grow"
              @update:model-value="v => updateSensor(idx, v)"
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
  </PreviewCardWrapper>
</template>
