<script setup lang="ts" generic="T extends QueryConfig">
import { Quantity } from 'brewblox-proto/ts';
import isEqual from 'lodash/isEqual';
import { QTree, QTreeNode } from 'quasar';
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
import {
  filteredNodes,
  nodeBuilder,
  withFields,
} from '@/plugins/history/nodes';
import { useHistoryStore } from '@/plugins/history/store';
import type { QueryConfig } from '@/plugins/history/types';
import { createDialog } from '@/utils/dialog';
import { bloxQty, durationString } from '@/utils/quantity';

interface Props {
  config: T;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:config': [payload: T];
}>();

const historyStore = useHistoryStore();
const selectFilter = ref<string>('');
const expandedKeys = ref<string[]>([]);
const treeRef = ref<QTree>();
const fieldsLoaded = ref<boolean>(false);

onBeforeMount(async () => {
  await historyStore.fetchFields();
  fieldsLoaded.value = true;
});
onMounted(() => expand());

watch(
  () => selectFilter.value,
  (filter: string) => {
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

function nodeHandler(node: QTreeNode): void {
  if (!treeRef.value!.isTicked(node.value)) {
    treeRef.value?.setTicked([node.value], true);
  }
}

function nodeFilter(node: QTreeNode, filter: string): boolean {
  return new RegExp(filter, 'i').test(node?.value);
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

const listedKeys = computed<Set<string>>(
  () =>
    new Set(
      Object.entries(fields.value).flatMap(([service, keys]) =>
        keys.map((key) => `${service}/${key}`),
      ),
    ),
);

// Selected fields are always listed, so they can be deselected
const nodes = computed<QTreeNode[]>(() =>
  nodeBuilder(withFields(fields.value, ticked.value), {
    selectable: true,
    handler: nodeHandler,
    header: 'leaf',
  }),
);

function isInactive(node: QTreeNode): boolean {
  return fieldsLoaded.value && !listedKeys.value.has(node.value);
}

const ticked = computed<string[]>({
  get: () => props.config.fields,
  set: (fields) =>
    emit('update:config', {
      ...props.config,
      fields,
    }),
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
      @clear="selectFilter = ''"
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
      title="Listed fields"
      label="Show fields from the last"
      message="
      Only fields with a value logged in this period are listed.
      Selected fields are always listed:
      they are greyed out when they have no values in this period.
      "
      class="col-grow"
    />

    <div class="col-auto row no-wrap self-end">
      <q-btn
        flat
        dense
        icon="mdi-expand-all"
        @click="expand"
      >
        <q-tooltip>Expand</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        icon="mdi-collapse-all"
        @click="collapse"
      >
        <q-tooltip>Collapse</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        icon="mdi-checkbox-blank-off-outline"
        @click="ticked = []"
      >
        <q-tooltip>Clear selection</q-tooltip>
      </q-btn>
    </div>

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
      <template #header-leaf="leafprops">
        <div
          class="row no-wrap items-center full-width"
          :class="{ 'text-grey': isInactive(leafprops.node) }"
        >
          <div class="col q-pa-xs editable hoverable rounded-borders">
            <slot
              name="leaf"
              :node="leafprops.node"
            />
          </div>
          <q-icon
            v-if="isInactive(leafprops.node)"
            name="mdi-clock-alert-outline"
            class="q-ml-sm"
          >
            <q-tooltip>
              No values logged in the last {{ durationString(fieldsDuration) }}
            </q-tooltip>
          </q-icon>
        </div>
      </template>
    </q-tree>
  </div>
</template>
