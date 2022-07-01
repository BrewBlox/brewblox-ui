<script lang="ts">
import isNumber from 'lodash/isNumber';
import { debounce } from 'quasar';
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { Block, BlockFieldSpec } from '@/plugins/spark/types';
import { Quantity } from '@/shared-types';
import { prettyAny, prettyQty, roundedNumber } from '@/utils/formatting';
import { isQuantity } from '@/utils/identity';
import { notify } from '@/utils/notify';

import { QuickValuesWidget } from './types';

export default defineComponent({
  name: 'QuickValuesWidget',
  setup() {
    const sparkStore = useSparkStore();
    const specStore = useBlockSpecStore();
    const { context } = useContext.setup();
    const { widget, config, patchConfig } =
      useWidget.setup<QuickValuesWidget>();

    const fieldValue = computed<Quantity | number | null>(() =>
      sparkStore.fieldByAddress(config.value.addr),
    );

    const numValue = computed<number | null>(() => {
      const v = fieldValue.value;
      return roundedNumber(isQuantity(v) ? v.value : v);
    });

    function blockFilter(block: Block): boolean {
      return specStore.fieldSpecsByType(block.type).some((f) => !f.readonly);
    }

    function fieldFilter(field: BlockFieldSpec): boolean {
      const v = field.generate();
      return !field.readonly && (isNumber(v) || isQuantity(v));
    }

    function stringValue(value: number): string {
      return isQuantity(fieldValue.value)
        ? prettyQty({ ...fieldValue.value, value })
        : `${value}`;
    }

    function appliedValue(value: number): number | Quantity {
      return isQuantity(fieldValue.value)
        ? { ...fieldValue.value, value }
        : value;
    }

    const debouncedSave = debounce(
      (value: number): void => {
        const { field } = config.value.addr;
        const block = sparkStore.blockByAddress(config.value.addr);
        if (block && field) {
          sparkStore.patchBlock(block, { [field]: appliedValue(value) });
        }
      },
      300,
      true,
    );

    function addValue(value: string, done: (v?: number) => void): void {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        done(parsed);
      } else {
        notify.warn(`Input value is not a number: '${value}'`);
        done();
      }
    }

    function addSliderValue(value: string, done: (v?: number[]) => void): void {
      const parsed = value.split(/[,:]/).map(Number);

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

      if ([min, max, step].some((v) => !Number.isFinite(v))) {
        notify.warn(`Unable to parse: '${value}'`);
        return done();
      }

      done([min, max, step]);
    }

    return {
      prettyAny,
      context,
      widget,
      config,
      patchConfig,
      fieldValue,
      numValue,
      blockFilter,
      fieldFilter,
      stringValue,
      debouncedSave,
      addValue,
      addSliderValue,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div
      v-if="context.mode === 'Basic'"
      class="widget-body row justify-center"
    >
      <template v-if="widget.rows > 2 && widget.cols > 2">
        <BlockFieldAddressField
          :model-value="config.addr"
          :block-filter="blockFilter"
          :field-filter="fieldFilter"
          class="col-grow fade-2"
          show-value
          @update:model-value="(addr) => patchConfig({ addr })"
        />
      </template>
      <template v-else>
        <div class="text-h6 text-secondary">
          {{ prettyAny(fieldValue) }}
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
          :model-value="numValue"
          :min="Math.min(min, numValue ?? min)"
          :max="Math.max(max, numValue ?? max)"
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
      v-if="context.mode === 'Full'"
      class="widget-body column"
    >
      <BlockFieldAddressField
        :model-value="config.addr"
        :block-filter="blockFilter"
        :field-filter="fieldFilter"
        class="col-grow"
        show-value
        @update:model-value="(addr) => patchConfig({ addr })"
      />
      <q-select
        :model-value="config.values"
        label="Preset values"
        use-chips
        use-input
        multiple
        hide-dropdown-icon
        class="col-grow"
        @new-value="addValue"
        @update:model-value="(values) => patchConfig({ values })"
      >
        <q-tooltip> Add a new value, and press ENTER. </q-tooltip>
      </q-select>
      <q-select
        :model-value="config.sliders"
        label="Preset sliders"
        use-chips
        use-input
        multiple
        hide-dropdown-icon
        class="col-grow"
        @new-value="addSliderValue"
        @update:model-value="(sliders) => patchConfig({ sliders })"
      >
        <template #selected-item="scope">
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
  </Card>
</template>
