<script lang="ts">
import { QTree } from 'quasar';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import {
  defaultLabel,
  filteredNodes,
  nodeBuilder,
  targetBuilder,
  targetSplitter,
} from '@/plugins/history/nodes';
import { historyStore } from '@/plugins/history/store';
import { QueryConfig } from '@/plugins/history/types';


@Component
export default class QueryEditor extends Vue {
  selectFilter: string | null = null;
  expandedKeys: string[] = [];

  @Ref()
  readonly tree!: QTree;

  @Prop({ type: Object, required: true })
  public readonly config!: QueryConfig;

  @Watch('selectFilter')
  updateExpanded(filter: string): void {
    if (filter) {
      this.expandedKeys = filteredNodes(this.nodes, filter);
    }
  }

  created(): void {
    historyStore.fetchKnownKeys();
  }

  mounted(): void {
    this.expandTicked();
  }

  expandTicked(): void {
    /**
     * Expanded keys must include parent elements
     * If we selected sparkey/blocky/value,
     * we must expand the following keys:
     * - sparkey
     * - sparkey/blocky
     */
    this.expandedKeys = [...new Set(
      this.ticked
        .flatMap(s => s
          // Remove leaf node -> 'sparkey/blocky'
          .replace(/\/[^\/]+$/, '')
          // Split in sections -> ['sparkey', 'blocky']
          .split('/')
          // Gradually build parents -> ['sparkey', 'sparkey/blocky']
          .map((v, idx, arr) => arr.slice(0, idx + 1).join('/')))
    )];
  }

  saveConfig(config: QueryConfig = this.config): void {
    this.$emit('update:config', config);
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

  get ticked(): string[] {
    return targetSplitter(this.config.targets);
  }

  set ticked(vals: string[]) {
    this.$set(this.config, 'targets', targetBuilder(vals, this.fields));
    vals
      .filter(key => this.config.renames[key] === undefined)
      .forEach(key => this.$set(this.config.renames, key, defaultLabel(key)));
    this.saveConfig();
  }

  nodeHandler(node: QuasarNode): void {
    if (!this.tree.isTicked(node.value)) {
      this.tree.setTicked([node.value], true);
    }
  }

  nodeFilter(node: QuasarNode, filter: string): boolean {
    return node && node.value.toLowerCase().match(filter.toLowerCase());
  }
}
</script>

<template>
  <q-list>
    <q-input v-model="selectFilter" placeholder="Search" clearable item-aligned class="q-mx-sm">
      <template #append>
        <q-icon name="search" />
      </template>
      <q-tooltip>
        Only fields that have been updated the last 24 hours are shown.
        <br>This includes renamed or deleted blocks.
      </q-tooltip>
    </q-input>
    <div class="col-auto row justify-end q-gutter-x-sm q-gutter-y-xs q-mx-sm">
      <q-btn flat icon="mdi-collapse-all" @click="tree.collapseAll()">
        <q-tooltip>Collapse all</q-tooltip>
      </q-btn>
      <q-btn flat icon="mdi-expand-all" @click="tree.expandAll()">
        <q-tooltip>Expand all</q-tooltip>
      </q-btn>
      <q-btn flat icon="mdi-checkbox-multiple-marked-outline" @click="expandTicked">
        <q-tooltip>Expand selected fields</q-tooltip>
      </q-btn>
      <q-btn flat icon="clear" @click="ticked = []">
        <q-tooltip>Unselect all</q-tooltip>
      </q-btn>
    </div>

    <q-item class="column">
      <q-tree
        ref="tree"
        :nodes="nodes"
        :ticked.sync="ticked"
        :expanded.sync="expandedKeys"
        :filter="selectFilter"
        :filter-method="nodeFilter"
        tick-strategy="leaf"
        node-key="value"
      >
        <template #header-leaf="props">
          <div class="q-pa-xs full-width editable hoverable rounded-borders">
            <slot name="leaf" :node="props.node" />
          </div>
        </template>
      </q-tree>
    </q-item>
  </q-list>
</template>
