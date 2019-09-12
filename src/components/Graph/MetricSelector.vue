<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { expandedNodes, nodeBuilder, QuasarNode } from '@/components/Graph/functional';
import { historyStore } from '@/store/history';


@Component
export default class MetricSelector extends Vue {
  selectFilter: string | null = null;
  expandedKeys: string[] = [];

  @Ref()
  readonly tree!: any;

  @Prop({ type: Array, required: true })
  readonly selected!: string[];

  get ticked(): string[] {
    return this.selected;
  }

  set ticked(vals: string[]) {
    this.$emit('update:selected', vals);
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
          <template v-slot:append>
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
