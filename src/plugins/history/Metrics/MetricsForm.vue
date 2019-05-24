<script lang="ts">
import get from 'lodash/get';
import parseDuration from 'parse-duration';
import Component from 'vue-class-component';

import FormBase from '@/components/Form/FormBase';
import { QuasarNode, expandedNodes,nodeBuilder, targetBuilder, targetSplitter } from '@/components/Graph/functional';
import { durationString } from '@/helpers/functional';
import historyStore from '@/store/history';

import { DEFAULT_DECIMALS,DEFAULT_FRESH_DURATION } from './getters';
import { MetricsConfig } from './types';

@Component
export default class MetricsForm extends FormBase {
  DEFAULT_FRESH_DURATION = DEFAULT_FRESH_DURATION;
  parseDuration = parseDuration;
  durationString = durationString;

  selectFilter: string | null = null;
  expandedKeys: string[] = [];

  get config(): MetricsConfig {
    return this.$props.field;
  }

  get fields(): Record<string, string[]> {
    return historyStore.fields;
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

  get freshDuration() {
    return this.config.freshDuration;
  }

  get decimals() {
    return this.config.decimals;
  }

  fieldDecimals(field: string) {
    return get(this.config.decimals, field, DEFAULT_DECIMALS);
  }

  created() {
    historyStore.fetchKnownKeys();
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

  resetFreshDuration(field: string) {
    this.$delete(this.config.freshDuration, field);
    this.saveConfig(this.config);
  }

  resetDecimals(field: string) {
    this.$delete(this.config.decimals, field);
    this.saveConfig(this.config);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!$props.embedded" v-bind="$props"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="mdi-file-tree" label="Metrics">
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
          <q-item-section class="scroll-parent">
            <q-scroll-area>
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

      <q-expansion-item group="modal" icon="mdi-tag-multiple" label="Labels">
        <div class="scroll-parent">
          <q-scroll-area>
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
                  label="Label"
                  clearable
                  tag="span"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="!selected || selected.length === 0" dark>
              <q-item-section side>No metrics selected</q-item-section>
            </q-item>
          </q-scroll-area>
        </div>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="warning" label="Old data warnings">
        <div class="scroll-parent">
          <q-scroll-area>
            <q-item dark>
              <q-item-section>Metric</q-item-section>
              <q-item-section>Warn when older than</q-item-section>
              <q-item-section class="col-1"/>
            </q-item>
            <q-separator dark inset/>
            <q-item v-for="field in selected" :key="field" dark>
              <q-item-section>{{ field }}</q-item-section>
              <q-item-section>
                <InputPopupEdit
                  :field="durationString(freshDuration[field] || DEFAULT_FRESH_DURATION)"
                  :change="callAndSaveConfig(v => freshDuration[field] = parseDuration(v))"
                  label="Fresh duration"
                  clearable
                  tag="span"
                />
              </q-item-section>
              <q-item-section class="col-1">
                <q-btn icon="restore" flat @click="resetFreshDuration(field)"/>
              </q-item-section>
            </q-item>
          </q-scroll-area>
        </div>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-numeric" label="Rounding">
        <div class="scroll-parent">
          <q-scroll-area>
            <q-item dark>
              <q-item-section>Metric</q-item-section>
              <q-item-section>Number of decimals</q-item-section>
              <q-item-section class="col-1"/>
            </q-item>
            <q-separator dark inset/>
            <q-item v-for="field in selected" :key="field" dark>
              <q-item-section>{{ field }}</q-item-section>
              <q-item-section>
                <InputPopupEdit
                  :field="fieldDecimals(field)"
                  :change="callAndSaveConfig(v => decimals[field] = v)"
                  :decimals="0"
                  :popup-props="{validate: (v) => v >= 0}"
                  type="number"
                  label="Number of decimals"
                  clearable
                  tag="span"
                />
              </q-item-section>
              <q-item-section class="col-1">
                <q-btn icon="mdi-undo-variant" flat @click="resetDecimals(field)"/>
              </q-item-section>
            </q-item>
          </q-scroll-area>
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
