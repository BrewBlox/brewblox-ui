<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { mutate } from '@/helpers/functional';
import {
  defaultLabel,
  expandedNodes,
  nodeBuilder,
  QuasarNode,
  targetBuilder,
  targetSplitter,
} from '@/plugins/history/nodes';
import { historyStore, QueryConfig } from '@/store/history';


@Component
export default class GraphTargetsEditor extends Vue {
  selectFilter: string | null = null;
  expandedKeys: string[] = [];

  @Ref()
  readonly tree!: any;

  @Prop({ type: Object, required: true })
  public readonly config!: QueryConfig;

  saveConfig(config: QueryConfig = this.config): void {
    this.$emit('update:config', config);
  }

  get ticked(): string[] {
    return targetSplitter(this.config.targets);
  }

  set ticked(vals: string[]) {
    this.config.targets = targetBuilder(vals);
    this.config.renames = vals
      .reduce((acc, key) => mutate(acc, key, this.config.renames[key] || defaultLabel(key)), {});
    this.saveConfig();
  }

  get fields(): Record<string, string[]> {
    return historyStore.fields;
  }

  get nodes(): QuasarNode[] {
    return nodeBuilder(this.fields);
  }

  @Watch('selectFilter')
  updateExpanded(filter: string): void {
    if (filter) {
      this.expandedKeys = expandedNodes(this.nodes, filter);
    }
  }

  nodeFilter(node: QuasarNode, filter: string): boolean {
    return node && node.value.toLowerCase().match(filter.toLowerCase());
  }
}
</script>

<template>
  <q-list>
    <q-item dark>
      <q-item-section>
        <q-input v-model="selectFilter" placeholder="Filter keys" class="q-ma-none" dark clearable>
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-item-section>
    </q-item>
    <q-item dark dense>
      <q-item-section>
        <small>
          Only fields that have been updated the last 24 hours are shown.
          <br />This includes renamed or deleted blocks.
        </small>
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section class="col-auto">
        <q-btn flat label="Expand" icon="mdi-expand-all" @click="tree.expandAll()" />
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn flat label="Collapse" icon="mdi-collapse-all" @click="tree.collapseAll()" />
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn flat label="clear" icon="clear" @click="ticked = []" />
      </q-item-section>
    </q-item>
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
      />
    </q-item>
  </q-list>
</template>
