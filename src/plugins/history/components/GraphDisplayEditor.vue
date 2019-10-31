<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { defaultLabel } from '@/plugins/history/nodes';
import { DisplayNames, GraphValueAxes } from '@/store/history';

import { targetSplitter } from '../nodes';
import { GraphConfig } from '../types';


@Component
export default class GraphDisplayEditor extends Vue {
  defaultLabel = defaultLabel;
  axisOpts: SelectOption[] = [
    {
      value: 'y',
      label: 'Y1',
    },
    {
      value: 'y2',
      label: 'Y2',
    },
  ];

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  saveConfig(config: GraphConfig = this.config): void {
    this.$emit('update:config', config);
  }

  get selected(): string[] {
    return targetSplitter(this.config.targets);
  }

  get renames(): DisplayNames {
    return this.config.renames;
  }

  set renames(renames: DisplayNames) {
    this.saveConfig({ ...this.config, renames });
  }

  saveAxis(field: string, value: GraphValueAxes['']): void {
    this.config.axes[field] = value;
    this.saveConfig();
  }

  saveColor(field: string, color: string | null): void {
    this.config.colors[field] = color || '';
    this.saveConfig();
  }

  fieldRename(field): string {
    return this.config.renames[field] || defaultLabel(field);
  }

  saveRename(field: string, label: string | null): void {
    this.config.renames[field] = label || defaultLabel(field);
    this.saveConfig();
  }
}
</script>

<template>
  <q-list dark>
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
                Label
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <InputField :value="fieldRename(field)" title="Legend" @input="v => saveRename(field, v)" />
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
                :value="config.colors[field] || ''"
                title="Line color"
                clearable
                @input="v => saveColor(field, v)"
              />
            </q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>
                Y-axis
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <q-btn-toggle
                :value="config.axes[field] || 'y'"
                :options="axisOpts"
                flat
                stretch
                @input="v => saveAxis(field, v)"
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
  </q-list>
</template>
