<script lang="ts">
import isEqual from 'lodash/isEqual';
import { LooseDictionary, QTree } from 'quasar';
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';

import {
  filteredNodes,
  nodeBuilder,
  targetBuilder,
  targetSplitter,
} from '@/plugins/history/nodes';
import { useHistoryStore } from '@/plugins/history/store';
import type { QueryConfig } from '@/plugins/history/types';
import { Quantity } from '@/shared-types';
import { createDialog } from '@/utils/dialog';
import { bloxQty } from '@/utils/quantity';

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
    const historyStore = useHistoryStore();
    const selectFilter = ref<string>();
    const expandedKeys = ref<string[]>([]);
    const treeRef = ref<QTree>();

    onBeforeMount(() => historyStore.fetchFields());
    onMounted(() => expand());

    watch(
      () => selectFilter.value,
      (filter: string | undefined) => {
        if (filter) {
          expandedKeys.value = filteredNodes(nodes.value, filter);
        }
      },
    );

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: selectFilter.value,
        },
      }).onOk((v) => (selectFilter.value = v));
    }

    /**
     * Calculate expanded keys if we want to (only) see all ticked values.
     *
     * Expanded keys must include parent elements
     * If we selected sparkey/blocky/value,
     * we must expand the following keys:
     * - sparkey
     * - sparkey/blocky
     */
    function calcTickedExpanded(): string[] {
      return [
        ...new Set(
          ticked.value
            .flatMap((s) =>
              s
                // Remove leaf node -> 'sparkey/blocky'
                .replace(/\/[^\/]+$/, '')
                // Split in sections -> ['sparkey', 'blocky']
                .split('/')
                // Gradually build parents -> ['sparkey', 'sparkey/blocky']
                .map((v, idx, arr) => arr.slice(0, idx + 1).join('/')),
            )
            .sort(),
        ),
      ];
    }

    function expand(): void {
      const tickedExpanded = calcTickedExpanded();

      // First try to equalize expansion and selection
      if (!isEqual(tickedExpanded, expandedKeys.value)) {
        expandedKeys.value = tickedExpanded;
      }
      // On next call, expand all
      else {
        treeRef.value?.expandAll();
      }
    }

    function collapse(): void {
      const tickedExpanded = calcTickedExpanded();

      // First try to equalize expansion and selection
      if (!isEqual(tickedExpanded, expandedKeys.value)) {
        expandedKeys.value = tickedExpanded;
      }
      // On next call, collapse all
      else {
        treeRef.value?.collapseAll();
      }
    }

    function saveConfig(config: QueryConfig): void {
      emit('update:config', config);
    }

    function nodeHandler(node: QuasarNode): void {
      if (!treeRef.value!.isTicked(node.value)) {
        treeRef.value?.setTicked([node.value], true);
      }
    }

    function nodeFilter(node: LooseDictionary, filter: string): boolean {
      return (
        node?.value?.toLowerCase().match(filter.toLowerCase()) !== undefined
      );
    }

    const fieldsDuration = computed<Quantity>({
      get: () => historyStore.fieldsDuration,
      set: (v) => {
        const jsv = bloxQty(v);
        if (!jsv.eq(historyStore.fieldsDuration)) {
          historyStore.fieldsDuration = jsv;
          historyStore.fetchFields();
        }
      },
    });

    const fields = computed<Mapped<string[]>>(() => historyStore.fields);

    const nodes = computed<QuasarNode[]>(() =>
      nodeBuilder(fields.value, {
        selectable: true,
        handler: nodeHandler,
        header: 'leaf',
      }),
    );

    const ticked = computed<string[]>({
      get: () => targetSplitter(props.config.targets),
      set: (vals) =>
        saveConfig({
          ...props.config,
          targets: targetBuilder(vals, fields.value),
        }),
    });

    return {
      selectFilter,
      expandedKeys,
      treeRef,
      showSearchKeyboard,
      expand,
      collapse,
      saveConfig,
      nodeFilter,
      fieldsDuration,
      fields,
      nodes,
      ticked,
    };
  },
});
</script>

<template>
  <div class="widget-body row">
    <q-input
      v-model="selectFilter"
      placeholder="Search"
      clearable
      autofocus
      class="col-grow"
    >
      <template #append>
        <KeyboardButton @click="showSearchKeyboard" />
        <q-icon name="search" />
      </template>
    </q-input>

    <div class="col-break" />

    <slot name="settings" />

    <div class="col-break" />

    <DurationField
      v-model="fieldsDuration"
      title="Inactive fields filter"
      label="Hide after"
      message="
      Stale fields are automatically hidden.
      Select the cutoff period:
      only fields with a published value more recent than this are shown.
      "
      class="col-auto min-width-sm"
    />

    <q-btn flat dense icon="mdi-expand-all" class="self-end" @click="expand">
      <q-tooltip>Expand</q-tooltip>
    </q-btn>
    <q-btn
      flat
      dense
      icon="mdi-collapse-all"
      class="self-end"
      @click="collapse"
    >
      <q-tooltip>Collapse</q-tooltip>
    </q-btn>
    <q-btn
      flat
      dense
      icon="mdi-checkbox-blank-off-outline"
      class="self-end"
      @click="ticked = []"
    >
      <q-tooltip>Clear selection</q-tooltip>
    </q-btn>

    <div class="col-break" />

    <q-tree
      ref="treeRef"
      v-model:ticked="ticked"
      v-model:expanded="expandedKeys"
      :nodes="nodes"
      :filter="selectFilter"
      :filter-method="nodeFilter"
      tick-strategy="leaf"
      node-key="value"
      class="col-grow"
    >
      <template #header-leaf="props">
        <div class="q-pa-xs full-width editable hoverable rounded-borders">
          <slot name="leaf" :node="props.node" />
        </div>
      </template>
    </q-tree>
  </div>
</template>
