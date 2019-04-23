<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import { defaultPresets } from '@/components/Graph/getters';
import { nodeBuilder, targetSplitter, targetBuilder, QuasarNode, expandedNodes } from '@/components/Graph/functional';
import FormBase from '@/components/Form/FormBase';
import { durationString } from '@/helpers/functional';
import parseDuration from 'parse-duration';
import { ValueAxes, QueryParams } from '@/store/history/state';
import { fetchKnownKeys } from '@/store/history/actions';
import { fields } from '@/store/history/getters';
import Component from 'vue-class-component';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component
export default class GraphForm extends FormBase {
  durationString = durationString;

  period: PeriodDisplay | null = null;
  selectFilter: string | null = null;
  expandedKeys: string[] = [];

  get config(): GraphConfig {
    return this.$props.field;
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

  get fields() {
    return fields(this.$store) as { [key: string]: string[] };
  }

  get nodes() {
    return nodeBuilder(this.fields);
  }

  get selected(): string[] | null {
    return targetSplitter(this.config.targets);
  }

  set selected(vals: string[] | null) {
    this.saveConfig({ ...this.config, targets: targetBuilder(vals || []) });
  }

  get renames() {
    return this.config.renames;
  }

  get axes(): ValueAxes {
    return this.config.axes;
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isRightAxis(field: string) {
    return this.config.axes[field] === 'y2';
  }

  updateAxisSide(field: string, isRight: boolean) {
    this.config.axes[field] = isRight ? 'y2' : 'y';
    this.saveConfig(this.config);
  }

  created() {
    fetchKnownKeys(this.$store);
  }

  callAndSaveConfig(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConfig(this.config); };
  }

  nodeFilter(node: QuasarNode, filter: string): boolean {
    return node && node.value.toLowerCase().match(filter.toLowerCase());
  }

  updateExpanded(filter: string) {
    if (filter) {
      this.expandedKeys = expandedNodes(this.nodes, filter);
    }
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!$props.embedded" v-bind="$props"/>

    <q-card-section>
      <q-expansion-item group="modal" icon="mdi-timetable" label="Period settings">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Display type</q-item-label>
            <SelectPopupEdit
              :field="shownPeriod"
              :options="periodOptions"
              :change="updateShownPeriod"
              label="Display type"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section v-if="shownPeriod.start" class="col-6">
            <q-item-label caption>Start time</q-item-label>
            <DatetimePopupEdit
              :field="config.params.start"
              :change="callAndSaveConfig(v => config.params.start = v.getTime())"
              label="Start time"
              tag="span"
            />
          </q-item-section>
          <q-item-section v-if="shownPeriod.duration" class="col-6">
            <q-item-label caption>Duration</q-item-label>
            <InputPopupEdit
              :field="config.params.duration"
              :change="callAndSaveConfig(v => config.params.duration = durationString(v))"
              clearable
              label="Duration"
              tag="span"
            />
          </q-item-section>
          <q-item-section v-if="shownPeriod.end" class="col-6">
            <q-item-label caption>End time</q-item-label>
            <DatetimePopupEdit
              :field="config.params.end"
              :change="callAndSaveConfig(v => config.params.end = v.getTime())"
              label="End time"
              tag="span"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-file-tree" label="Metrics">
        <q-item dark>
          <q-item-section>
            <q-input
              :value="selectFilter"
              placeholder="Filter keys"
              class="q-ma-none"
              dark
              clearable
              @input="v => { selectFilter = v; updateExpanded(v); }"
            >
              <template v-slot:append>
                <q-btn flat round icon="mdi-close-circle" @click.stop="selectFilter = ''">
                  <q-tooltip>Clear filter</q-tooltip>
                </q-btn>
                <q-icon name="search"/>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section class="col-auto">
            <q-btn flat label="Expand" icon="mdi-expand-all" @click="$refs.tree.expandAll()"/>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn flat label="Collapse" icon="mdi-collapse-all" @click="$refs.tree.collapseAll()"/>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn flat label="clear" icon="clear" @click="selected = []"/>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-scroll-area style="height: 300px; max-height: 30vh">
              <q-tree
                ref="tree"
                :nodes="nodes"
                :ticked.sync="selected"
                :filter="selectFilter"
                :expanded.sync="expandedKeys"
                :filter-method="nodeFilter"
                tick-strategy="leaf-filtered"
                dark
                node-key="value"
              />
            </q-scroll-area>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-tag-multiple" label="Legend">
        <q-item dark>
          <q-item-section>Metric</q-item-section>
          <q-item-section>Display as</q-item-section>
        </q-item>
        <q-separator dark inset/>
        <q-item v-for="field in selected" :key="field" dark>
          <q-item-section>{{ field }}</q-item-section>
          <q-item-section>
            <InputPopupEdit
              :field="renames[field]"
              :change="callAndSaveConfig(v => config.renames[field] = v)"
              label="Legend"
              clearable
              tag="span"
            />
          </q-item-section>
        </q-item>
        <q-item v-if="!selected || selected.length === 0" dark>
          <q-item-section side>No metrics selected</q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-chart-line" label="Axes">
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
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.mirrored {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
