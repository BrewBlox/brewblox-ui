<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { FilterChoice, SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairForm extends BlockCrudComponent {
  readonly block!: SetpointSensorPairBlock;

  get filterOpts(): SelectOption[] {
    return Object.keys(FilterChoice)
      .filter(val => !Number.isNaN(Number(val)))
      .map(value => ({
        value: Number(value),
        label: FilterChoice[value].replace('Filter', '').replace('NoFiltering', 'No Filtering'),
      }));
  }

  get usedBy(): Block[] {
    if (!this.isStoreBlock) {
      return [];
    }
    return sparkStore.blockValues(this.serviceId)
      .filter(block => get(block, 'data.inputId.id') === this.blockId);
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-separator inset />

      <q-item class="items-start">
        <q-item-section class="col-4">
          <UnitField
            :value="block.data.storedSetting"
            :readonly="isDriven"
            :class="{darkened: !block.data.settingEnabled}"
            title="Setting"
            label="Setting"
            class="self-start"
            tag="big"
            @input="v => { block.data.storedSetting = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section v-if="usedBy.length">
          <ValueField label="Input for:">
            <div class="row">
              <q-btn
                v-for="block in usedBy"
                :key="block.id"
                :label="block.id"
                dense
                no-caps
                flat
                class="q-py-xs"
                style="text-decoration: underline"
                @click="showOtherBlock(block)"
              />
            </div>
          </ValueField>
        </q-item-section>
        <template v-else>
          <q-item-section>This setpoint is not used as PID input</q-item-section>
        </template>
      </q-item>

      <q-item class="items-end">
        <q-item-section class="col-4">
          <UnitField :value="block.data.value" label="Sensor value" tag="big" readonly />
        </q-item-section>
        <q-item-section class="col-3">
          <SelectField
            :value="block.data.filter"
            :options="filterOpts"
            title="Filter"
            label="Filter period"
            message-html="
              <p>
                A filter averages multiple sensor values to remove noise, spikes and sudden jumps.
                Changes faster than the filter period will be filted out.
              </p>
              <p>
                A longer period will give a smoother output at the cost of a delay in response.
                This delay is equal to the chosen period.
              </p>
              "
            @input="v => { block.data.filter = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section class="col-4">
          <UnitField
            :value="block.data.filterThreshold"
            title="Filter bypass threshold"
            label="Bypass threshold"
            message-html="
              <p>
                The filter can detect when a large step occurs at the input and temporary bypass slow filtering.
                The threshold for an input change that should trigger this can be set here.
              </p>
              "
            @input="v => { block.data.filterThreshold = v; saveBlock(); }"
          >
            <template #append>
              <q-btn
                flat
                round
                icon="mdi-skip-forward"
                class="self-end"
                @click="block.data.resetFilter = true; saveBlock()"
              >
                <q-tooltip>Bypass filter now</q-tooltip>
              </q-btn>
            </template>
          </UnitField>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section class="col-4">
          <UnitField :value="block.data.valueUnfiltered" label="Unfiltered sensor value" tag="big" readonly />
        </q-item-section>
        <q-item-section class="col-7">
          <BlockField
            :value="block.data.sensorId"
            :service-id="serviceId"
            title="Sensor Block"
            label="Sensor Block"
            tag="span"
            @input="v => { block.data.sensorId = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
