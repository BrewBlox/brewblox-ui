<script setup lang="ts">
import defaults from 'lodash/defaults';
import { nanoid } from 'nanoid';
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useContext, useWidget } from '@/composables';
import { defaultLabel } from '@/plugins/history/nodes';
import { useHistoryStore } from '@/plugins/history/store';
import {
  MetricsConfig,
  MetricsSource,
  MetricValue,
} from '@/plugins/history/types';
import { emptyMetricsConfig } from '@/plugins/history/utils';
import { isJsonEqual } from '@/utils/objects';
import { durationString, fixedNumber, shortDateString } from '@/utils/quantity';
import { DEFAULT_METRICS_DECIMALS, DEFAULT_METRICS_EXPIRY_MS } from '../const';
import { MetricsWidget } from './types';

interface CurrentValue extends MetricValue {
  name: string;
  stale: boolean;
}

interface Props {
  revision: Date;
}

const props = defineProps<Props>();

const historyStore = useHistoryStore();
const metricsId = nanoid();
const { context } = useContext.setup();
const { widget } = useWidget.setup<MetricsWidget>();

const config = computed<MetricsConfig>(() =>
  defaults(widget.value.config, emptyMetricsConfig()),
);

const source = computed<MetricsSource | null>(
  () => historyStore.sourceById<MetricsSource>(metricsId)?.value ?? null,
);

function fieldFreshDuration(field: string): number {
  return config.value.freshDuration[field] ?? DEFAULT_METRICS_EXPIRY_MS;
}

function fieldDecimals(field: string): number {
  return config.value.decimals[field] ?? DEFAULT_METRICS_DECIMALS;
}

function fixedValue(value: CurrentValue): string {
  return fixedNumber(value.value, fieldDecimals(value.field));
}

const values = computed<CurrentValue[]>(() => {
  const now = new Date().getTime();
  return (
    source.value?.values.map((result) => ({
      ...result,
      name: config.value.renames[result.field] || defaultLabel(result.field),
      stale:
        !!result.time &&
        ((now - result.time) as number) > fieldFreshDuration(result.field),
    })) ?? []
  );
});

function createSource(): void {
  historyStore.createMetricsSource(
    metricsId,
    config.value.params,
    config.value.renames,
    config.value.fields,
  );
}

function removeSource(): void {
  historyStore.removeSource(metricsId);
}

function resetSource(): void {
  removeSource();
  createSource();
}

watch(
  () => config.value,
  (newV, oldV) => {
    if (!isJsonEqual(newV, oldV)) {
      resetSource();
    }
  },
  { deep: true },
);

watch(
  () => props.revision,
  () => resetSource(),
);

onMounted(() => resetSource());
onBeforeUnmount(() => removeSource());
</script>

<template>
  <div>
    <div v-if="config.fields.length === 0">
      <div class="text-italic text-h6 q-pa-md darkened text-center">
        Add metrics to get started.
      </div>
    </div>
    <CardWarning v-else-if="values.length === 0">
      <template #message> Waiting for data... </template>
    </CardWarning>

    <div class="widget-body column">
      <LabeledField
        v-for="val in values"
        :key="val.field"
        :label="val.name"
        tag-class="row items-center q-gutter-x-sm"
      >
        <div :class="['text-big col-auto', val.stale && 'darkened']">
          {{ fixedValue(val) }}
        </div>
        <div
          v-if="val.stale"
          class="col-auto"
        >
          <q-icon
            name="warning"
            size="24px"
          />
          <q-tooltip>
            {{ val.name }} was updated more than
            {{ durationString(fieldFreshDuration(val.field)) }} ago.
            <br />
            Last update: {{ shortDateString(val.time) }}.
          </q-tooltip>
        </div>
      </LabeledField>
    </div>
    <div
      v-if="values.length === 0"
      class="column q-px-md"
    >
      <q-btn
        flat
        dense
        color="secondary"
        icon="edit"
        label="Edit metrics"
        class="self-end"
        @click="context.mode = 'Full'"
      />
    </div>
  </div>
</template>
