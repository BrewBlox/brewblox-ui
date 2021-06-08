<script lang="ts">
import defaults from 'lodash/defaults';
import { nanoid } from 'nanoid';
import { computed, defineComponent, onBeforeUnmount, onMounted, watch } from 'vue';

import { useContext, useWidget } from '@/composables';
import { addSource } from '@/plugins/history/sources/metrics';
import { historyStore } from '@/plugins/history/store';
import { MetricsResult, MetricsSource, QueryTarget } from '@/plugins/history/types';
import { durationString, fixedNumber, isJsonEqual } from '@/utils';

import { DEFAULT_DECIMALS, DEFAULT_FRESH_DURATION } from './const';
import { MetricsConfig, MetricsWidget } from './types';
import { emptyMetricsConfig } from './utils';

interface CurrentValue extends MetricsResult {
  name: string;
  stale: boolean;
}

export default defineComponent({
  name: 'MetricsBasic',
  props: {
    revision: {
      type: Date,
      required: true,
    },
  },
  setup(props) {
    const metricsId = nanoid();
    const {
      context,
    } = useContext.setup();
    const {
      widget,
    } = useWidget.setup<MetricsWidget>();

    const config = computed<MetricsConfig>(
      () => defaults(widget.value.config, emptyMetricsConfig()),
    );

    function sourceId(target: QueryTarget): string {
      return `${metricsId}/${target.measurement}`;
    }

    const sources = computed<MetricsSource[]>(
      () => config.value.targets
        .map(target => historyStore.sourceById(sourceId(target)))
        .filter((source): source is MetricsSource => source != null),
    );

    function fieldFreshDuration(field: string): number {
      return config.value.freshDuration[field] ?? DEFAULT_FRESH_DURATION;
    }

    function fieldDecimals(field: string): number {
      return config.value.decimals[field] ?? DEFAULT_DECIMALS;
    }

    function fixedValue(value: CurrentValue): string {
      return fixedNumber(value.value, fieldDecimals(value.field));
    }

    const values = computed<CurrentValue[]>(
      () => {
        const now = new Date().getTime();
        return sources.value
          .flatMap(source => source.values)
          .map(result => ({
            ...result,
            name: config.value.renames[result.field] || result.field,
            stale: !!result.time && (now - result.time as number > fieldFreshDuration(result.field)),
          }));
      },
    );

    function addSources(): void {
      config.value.targets
        .forEach(target =>
          addSource(
            sourceId(target),
            config.value.params,
            config.value.renames,
            target,
          ));
    }

    function removeSources(): void {
      sources.value.forEach(historyStore.removeSource);
    }

    function resetSources(): void {
      removeSources();
      addSources();
    }

    watch(
      () => config.value,
      (newV, oldV) => {
        if (!isJsonEqual(newV, oldV)) {
          resetSources();
        }
      },
      { deep: true },
    );

    watch(
      () => props.revision,
      () => resetSources(),
    );

    onMounted(() => resetSources());
    onBeforeUnmount(() => removeSources());

    return {
      context,
      metricsId,
      config,
      sources,
      values,
      fixedValue,
      durationString,
      fieldFreshDuration,
    };
  },
});
</script>

<template>
  <div>
    <div v-if="config.targets.length === 0">
      <div class="text-italic text-h6 q-pa-md darkened text-center">
        Add metrics to get started.
      </div>
    </div>
    <CardWarning v-else-if="values.length === 0">
      <template #message>
        Waiting for data...
      </template>
    </CardWarning>

    <div class="widget-body column">
      <LabeledField
        v-for="val in values"
        :key="val.field"
        :label="val.name"
      >
        <span :class="['text-big', val.stale && 'darkened']">
          {{ fixedValue(val) }}
        </span>
        <template v-if="val.stale" #after>
          <q-icon name="warning" size="24px" />
          <q-tooltip>
            {{ val.name }} was updated more than {{ durationString(fieldFreshDuration(val.field)) }} ago.
            <br>
            Last update: {{ new Date(val.time).toLocaleString() }}.
          </q-tooltip>
        </template>
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
