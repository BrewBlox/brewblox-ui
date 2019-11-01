<script lang="ts">
import get from 'lodash/get';
import parseDuration from 'parse-duration';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { durationString } from '@/helpers/functional';
import { defaultLabel, targetBuilder, targetSplitter } from '@/plugins/history/nodes';
import { DisplayNames, historyStore } from '@/store/history';

import { DEFAULT_DECIMALS, DEFAULT_FRESH_DURATION } from './getters';
import { MetricsConfig } from './types';

@Component
export default class MetricsFull extends CrudComponent<MetricsConfig> {
  DEFAULT_FRESH_DURATION = DEFAULT_FRESH_DURATION;
  parseDuration = parseDuration;
  durationString = durationString;

  @Prop({ type: Boolean, default: false })
  public readonly inDialog!: boolean;

  get config(): MetricsConfig {
    return {
      targets: [],
      renames: {},
      params: {},
      freshDuration: {},
      decimals: {},
      ...this.widget.config,
    };
  }

  get scrollParentClass(): Mapped<boolean> {
    return { 'col-grow': true, 'scroll-parent': this.inDialog };
  }

  get selectorParent(): string {
    return this.inDialog ? 'q-scroll-area' : 'div';
  }

  get selected(): string[] {
    return targetSplitter(this.config.targets);
  }

  set selected(vals: string[]) {
    const targets = targetBuilder(vals);
    const renames = vals
      .reduce(
        (acc, key) => {
          acc[key] = this.config.renames[key] || defaultLabel(key);
          return acc;
        },
        {});
    this.saveConfig({ ...this.config, targets, renames });
  }

  get renames(): DisplayNames {
    return this.config.renames;
  }

  set renames(renames: DisplayNames) {
    this.saveConfig({ ...this.config, renames });
  }

  get freshDuration(): Mapped<number> {
    return this.config.freshDuration;
  }

  get decimals(): Mapped<number> {
    return this.config.decimals;
  }

  fieldDecimals(field: string): number {
    return get(this.config.decimals, field, DEFAULT_DECIMALS);
  }

  created(): void {
    historyStore.fetchKnownKeys();
  }

  resetFreshDuration(field: string): void {
    this.$delete(this.config.freshDuration, field);
    this.saveConfig(this.config);
  }

  resetDecimals(field: string): void {
    this.$delete(this.config.decimals, field);
    this.saveConfig(this.config);
  }
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="mdi-file-tree" label="Metrics">
        <div :class="scrollParentClass">
          <component :is="selectorParent">
            <MetricSelector :selected.sync="selected" />
          </component>
        </div>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-tag-multiple" label="Labels">
        <div :class="scrollParentClass">
          <component :is="selectorParent">
            <LabelSelector :selected="selected" :renames.sync="renames" />
          </component>
        </div>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="warning" label="Old data warnings">
        <div :class="scrollParentClass">
          <component :is="selectorParent">
            <q-item dark>
              <q-item-section>Metric</q-item-section>
              <q-item-section>Warn when older than</q-item-section>
              <q-item-section class="col-1" />
            </q-item>
            <q-separator dark inset />
            <q-item v-for="field in selected" :key="field" dark>
              <q-item-section>{{ field }}</q-item-section>
              <q-item-section>
                <InputField
                  :value="durationString(freshDuration[field] || DEFAULT_FRESH_DURATION)"
                  title="Fresh duration"
                  @input="v => { freshDuration[field] = parseDuration(v); saveConfig(config); }"
                />
              </q-item-section>
              <q-item-section class="col-1">
                <q-btn icon="restore" flat @click="resetFreshDuration(field)" />
              </q-item-section>
            </q-item>
          </component>
        </div>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-numeric" label="Rounding">
        <div :class="scrollParentClass">
          <component :is="selectorParent">
            <q-item dark>
              <q-item-section>Metric</q-item-section>
              <q-item-section>Number of decimals</q-item-section>
              <q-item-section class="col-1" />
            </q-item>
            <q-separator dark inset />
            <q-item v-for="field in selected" :key="field" dark>
              <q-item-section>{{ field }}</q-item-section>
              <q-item-section>
                <InputField
                  :value="fieldDecimals(field)"
                  :decimals="0"
                  :rules="[v => v >= 0 || 'Must be 0 or more']"
                  type="number"
                  title="Number of decimals"
                  @input="v => { decimals[field] = v; saveConfig(config); }"
                />
              </q-item-section>
              <q-item-section class="col-1">
                <q-btn icon="mdi-undo-variant" flat @click="resetDecimals(field)" />
              </q-item-section>
            </q-item>
          </component>
        </div>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.scroll-parent {
  height: 300px;
  max-height: 30vh;
}
</style>
