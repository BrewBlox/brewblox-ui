<script lang="ts">
import isNumber from 'lodash/isNumber';
import { debounce } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { isQuantity, prettyQty, Quantity } from '@/helpers/bloxfield';
import { roundNumber } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockField } from '@/plugins/spark/types';

import { QuickValuesConfig } from './types';


@Component
export default class QuickValuesWidget extends WidgetBase<QuickValuesConfig> {

  get fieldValue(): number | Quantity | null {
    return sparkStore.fieldByAddress(this.config.addr);
  }

  get numValue(): number | null {
    const v = this.fieldValue;
    return roundNumber(isQuantity(v) ? v.value : v);
  }

  blockFilter(block: Block): boolean {
    return !!sparkStore.spec(block)?.fields.some(f => !f.readonly);
  }

  fieldFilter(field: BlockField): boolean {
    const v = field.generate();
    return !field.readonly && (isNumber(v) || isQuantity(v));
  }

  stringValue(value: number): string {
    return isQuantity(this.fieldValue)
      ? prettyQty({ ...this.fieldValue, value })
      : `${value}`;
  }

  appliedValue(value: number): number | Quantity {
    return isQuantity(this.fieldValue)
      ? { ...this.fieldValue, value }
      : value;
  }

  save(value: number): void {
    const { field } = this.config.addr;
    const block = sparkStore.blockByAddress(this.config.addr);
    if (block && field) {
      block.data[field] = this.appliedValue(value);
      sparkStore.saveBlock(block);
    }
  }

  debouncedSave = debounce(this.save, 300, true);

  addValue(value: string, done: ((v?: number) => void)): void {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      done(parsed);
    }
    else {
      notify.warn(`Input value is not a number: '${value}'`);
      done();
    }
  }

  addSliderValue(value: string, done: ((v?: number[]) => void)): void {
    const parsed = value
      .split(/[,:]/)
      .map(Number);

    let [min, max, step] = parsed;

    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (step === undefined) {
      step = 1;
    }

    if (parsed.length > 3) {
      notify.warn(`Too many values: '${value}'`);
      return done();
    }

    if ([min, max, step].some(v => !Number.isFinite(v))) {
      notify.warn(`Unable to parse: '${value}'`);
      return done();
    }

    done([min, max, step]);
  }
}
</script>


<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div
      v-if="mode === 'Basic'"
      class="widget-body row justify-center"
    >
      <template v-if="widget.rows > 2 && widget.cols > 2">
        <BlockFieldAddressField
          :value="config.addr"
          :block-filter="blockFilter"
          :field-filter="fieldFilter"
          class="col-grow fade-2"
          show-value

          @input="v => { config.addr = v; saveConfig(); }"
        />
      </template>
      <template v-else>
        <div class="text-h6 text-secondary">
          {{ fieldValue | pretty }}
        </div>
      </template>

      <div class="col-break" />

      <q-btn
        v-for="(v, idx) in config.values"
        :key="`value-${idx}_${v}`"
        :label="stringValue(v)"
        unelevated
        color="secondary"
        style="min-width: 75px"
        @click="() => debouncedSave(v)"
      />

      <div class="col-break q-my-md" />

      <div
        v-for="([min, max, step], idx) in config.sliders"
        :key="`slider-${idx}_${min}_${max}_${step}`"
        class="col-11 q-mr-xs row q-gutter-x-sm"
      >
        <div
          class="col-auto self-center fade-3"
          style="min-width: 15pt"
        >
          {{ min }}
        </div>
        <q-slider
          :value="numValue"
          :min="Math.min(min, numValue)"
          :max="Math.max(max, numValue)"
          :step="step"
          label-always
          class="col-grow"
          @change="debouncedSave"
        />
        <div
          class="col-auto self-center fade-3"
          style="min-width: 15pt"
        >
          {{ max }}
        </div>
      </div>
    </div>

    <div
      v-if="mode === 'Full'"
      class="widget-body column"
    >
      <BlockFieldAddressField
        :value="config.addr"
        :block-filter="blockFilter"
        :field-filter="fieldFilter"
        class="col-grow"
        show-value
        @input="v => { config.addr = v; saveConfig(); }"
      />
      <q-select
        :value="config.values"
        label="Preset values"
        use-chips
        use-input
        multiple
        hide-dropdown-icon
        class="col-grow"
        @new-value="addValue"
        @input="v => { config.values = v; saveConfig(); }"
      >
        <q-tooltip>
          Add a new value, and press ENTER.
        </q-tooltip>
      </q-select>
      <q-select
        :value="config.sliders"
        label="Preset sliders"
        use-chips
        use-input
        multiple
        hide-dropdown-icon
        class="col-grow"
        @new-value="addSliderValue"
        @input="v => { config.sliders = v; saveConfig(); }"
      >
        <template v-slot:selected-item="scope">
          <q-chip
            removable
            dense
            :tabindex="scope.tabindex"
            color="secondary"
            text-color="white"
            @remove="scope.removeAtIndex(scope.index)"
          >
            {{ scope.opt.join(':') }}
          </q-chip>
        </template>
        <q-tooltip>
          Add a new value, and press ENTER.
          <ul>
            <li><i>max</i></li>
            <li><i>min:max</i></li>
            <li><i>min:max:step</i></li>
          </ul>
        </q-tooltip>
      </q-select>
    </div>
  </CardWrapper>
</template>
