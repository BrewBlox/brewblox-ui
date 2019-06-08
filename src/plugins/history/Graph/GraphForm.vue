<script lang="ts">
import parseDuration from 'parse-duration';
import { Component, Prop } from 'vue-property-decorator';

import FormBase from '@/components/Form/FormBase';
import { targetBuilder, targetSplitter } from '@/components/Graph/functional';
import { GraphConfig } from '@/components/Graph/types';
import { durationString } from '@/helpers/functional';
import historyStore, { DisplayNames } from '@/store/history';
import { GraphValueAxes } from '@/store/history';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component
export default class GraphForm extends FormBase {
  durationString = durationString;

  @Prop({ type: Object, default: () => ({}) })
  readonly downsampling!: any;

  period: PeriodDisplay | null = null;

  get config(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      axes: {},
      ...this.widget.config,
    };
  }

  get periodOptions() {
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

  get paramDefaults() {
    return {
      start: () => new Date().getTime() - parseDuration('1d'),
      duration: () => '1d',
      end: () => new Date().getTime(),
    };
  }

  sanitizeParams(period: PeriodDisplay) {
    Object.entries(period)
      .forEach(([key, isPresent]: [string, boolean]) =>
        this.$set(
          this.config.params,
          key,
          (isPresent
            ? this.config.params[key] || this.paramDefaults[key]()
            : undefined)
        ));
  }

  get shownPeriod(): PeriodDisplay {
    if (this.period === null) {
      const keys = ['start', 'duration', 'end'];
      const compare = (opt, k) => {
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
        this.sanitizeParams(this.period);
        this.saveConfig(this.config);
      }

    }

    return this.period;
  }

  updateShownPeriod(val: PeriodDisplay) {
    this.period = val;
    this.sanitizeParams(val);
    this.saveConfig(this.config);
  }

  get selected(): string[] | null {
    return targetSplitter(this.config.targets);
  }

  set selected(vals: string[] | null) {
    const targets = targetBuilder(vals || []);
    this.saveConfig({ ...this.config, targets });
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

  isRightAxis(field: string) {
    return this.config.axes[field] === 'y2';
  }

  updateAxisSide(field: string, isRight: boolean) {
    this.saveConfig({ ...this.config, axes: { ...this.axes, [field]: isRight ? 'y2' : 'y' } });
  }

  created() {
    historyStore.fetchKnownKeys();
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-card-section>
      <q-expansion-item group="modal" icon="mdi-timetable" label="Period settings">
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
            <q-item-label caption>Start time</q-item-label>
            <DatetimeField
              :value="config.params.start"
              title="Start time"
              @input="v => { config.params.start = v.getTime(); saveConfig(config); }"
            />
          </q-item-section>
          <q-item-section v-if="shownPeriod.duration" class="col-6">
            <q-item-label caption>Duration</q-item-label>
            <InputField
              :value="config.params.duration"
              title="Duration"
              @input="v => { config.params.duration = durationString(v); saveConfig(config); }"
            />
          </q-item-section>
          <q-item-section v-if="shownPeriod.end" class="col-6">
            <q-item-label caption>End time</q-item-label>
            <DatetimeField
              :value="config.params.end"
              title="End time"
              @input="v => { config.params.end = v.getTime(); saveConfig(config); }"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Averaging period</q-item-label>
            <div class="row q-mt-sm q-ml-sm">
              <div v-for="(rate, meas) in downsampling" :key="meas" class="q-mr-md">
                <q-item-label caption>{{ meas }}</q-item-label>
                {{ rate }}
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item default-opened group="modal" icon="mdi-file-tree" label="Metrics">
        <div class="scroll-parent">
          <q-scroll-area>
            <MetricSelector :selected.sync="selected"/>
          </q-scroll-area>
        </div>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-tag-multiple" label="Legend">
        <div class="scroll-parent">
          <q-scroll-area>
            <LabelSelector :selected="selected" :renames.sync="renames"/>
          </q-scroll-area>
        </div>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-chart-line" label="Axes">
        <div class="scroll-parent">
          <q-scroll-area>
            <q-item dark>
              <q-item-section>Metric</q-item-section>
              <q-item-section side>Left or right axis</q-item-section>
            </q-item>
            <q-separator dark inset/>
            <q-item
              v-for="field in selected"
              :key="field"
              dark
              clickable
              @click="updateAxisSide(field, !isRightAxis(field))"
            >
              <q-item-section>{{ field }}</q-item-section>
              <q-item-section side>
                <q-icon :class="{mirrored: isRightAxis(field)}" name="mdi-chart-line" size="30px"/>
              </q-item-section>
            </q-item>
            <q-item v-if="!selected || selected.length === 0" dark>
              <q-item-section side>No metrics selected</q-item-section>
            </q-item>
          </q-scroll-area>
        </div>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.mirrored {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
.scroll-parent {
  height: 500px;
  max-height: 60vh;
}
</style>
