<script lang="ts">
import parseDuration from 'parse-duration';
import { Component, Prop } from 'vue-property-decorator';

import { defaultLabel, targetBuilder, targetSplitter } from '@/components/Graph/functional';
import { GraphConfig } from '@/components/Graph/types';
import CrudComponent from '@/components/Widget/CrudComponent';
import { durationString } from '@/helpers/functional';
import { DisplayNames, GraphValueAxes, historyStore, LineColors, QueryParams } from '@/store/history';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component
export default class GraphForm extends CrudComponent {
  durationString = durationString;

  tab = 'metrics';
  period: PeriodDisplay | null = null;

  @Prop({ type: Object, default: () => ({}) })
  readonly downsampling!: any;

  get config(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      colors: {},
      axes: {},
      ...this.widget.config,
    };
  }

  get periodOptions(): SelectOption[] {
    return [
      {
        label: 'Live: [duration] to now',
        value: { start: false, duration: true, end: false },
      },
      {
        label: 'Live: from [date] to now',
        value: { start: true, duration: false, end: false },
      },
      {
        label: 'Fixed: [duration] to [date]',
        value: { start: false, duration: true, end: true },
      },
      {
        label: 'Fixed: [duration] since [date]',
        value: { start: true, duration: true, end: false },
      },
      {
        label: 'Fixed: from [date] to [date]',
        value: { start: true, duration: false, end: true },
      },
    ];
  }

  paramDefaults(): QueryParams {
    return {
      start: new Date().getTime() - parseDuration('1d'),
      duration: '1d',
      end: new Date().getTime(),
    };
  }

  sanitizeParams(period: PeriodDisplay): void {
    const defaults = this.paramDefaults();
    Object.entries(period)
      .forEach(([key, isPresent]: [string, boolean]) =>
        this.$set(
          this.config.params,
          key,
          (isPresent
            ? this.config.params[key] || defaults[key]
            : undefined)
        ));
  }

  get shownPeriod(): PeriodDisplay {
    if (this.period === null) {
      const keys = ['start', 'duration', 'end'];
      const compare = (opt, k): boolean => {
        const val = this.config.params[k];
        return opt.value[k] === (val !== null && val !== undefined);
      };
      const matching = this.periodOptions
        .find(opt => keys.every(k => compare(opt, k)));

      // set local variable
      this.period = matching
        ? matching.value
        : this.periodOptions[0].value;

      // if no match was found, params must be sanitized
      if (!matching) {
        this.sanitizeParams(this.period as PeriodDisplay);
        this.saveConfig(this.config);
      }

    }

    return this.period as PeriodDisplay;
  }

  updateShownPeriod(val: PeriodDisplay): void {
    this.period = val;
    this.sanitizeParams(val);
    this.saveConfig(this.config);
  }

  get selected(): string[] {
    return targetSplitter(this.config.targets);
  }

  set selected(vals: string[]) {
    const targets = targetBuilder(vals || []);
    const renames = vals
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: this.config.renames[key] || defaultLabel(key),
        }),
        {});

    this.saveConfig({ ...this.config, targets, renames });
  }

  get renames(): DisplayNames {
    return this.config.renames;
  }

  set renames(renames: DisplayNames) {
    this.saveConfig({ ...this.config, renames });
  }

  get axes(): GraphValueAxes {
    return this.config.axes;
  }

  get axisOpts(): SelectOption[] {
    return [
      {
        value: 'y',
        label: 'Y1',
      },
      {
        value: 'y2',
        label: 'Y2',
      },
    ];
  }

  updateAxis(field: string, value: string): void {
    this.saveConfig({ ...this.config, axes: { ...this.axes, [field]: value } });
  }

  get colors(): LineColors {
    return this.config.colors;
  }

  updateColor(field: string, color: string): void {
    if (color) {
      this.$set(this.colors, field, color);
    } else {
      this.$delete(this.colors, field);
    }
    this.saveConfig({ ...this.config, colors: this.colors });
  }

  created(): void {
    historyStore.fetchKnownKeys();
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar :crud="crud" />

    <!-- <q-card-section dark> -->
    <q-tabs v-model="tab" dense active-color="primary" align="justify">
      <q-tab name="metrics" label="Metrics" />
      <q-tab name="period" label="Period" />
      <q-tab name="legend" label="Legend" />
      <q-tab name="display" label="Display" />
    </q-tabs>

    <div class="scroll-parent">
      <q-scroll-area>
        <q-tab-panels v-model="tab" animated class="bg-dark-bright">
          <!-- Metrics -->
          <q-tab-panel dark name="metrics" class="q-pt-none">
            <MetricSelector :selected.sync="selected" />
          </q-tab-panel>
          <!-- Period -->
          <q-tab-panel dark name="period" class="q-pt-none">
            <q-item dark>
              <q-item-section class="col-auto">
                <q-select
                  :value="shownPeriod"
                  :options="periodOptions"
                  emit-value
                  map-options
                  dark
                  options-dark
                  label="Display type"
                  @input="updateShownPeriod"
                />
              </q-item-section>
            </q-item>
            <q-item dark>
              <q-item-section v-if="shownPeriod.start" class="col-6">
                <q-item-label caption>
                  Start time
                </q-item-label>
                <DatetimeField
                  :value="config.params.start"
                  title="Start time"
                  @input="v => { config.params.start = v.getTime(); saveConfig(config); }"
                />
              </q-item-section>
              <q-item-section v-if="shownPeriod.duration" class="col-6">
                <q-item-label caption>
                  Duration
                </q-item-label>
                <InputField
                  :value="config.params.duration"
                  title="Duration"
                  @input="v => { config.params.duration = durationString(v); saveConfig(config); }"
                />
              </q-item-section>
              <q-item-section v-if="shownPeriod.end" class="col-6">
                <q-item-label caption>
                  End time
                </q-item-label>
                <DatetimeField
                  :value="config.params.end"
                  title="End time"
                  @input="v => { config.params.end = v.getTime(); saveConfig(config); }"
                />
              </q-item-section>
            </q-item>
            <q-item dark>
              <q-item-section class="col-auto">
                <q-item-label caption>
                  Averaging period
                </q-item-label>
                <div class="row q-mt-sm q-ml-sm">
                  <div v-for="(rate, meas) in downsampling" :key="meas" class="q-mr-md">
                    <q-item-label caption>
                      {{ meas }}
                    </q-item-label>
                    {{ rate }}
                  </div>
                </div>
                <q-tooltip>
                  To improve performance, the history service automatically selects an averaging period.
                  <br />One point is returned per period, with the average value of all points in that period.
                </q-tooltip>
              </q-item-section>
            </q-item>
          </q-tab-panel>
          <!-- Legend -->
          <q-tab-panel dark name="legend" class="q-pt-none">
            <LabelSelector :selected="selected" :renames.sync="renames" />
          </q-tab-panel>
          <!-- Display -->
          <q-tab-panel dark name="display" class="q-pt-none">
            <q-item dark>
              <q-item-section>Metric</q-item-section>
              <q-item-section>Display settings</q-item-section>
            </q-item>
            <q-separator dark inset />

            <q-item v-for="field in selected" :key="field" dark class="align-children">
              <q-item-section class="col-5">
                {{ field }}
              </q-item-section>
              <q-space />
              <q-item-section class="col-6">
                <q-list dark dense>
                  <q-item dark>
                    <q-item-section>
                      <q-item-label caption>
                        Y-axis
                      </q-item-label>
                    </q-item-section>
                    <q-item-section class="col-auto">
                      <q-btn-toggle
                        :value="axes[field] || 'y'"
                        :options="axisOpts"
                        flat
                        outline
                        @input="v => updateAxis(field, v)"
                      ></q-btn-toggle>
                    </q-item-section>
                  </q-item>
                  <q-item dark>
                    <q-item-section>
                      <q-item-label caption>
                        Line color
                      </q-item-label>
                    </q-item-section>
                    <q-item-section class="col-auto">
                      <ColorField
                        :value="colors[field] || ''"
                        title="Line color"
                        clearable
                        @input="v => updateColor(field, v)"
                      />
                    </q-item-section>
                  </q-item>
                  <q-separator dark />
                </q-list>
              </q-item-section>
            </q-item>
            <q-item v-if="!selected || selected.length === 0" dark>
              <q-item-section side>
                No metrics selected
              </q-item-section>
            </q-item>
          </q-tab-panel>
        </q-tab-panels>
      </q-scroll-area>
    </div>
  </q-card>
</template>

<style scoped>
.scroll-parent {
  height: 500px;
  max-height: 60vh;
}
</style>
