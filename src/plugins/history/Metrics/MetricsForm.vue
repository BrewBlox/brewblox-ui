<script lang="ts">
import parseDuration from 'parse-duration';
import get from 'lodash/get';
import { nodeBuilder, targetSplitter, targetBuilder, QuasarNode, expandedNodes } from '@/components/Graph/functional';
import FormBase from '@/components/Form/FormBase';
import { fetchKnownKeys } from '@/store/history/actions';
import { fields } from '@/store/history/getters';
import Component from 'vue-class-component';
import { durationString } from '@/helpers/functional';
import { MetricsConfig } from './state';
import { DEFAULT_FRESH_DURATION, DEFAULT_DECIMALS } from './getters';

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

      <q-expansion-item group="modal" icon="warning" label="Old data warnings">
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
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-numeric" label="Decimals">
        <q-item dark>
          <q-item-section>Metric</q-item-section>
          <q-item-section>Decimal numbers</q-item-section>
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
              label="Decimal numbers"
              clearable
              tag="span"
            />
          </q-item-section>
          <q-item-section class="col-1">
            <q-btn icon="mdi-undo-variant" flat @click="resetDecimals(field)"/>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
