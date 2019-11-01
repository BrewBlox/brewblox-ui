<script lang="ts">
import { QTree } from 'quasar';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { mutate } from '@/helpers/functional';
import {
  defaultLabel,
  expandedNodes,
  nodeBuilder,
  QuasarNode,
  targetBuilder,
  targetSplitter,
} from '@/plugins/history/nodes';
import { historyStore } from '@/store/history';

import { GraphConfig } from '../types';


@Component
export default class GraphTargetsEditor extends Vue {
  selectFilter: string | null = null;
  expandedKeys: string[] = [];

  @Ref()
  readonly tree!: QTree;

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  @Watch('selectFilter')
  updateExpanded(filter: string): void {
    if (filter) {
      this.expandedKeys = expandedNodes(this.nodes, filter);
    }
  }

  expandTicked(): void {
    this.expandedKeys = this.ticked.map(s => s.replace(/\/[^\/]+$/, ''));
  }

  mounted(): void {
    this.expandTicked();
  }

  saveConfig(config: GraphConfig = this.config): void {
    this.$emit('update:config', config);
  }

  get ticked(): string[] {
    return targetSplitter(this.config.targets);
  }

  set ticked(vals: string[]) {
    this.$set(this.config, 'targets', targetBuilder(vals));
    vals
      .filter(key => this.config.renames[key] === undefined)
      .forEach(key => this.$set(this.config.renames, key, defaultLabel(key)));
    this.saveConfig();
  }

  get fields(): Mapped<string[]> {
    return historyStore.fields;
  }

  get nodes(): QuasarNode[] {
    return nodeBuilder(this.fields, {
      selectable: true,
      handler: this.nodeHandler,
      header: 'leaf',
    });
  }

  nodeHandler(node: QuasarNode): void {
    if (!this.tree.isTicked(node.value)) {
      this.tree.setTicked([node.value], true);
    }
    createDialog({
      component: 'GraphDisplayDialog',
      title: node.value,
      parent: this,
      config: this.config,
      field: node.value,
    })
      .onOk(config => this.saveConfig(config));
  }

  nodeFilter(node: QuasarNode, filter: string): boolean {
    return node && node.value.toLowerCase().match(filter.toLowerCase());
  }
}
</script>

<template>
  <q-list>
    <div class="q-pa-sm row wrap">
      <div class="col-auto column">
        <q-item dark>
          <q-item-section>
            <q-input v-model="selectFilter" placeholder="Filter keys" class="q-ma-none" dark clearable>
              <template #append>
                <q-icon name="search" />
              </template>
              <q-tooltip>
                Only fields that have been updated the last 24 hours are shown.
                <br />This includes renamed or deleted blocks.
              </q-tooltip>
            </q-input>
          </q-item-section>
        </q-item>
      </div>
      <div class="col-auto row">
        <q-item-section class="col-auto">
          <q-btn flat icon="mdi-collapse-all" @click="tree.collapseAll()">
            <q-tooltip>Collapse all</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat icon="mdi-expand-all" @click="tree.expandAll()">
            <q-tooltip>Expand all</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat icon="mdi-checkbox-multiple-marked-outline" @click="expandTicked">
            <q-tooltip>Expand selected fields</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat icon="clear" @click="ticked = []">
            <q-tooltip>Unselect all</q-tooltip>
          </q-btn>
        </q-item-section>
      </div>
    </div>

    <q-item dark>
      <q-tree
        ref="tree"
        :nodes="nodes"
        :ticked.sync="ticked"
        :filter="selectFilter"
        :expanded.sync="expandedKeys"
        :filter-method="nodeFilter"
        tick-strategy="leaf-filtered"
        dark
        node-key="value"
      >
        <template #header-leaf="prop">
          <div class="editable q-py-xs leaf-node-header">
            {{ prop.node.label }}
            <q-tooltip>
              <i>Click to edit</i> <br />
              Label: <span>{{ config.renames[prop.node.value] || prop.node.label }}</span> <br />
              Color: <span>
                <ColorField
                  :value="config.colors[prop.node.value] || ''"
                  null-text="automatic"
                  readonly
                />
              </span> <br />
              Axis: <span>{{ config.axes[prop.node.value] === 'y2' ? 'Y2' : 'Y1' }}</span>
            </q-tooltip>
          </div>
        </template>
      </q-tree>
    </q-item>
  </q-list>
</template>

<style>
.leaf-node-header {
  width: 100%;
}
.leaf-node-header:hover {
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}
</style>
