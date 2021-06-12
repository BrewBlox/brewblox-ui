<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { dashboardStore } from '@/store/dashboards';
import { Widget, widgetStore } from '@/store/widgets';
import { makeObjectSorter } from '@/utils/functional';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'LinkedWidgetCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      required: true,
    },
    types: {
      type: Array as PropType<string[]>,
      required: true,
    },
    label: {
      type: String,
      default: 'Widget',
    },
    filter: {
      type: Function as PropType<(w: Widget) => boolean>,
      default: null,
    },
  },
  emits: [
    'update:part',
  ],
  setup(props, { emit }) {

    const linked = computed<string | null>({
      get: () => props.part.settings[props.settingsKey] ?? null,
      set: v => emit('update:part', {
        ...props.part,
        settings: {
          ...props.part.settings,
          [props.settingsKey]: v,
        },
      }),
    });

    const broken = computed<boolean>(
      () => linked.value !== null
        && !widgetStore.widgetIds.includes(linked.value),
    );

    const actualFilter = computed<(v: Widget) => boolean>(
      () => props.filter ?? (v => props.types.includes(v.feature)),
    );

    const linkedOpts = computed<SelectOption[]>(
      () => widgetStore.widgets
        .filter(actualFilter.value)
        .sort(makeObjectSorter('title'))
        .map(widget => ({
          label: `[${dashboardStore.dashboardTitle(widget.dashboard)}] ${widget.title}`,
          value: widget.id,
        })),
    );

    return {
      linked,
      linkedOpts,
      broken,
    };
  },
});
</script>

<template>
  <q-select
    v-model="linked"
    :options="linkedOpts"
    :label="label"
    :error="broken"
    clearable
    map-options
    emit-value
    item-aligned
  >
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
    <template #error>
      <div>Link broken: widget not found</div>
    </template>
  </q-select>
</template>
