<script lang="ts">
import { QTree, throttle } from 'quasar';
import { computed, defineComponent, onBeforeMount, onMounted, PropType, ref, watch } from 'vue';

import {
  defaultLabel,
  filteredNodes,
  nodeBuilder,
  targetBuilder,
  targetSplitter,
} from '@/plugins/history/nodes';
import { historyStore } from '@/plugins/history/store';
import { DisplayNames, QueryConfig } from '@/plugins/history/types';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'QueryEditor',
  props: {
    config: {
      type: Object as PropType<QueryConfig>,
      required: true,
    },
  },
  emits: ['update:config'],
  setup(props, { emit }) {
    const selectFilter = ref<string | null>(null);
    const expandedKeys = ref<string[]>([]);
    const showStale = ref(false);
    const treeRef = ref<QTree>();

    const limFetchFresh = throttle(historyStore.fetchFreshFields, 10000);
    const limFetchAll = throttle(historyStore.fetchAllFields, 10000);

    onBeforeMount(() => limFetchFresh());
    onMounted(() => expandTicked());

    watch(
      () => selectFilter.value,
      (filter: string | null) => {
        if (filter) {
          expandedKeys.value = filteredNodes(nodes.value, filter);
        }
      },
    );

    watch(
      () => showStale.value,
      (value) => value
        ? limFetchAll()
        : limFetchFresh(),
    );

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: selectFilter.value,
        },
      })
        .onOk(v => selectFilter.value = v);
    }

    function expandTicked(): void {
      /**
       * Expanded keys must include parent elements
       * If we selected sparkey/blocky/value,
       * we must expand the following keys:
       * - sparkey
       * - sparkey/blocky
       */
      expandedKeys.value = [...new Set(
        ticked
          .value
          .flatMap(s => s
            // Remove leaf node -> 'sparkey/blocky'
            .replace(/\/[^\/]+$/, '')
            // Split in sections -> ['sparkey', 'blocky']
            .split('/')
            // Gradually build parents -> ['sparkey', 'sparkey/blocky']
            .map((v, idx, arr) => arr.slice(0, idx + 1).join('/'))),
      )];
    }

    function saveConfig(config: QueryConfig): void {
      emit('update:config', config);
    }

    function nodeHandler(node: QuasarNode): void {
      if (!treeRef.value!.isTicked(node.value)) {
        treeRef.value?.setTicked([node.value], true);
      }
    }

    function nodeFilter(node: QuasarNode, filter: string): boolean {
      return node && node.value.toLowerCase().match(filter.toLowerCase());
    }

    const fields = computed<Mapped<string[]>>(
      () => showStale.value
        ? historyStore.allFields
        : historyStore.freshFields,
    );

    const nodes = computed<QuasarNode[]>(
      () => nodeBuilder(fields.value, {
        selectable: true,
        handler: nodeHandler,
        header: 'leaf',
      }),
    );

    const ticked = computed<string[]>({
      get: () => targetSplitter(props.config.targets),
      set: vals => {
        const targets = targetBuilder(vals, fields.value);
        const renames: DisplayNames = {};
        vals
          .filter(key => props.config.renames[key] === undefined)
          .forEach(key => renames[key] = defaultLabel(key));
        saveConfig({
          ...props.config,
          targets: {
            ...props.config.targets,
            ...targets,
          },
          renames: {
            ...props.config.renames,
            ...renames,
          },
        });
      },
    });

    return {
      selectFilter,
      expandedKeys,
      showStale,
      treeRef,
      showSearchKeyboard,
      expandTicked,
      saveConfig,
      nodeHandler,
      nodeFilter,
      fields,
      nodes,
      ticked,
    };
  },
});
</script>

<template>
  <q-list>
    <q-input
      v-model="selectFilter"
      placeholder="Search"
      clearable
      item-aligned
      class="q-mx-sm"
    >
      <template #append>
        <KeyboardButton @click="showSearchKeyboard" />
        <q-icon name="search" />
      </template>
    </q-input>
    <div class="col-auto row justify-end q-gutter-x-sm q-gutter-y-xs q-mx-sm">
      <q-btn flat icon="mdi-collapse-all" @click="treeRef?.collapseAll()">
        <q-tooltip>Collapse all</q-tooltip>
      </q-btn>
      <q-btn flat icon="mdi-expand-all" @click="treeRef?.expandAll()">
        <q-tooltip>Expand all</q-tooltip>
      </q-btn>
      <q-btn flat icon="mdi-checkbox-multiple-marked-outline" @click="expandTicked">
        <q-tooltip>Expand selected fields</q-tooltip>
      </q-btn>
      <q-btn flat icon="clear" @click="ticked = []">
        <q-tooltip>Unselect all</q-tooltip>
      </q-btn>
    </div>
    <ToggleButton
      v-model="showStale"
      label="Include old fields"
      class="q-mx-sm"
    >
      <q-tooltip>
        By default, deleted or renamed fields are removed from the list after 24h.
        <br>Enable this option to show all fields known to the database.
      </q-tooltip>
    </ToggleButton>

    <q-item class="column">
      <q-tree
        ref="treeRef"
        v-model:ticked="ticked"
        v-model:expanded="expandedKeys"
        :nodes="nodes"
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
