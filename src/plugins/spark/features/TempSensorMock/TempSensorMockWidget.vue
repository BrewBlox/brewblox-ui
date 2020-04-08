<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Temp, Time } from '@/helpers/units';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { Fluctuation, TempSensorMockBlock } from './types';

@Component
export default class TempSensorMockWidget
  extends BlockWidgetBase<TempSensorMockBlock> {

  get tempUnit(): string {
    return this.sparkModule.units.Temp;
  }

  addFluctuation(): void {
    this.block.data.fluctuations.push({
      amplitude: new Temp(1, 'delta_degC').convert(`delta_${this.tempUnit}`),
      period: new Time(6, 'hour'),
    });
    this.saveBlock();
  }

  updateFluctuation(idx: number, fluct: Fluctuation): void {
    this.block.data.fluctuations.splice(idx, 1, fluct);
    this.saveBlock();
  }

  removeFluctuation(idx: number): void {
    this.block.data.fluctuations.splice(idx, 1);
    this.saveBlock();
  }

  editSetting(): void {
    createDialog({
      component: 'UnitDialog',
      title: 'Setting',
      label: 'Setting',
      value: this.block.data.setting,
    })
      .onOk(v => {
        this.block.data.setting = v;
        this.saveBlock();
      });
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md widget-body">
      <div class="row justify-around">
        <SettingValueField
          :class="['col-auto', !block.data.connected && 'darkish']"
          editable
          @click="editSetting"
        >
          <template #valueIcon>
            <q-icon name="mdi-thermometer" color="green-3" />
          </template>
          <template #value>
            {{ block.data.value | unit }}
          </template>
          <template #setting>
            {{ block.data.setting | unit }}
          </template>
        </SettingValueField>
      </div>

      <template v-if="mode === 'Full'">
        <q-separator inset />
        <LabeledField
          label="Connected"
          class="col-auto min-width-sm"
        >
          <q-toggle
            dense
            :value="block.data.connected"
            class="q-pl-md"
            @input="v => { block.data.connected = v; saveBlock(); }"
          />
        </LabeledField>
        <div class="text-h6 text-italic q-pl-sm">
          Fluctuations
        </div>
        <p
          v-if="block.data.fluctuations.length === 0"
          class="text-italic q-pl-sm"
        >
          Add value fluctuations to simulate periodic temperature changes.
        </p>
        <div
          v-for="(fluct, idx) in block.data.fluctuations"
          :key="`fluct-${idx}`"
          class="row q-gutter-x-sm q-ml-none fluctuation"
        >
          <UnitField
            :value="fluct.amplitude"
            title="Amplitude"
            label="Amplitude"
            class="col-grow"
            @input="amplitude => updateFluctuation(idx, {...fluct, amplitude})"
          />
          <TimeUnitField
            :value="fluct.period"
            title="Period"
            label="Period"
            class="col-grow"
            @input="period => updateFluctuation(idx, {...fluct, period})"
          />
          <q-btn
            flat
            round
            icon="delete"
            class="col-auto self-center"
            @click="removeFluctuation(idx)"
          />
        </div>
        <div class="row justify-end q-pr-md">
          <q-btn fab-mini icon="add" color="indigo-4" class="self-center" @click="addFluctuation">
            <q-tooltip>Add fluctuation</q-tooltip>
          </q-btn>
        </div>
      </template>
    </div>
  </GraphCardWrapper>
</template>

<style lang="sass" scoped>
.fluctuation:nth-child(even) > label
  background: rgba($green-5, 0.05)

.fluctuation:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
