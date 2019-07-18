<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { QuasarNode, expandedNodes, nodeBuilder } from '@/components/Graph/functional';
import { historyStore } from '@/store/history';


@Component
export default class MetricSelector extends Vue {
  selectFilter: string | null = null;
  expandedKeys: string[] = [];

  @Prop({ type: Array, required: true })
  readonly selected!: string[];

  get fields(): Record<string, string[]> {
    return historyStore.fields;
  }

  get nodes() {
    return nodeBuilder(this.fields);
  }

  get ticked(): string[] {
    return this.selected;
  }

  set ticked(vals: string[]) {
    this.$emit('update:selected', vals);
  }

  @Watch('selectFilter')
  updateExpanded(filter: string) {
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
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section class="col-auto">
        <q-btn flat label="Expand" icon="mdi-expand-all" @click="$refs.tree.expandAll()" />
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn flat label="Collapse" icon="mdi-collapse-all" @click="$refs.tree.collapseAll()" />
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn flat label="clear" icon="clear" @click="selected = []" />
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
