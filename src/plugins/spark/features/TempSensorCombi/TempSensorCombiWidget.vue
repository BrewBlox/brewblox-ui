<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxLink, prettyQty } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { combineFuncLabels } from '@/plugins/spark/getters';
import { BlockIntfType, Link, TempSensorCombiBlock } from '@/plugins/spark/types';

@Component
export default class TempSensorCombiWidget
  extends BlockWidgetBase<TempSensorCombiBlock> {

  get combineFuncOpts(): SelectOption[] {
    return Object.entries(combineFuncLabels)
      .map(([value, label]) => ({ label, value }));
  }

  get hasValue(): boolean {
    return this.block.data.value.value !== null;
  }

  get sensors(): Link[] {
    return this.block.data.sensors;
  }

  addSensor(): void {
    createDialog({
      component: 'LinkDialog',
      title: 'Add sensor',
      message: 'All linked sensors are evaluated to determine the output value',
      value: bloxLink(null, BlockIntfType.TempSensorInterface),
      label: 'Sensor',
      serviceId: this.serviceId,
    })
      .onOk((value: Link) => {
        this.block.data.sensors.push(value);
        this.saveBlock();
      });
  }

  removeSensor(idx): void {
    this.block.data.sensors.splice(idx, 1);
    this.saveBlock();
  }

  updateSensor(idx: number, value: Link): void {
    this.block.data.sensors.splice(idx, 1, value);
    this.saveBlock();
  }

  sensorValue(link: Link): string {
    const block = this.sparkModule.blockByLink(link);
    return prettyQty(block?.data.value ?? null);
  }
}
</script>

<template>
  <GraphCardWrapper
    :show="inDialog"
    v-bind="{context}"
  >
    <template #graph>
      <HistoryGraph
        :graph-id="widget.id"
        :config="graphCfg"
        :refresh-trigger="mode"
        use-range
        use-presets
        @params="saveGraphParams"
        @layout="saveGraphLayout"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
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
            :value="block.data.value"
            readonly
            tag="big"
            class="col-auto"
          />
        </div>
      </div>

      <template v-if="mode === 'Full'">
        <q-separator inset />

        <div class="q-ma-md row q-gutter-xs">
          <SelectField
            :value="block.data.combineFunc"
            :options="combineFuncOpts"
            title="Select function"
            label="Value calculation"
            class="col-grow"
            @input="v => { block.data.combineFunc = v; saveBlock(); }"
          />

          <div class="col-break" />

          <div
            v-for="(link, idx) in sensors"
            :key="`link-${idx}-${link.id}`"
            class="col-12 row q-gutter-xs q-mt-none "
          >
            <LinkField
              :value="link"
              :service-id="serviceId"
              title="Sensor Block"
              :label="`Sensor ${idx+1}`"
              tag="span"
              class="col-grow"
              @input="v => updateSensor(idx, v)"
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
  </GraphCardWrapper>
</template>
