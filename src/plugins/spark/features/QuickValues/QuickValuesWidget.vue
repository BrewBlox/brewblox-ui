<script lang="ts">
import isNumber from 'lodash/isNumber';
import { debounce } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { isQuantity, prettyQty, Quantity } from '@/helpers/bloxfield';
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
    return isQuantity(v) ? v.value : v;
  }

  blockFilter(block: Block): boolean {
    return !!sparkStore.spec(block)?.fields.some(f => !f.readonly);
  }

  fieldFilter(field: BlockField): boolean {
    const v = field.generate(this.config.addr.serviceId);
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
    console.log(value);
    const parsed = Number(value);
    Number.isFinite(parsed)
      ? done(parsed)
      : done();
  }

  addSliderValue(value: string, done: ((v?: number[]) => void)): void {
    console.log(value);
    const parsed = value
      .split(',')
      .map(Number);

    if (!parsed.some(v => !Number.isFinite(v))
      && parsed.length >= 1
      && parsed.length <= 3) {
      done(parsed);
    }
    else {
      done();
    }
  }
}
</script>


<template>
  <CardWrapper v-bind="{context}" no-scroll>
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div
      v-if="mode === 'Basic'"
      class="widget-body row q-gutter-y-sm justify-center"
    >
      <BlockFieldAddressField
        :value="config.addr"
        class="col-grow"
        readonly
        @input="v => { config.addr = v; saveConfig(); }"
      />

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

      <q-slider
        v-for="(v, idx) in config.sliders"
        :key="`slider-${idx}_${v}`"
        :value="numValue"
        :min="Math.min(v.length > 1 ? v[0] : 0, numValue)"
        :max="Math.max(v.length > 1 ? v[1] : v[0], numValue)"
        :step="v.length > 2 ? v[2] : 1"
        label-always
        class="col-11 q-mt-xl q-mr-xs"
        @change="debouncedSave"
      />
    </div>

    <div
      v-if="mode === 'Full'"
      class="widget-body column"
    >
      <BlockFieldAddressField
        :value="config.addr"
        class="col-grow"
        @input="v => { config.addr = v; saveConfig(); }"
      />
      <q-select
        :value="config.values"
        label="Values"
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
        label="Sliders"
        use-chips
        use-input
        multiple
        hide-dropdown-icon
        class="col-grow"
        @new-value="addSliderValue"
        @input="v => { config.sliders = v; saveConfig(); }"
      >
        <q-tooltip>
          Add a new value, and press ENTER. <br>
          <br>
          Syntax options: <br>
          <i>max</i><br>
          <i>min, max</i><br>
          <i>min, max, step</i><br>
          <br>
          Example: 0,100,2
        </q-tooltip>
      </q-select>
    </div>
  </CardWrapper>
</template>
