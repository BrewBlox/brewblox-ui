<script setup lang="ts">
import { Link, SetpointProfileBlock } from 'brewblox-proto/ts';
import { Layout, PlotData } from 'plotly.js';
import { computed, provide, shallowRef, watchEffect } from 'vue';
import { GraphDataKey } from '@/components/graph/symbols';
import { useContext, useGlobals } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createComponentDialog } from '@/utils/dialog';
import { durationMs, parseDate, prettyLink } from '@/utils/quantity';
import ProfileExportAction from './ProfileExportAction.vue';
import ProfileImportAction from './ProfileImportAction.vue';
import ProfilePresetAction from './ProfilePresetAction.vue';
import SetpointProfileBasic from './SetpointProfileBasic.vue';
import SetpointProfileDisableDialog from './SetpointProfileDisableDialog.vue';
import SetpointProfileFull from './SetpointProfileFull.vue';

const modes = {
  Basic: SetpointProfileBasic,
  Full: SetpointProfileFull,
} as const;

const { now } = useGlobals.setup();
const { context, inDialog } = useContext.setup();
const { block, patchBlock } = useBlockWidget.setup<SetpointProfileBlock>();

const graphData = shallowRef<Partial<PlotData>[]>([]);
provide(GraphDataKey, graphData);

const target = computed<Link>(() => block.value.data.targetId);

const layout = computed<Partial<Layout>>(() => ({
  shapes: [
    {
      type: 'line',
      yref: 'paper',
      x0: now.value.getTime(),
      x1: now.value.getTime(),
      y0: 0,
      y1: 1,
      line: {
        color: 'rgb(0, 200, 0)',
        dash: 'dot',
      },
    },
  ],
}));

function changeEnabled(enabled: boolean): void {
  if (enabled) {
    patchBlock({ enabled });
  } else {
    createComponentDialog({
      component: SetpointProfileDisableDialog,
      componentProps: {
        block: block.value,
      },
    });
  }
}

watchEffect(() => {
  const { start, points, targetId } = block.value.data;
  const startMs = parseDate(start)?.getTime() ?? 0;

  graphData.value = [
    {
      name: `${targetId.id || ''} setting`,
      type: 'scattergl',
      x: points.map((p) => startMs + durationMs(p.time)),
      y: points.map((p) => p.temperature.value),
    },
  ];
});
</script>

<template>
  <PreviewCard
    show-initial
    :enabled="inDialog && context.mode === 'Full'"
    :no-scroll="context.mode === 'Basic'"
  >
    <template #preview>
      <PlotlyGraph
        :layout="layout"
        class="fit"
      />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle>
        <template #actions>
          <ProfilePresetAction />
          <ProfileExportAction />
          <ProfileImportAction />
        </template>
      </BlockWidgetToolbar>
    </template>

    <component :is="modes[context.mode]">
      <template #warnings>
        <CardWarning v-if="!target.id">
          <template #message>
            Setpoint Profile has no target Setpoint configured.
          </template>
        </CardWarning>
        <BlockEnableToggle
          v-else
          :hide-enabled="context.mode === 'Basic'"
          emit-toggle
          @change="changeEnabled"
        >
          <template #enabled>
            Setpoint Profile is enabled and claims
            <i> {{ prettyLink(target) }} </i>.
          </template>
          <template #disabled>
            Setpoint Profile is disabled and does not claim
            <i> {{ prettyLink(target) }} </i>.
          </template>
        </BlockEnableToggle>
      </template>

      <template #graph>
        <PlotlyGraph
          :layout="layout"
          class="fit"
        />
      </template>
    </component>
  </PreviewCard>
</template>
