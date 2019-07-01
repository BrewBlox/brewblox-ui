<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import sparkStore from '@/plugins/spark/store';

import { Block } from '../../types';
import { FilterChoice, SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairForm extends BlockCrudComponent {
  readonly block!: SetpointSensorPairBlock;

  get filterOpts() {
    return Object.keys(FilterChoice)
      .filter(val => !Number.isNaN(Number(val)))
      .map(value => ({
        value: Number(value),
        label: FilterChoice[value].replace('Filter', 'Filter '),
      }));
  }

  get usedBy(): Block[] {
    if (!this.isStoreBlock) {
      return [];
    }
    return sparkStore.blockValues(this.serviceId)
      .filter(block => get(block, 'data.inputId.id') === this.blockId);
  }

  get disabledString(): string {
    if (this.usedBy.length === 0) {
      return 'Setpoint is disabled, and is not used.';
    } else if (this.usedBy.length == 1) {
      return `Setpoint is disabled. '${this.usedBy[0].id}' is inactive.`;
    } else {
      return `Setpoint is disabled. ${this.usedBy.map(v => `'${v.id}'`).join(', ')} are inactive.`;
    }
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" />

    <q-card-section>
      <BlockEnableToggle
        :crud="crud"
        :text-disabled="disabledString"
        text-enabled="Setpoint is enabled."
        data-key="settingEnabled"
        class="full-width bordered"
      />
      <q-separator dark inset />
      <q-item dark>
        <q-item-section class="col-3" style="justify-content: flex-start">
          <q-item-label caption>Setting</q-item-label>
          <UnitField
            :value="block.data.storedSetting"
            :readonly="isDriven"
            :class="{darkened: !block.data.settingEnabled}"
            title="Setting"
            tag="big"
            @input="v => { block.data.storedSetting = v; saveBlock(); }"
          />
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
        </q-item-section>
        <q-item-section class="col-3" style="justify-content: flex-start">
          <q-item-label caption>Sensor value</q-item-label>
          <UnitField :value="block.data.value" tag="big" readonly />
        </q-item-section>
        <q-item-section class="col-auto" style="justify-content: flex-start">
          <q-item-label caption>Sensor</q-item-label>
          <LinkField
            :value="block.data.sensorId"
            :service-id="serviceId"
            title="Sensor"
            tag="big"
            @input="v => { block.data.sensorId = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section class="col-3">
          <q-item-label caption>Filter period</q-item-label>
          <SelectField
            :value="block.data.filter"
            :options="filterOpts"
            title="Filter"
            label="Filter period"
            message-html="
              <p>
                The input error is passed through a filter to remove noise, spikes and sudden jumps.
                This smooths the output of the PID.
              </p>
              <p>The filter should block changes lasting shorter than:</p>
              "
            @input="v => { block.data.filter = v; saveBlock(); }"
          />
        </q-item-section>

        <q-item-section class="col-3">
          <q-item-label caption>Fast step threshold</q-item-label>
          <UnitField
            :value="block.data.filterThreshold"
            title="Filter threshold"
            message-html="
              <p>
                Filtering the input causes a delay in response, because it averages values.
                The filter can detect when a larger step occurs to which it should respond faster.
              </p>
              <p>If a step exceeds this threshold, respond faster:</p>
              "
            @input="v => { block.data.filterThreshold = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section side>
          <q-btn flat round icon="refresh" @click="block.data.resetFilter = true; saveBlock()">
            <q-tooltip>Reset filter</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>

      <q-item v-if="usedBy.length" dark>
        <q-item-section>
          <q-item-label caption>This setpoint is used by:</q-item-label>
          <div class="row">
            <q-btn
              v-for="block in usedBy"
              :key="block.id"
              :label="block.id"
              flat
              no-caps
              @click="showOtherBlock(block)"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item v-else dark>
        <q-item-section avatar>
          <q-icon name="warning" />
        </q-item-section>
        <q-item-section>This setpoint is not used by any PID</q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
