<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { filterLabels } from '@/plugins/spark/getters';
import { Block, SetpointSensorPairBlock } from '@/plugins/spark/types';


@Component
export default class SetpointSensorPairForm
  extends BlockCrudComponent<SetpointSensorPairBlock> {

  get filterOpts(): SelectOption[] {
    return Object.entries(filterLabels)
      .map(([value, label]) => ({ label, value }));
  }

  get usedBy(): Block[] {
    if (!this.isStoreBlock) {
      return [];
    }
    return this.sparkModule
      .blocks
      .filter(block => block.data.inputId?.id === this.blockId);
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <QuantityField
        :value="block.data.storedSetting"
        :readonly="isDriven"
        :class="{darkened: !block.data.settingEnabled}"
        title="Setting"
        label="Setting"
        tag="big"
        class="col-grow"
        @input="v => { block.data.storedSetting = v; saveBlock(); }"
      />
      <QuantityField
        :value="block.data.value"
        label="Sensor"
        readonly
        tag="big"
        class="col-grow"
      />
      <QuantityField
        :value="block.data.valueUnfiltered"
        label="Unfiltered sensor"
        readonly
        tag="big"
        class="col-grow"
      />

      <div class="col-break" />

      <SelectField
        :value="block.data.filter"
        :options="filterOpts"
        :html="true"
        title="Filter"
        label="Filter period"
        message="
              <p>
                A filter averages multiple sensor values to remove noise, spikes and sudden jumps.
                Changes faster than the filter period will be filted out.
              </p>
              <p>
                A longer period will give a smoother output at the cost of a delay in response.
                This delay is equal to the chosen period.
              </p>
              "
        class="col-grow"
        @input="v => { block.data.filter = v; saveBlock(); }"
      />
      <QuantityField
        :value="block.data.filterThreshold"
        :html="true"
        title="Filter bypass threshold"
        label="Bypass threshold"
        message="
              <p>
                The filter can detect when a large step occurs at the input and temporary bypass slow filtering.
                The threshold for an input change that should trigger this can be set here.
              </p>
              "
        class="col-grow"
        @input="v => { block.data.filterThreshold = v; saveBlock(); }"
      >
        <template #append>
          <q-btn
            flat
            round
            icon="mdi-skip-forward"
            class="self-end"
            @click.stop="block.data.resetFilter = true; saveBlock()"
          >
            <q-tooltip>Bypass filter now</q-tooltip>
          </q-btn>
        </template>
      </QuantityField>

      <div class="col-break" />

      <LinkField
        :value="block.data.sensorId"
        :service-id="serviceId"
        title="Sensor Block"
        label="Sensor Block"
        tag="span"
        class="col-grow"
        @input="v => { block.data.sensorId = v; saveBlock(); }"
      />
      <LabeledField
        label="Input for:"
        class="col-grow"
      >
        <div class="row">
          <q-btn
            v-for="block in usedBy"
            :key="block.id"
            :label="block.id"
            dense
            no-caps
            flat
            class="depth-1"
            @click="showOtherBlock(block)"
          />
          <div v-if="usedBy.length === 0">
            This setpoint is not used as PID input
          </div>
        </div>
      </LabeledField>

      <div class="col-break" />

      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
    </div>

    <q-card-section v-if="false">
      <q-separator inset />

      <q-item class="items-start">
        <q-item-section class="col-4" />
        <q-item-section v-if="usedBy.length" />
      </q-item>

      <q-item class="items-end">
        <q-item-section class="col-4" />
        <q-item-section class="col-3" />
        <q-item-section class="col-4" />
      </q-item>

      <q-item>
        <q-item-section class="col-4" />
        <q-item-section class="col-7" />
      </q-item>

      <q-item>
        <q-item-section />
      </q-item>
    </q-card-section>
  </div>
</template>
