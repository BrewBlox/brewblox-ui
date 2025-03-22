<script setup lang="ts">
import {
  Link,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { Layout, PlotData } from 'plotly.js';
import { computed, provide, shallowRef, watchEffect } from 'vue';
import { GraphDataKey } from '@/components/graph/symbols';
import { useContext, useGlobals } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
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
const { serviceId, block, patchBlock } =
  useBlockWidget.setup<SetpointProfileBlock>();
const sparkStore = useSparkStore();

const graphData = shallowRef<Partial<PlotData>[]>([]);
provide(GraphDataKey, graphData);

const target = computed<Link>(() => block.value.data.targetId);
const targetBlock = computed<SetpointSensorPairBlock | null>(() =>
  sparkStore.blockByLink(serviceId, block.value.data.targetId),
);

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

const maxRamp = computed(() => {
  if (!targetBlock.value?.data?.rampLimitEnabled) return null;
  if (!targetBlock.value?.data?.rampLimit?.value) return null;
  if (!targetBlock.value?.data?.rampDuration?.value) return null;

  // Calculate degrees per second
  return (
    targetBlock.value.data.rampLimit.value /
    targetBlock.value.data.rampDuration.value
  );
});

watchEffect(() => {
  const { start, points, interpolateDisabled } = block.value.data;
  if (!points || points.length === 0) {
    graphData.value = [];
    return;
  }

  const startMs = parseDate(start)?.getTime() ?? 0;
  const xPoints: number[] = [];
  const yPoints: (number | null)[] = [];

  // Build the base line data (flat or interpolated)
  if (!interpolateDisabled) {
    points.forEach((p) => {
      xPoints.push(startMs + durationMs(p.time));
      yPoints.push(p.temperature.value);
    });
  } else {
    points.forEach((point, idx) => {
      const currX = startMs + durationMs(point.time);
      xPoints.push(currX);
      yPoints.push(point.temperature.value);

      if (idx < points.length - 1) {
        // Create flat section
        const nextX = startMs + durationMs(points[idx + 1].time);
        xPoints.push(nextX);
        yPoints.push(point.temperature.value);
      }
    });
  }

  // Prepare the base trace
  const baseTrace: Partial<PlotData> = {
    name: 'Setting applied by profile',
    type: 'scattergl',
    x: xPoints,
    y: yPoints,
  };
  const traces: Partial<PlotData>[] = [baseTrace];

  // Add the ramp trace if defined & needed
  if (maxRamp.value) {
    const rampRate = maxRamp.value; // degrees per second
    // Use non-null assertion on the first element (we have at least one point)
    const xPointsRamped: number[] = [xPoints[0]!];
    const yPointsRamped: number[] = [yPoints[0]!];

    for (let i = 1; i < xPoints.length; i++) {
      const prevX = xPointsRamped[xPointsRamped.length - 1]!;
      const prevY = yPointsRamped[yPointsRamped.length - 1]!;
      const currX = xPoints[i]!;
      const currY = yPoints[i]!;

      if ([prevX, prevY, currX, currY].some((v) => v == null)) {
        continue;
      }

      const deltaX_ms = currX - prevX;
      if (deltaX_ms <= 0) {
        // no forward progress
        continue;
      }

      const deltaT_seconds = deltaX_ms / 1000;
      const deltaY = currY - prevY;
      // Time needed to fully ramp from prevY to currY
      const timeToFullRamp_s = Math.abs(deltaY) / rampRate;

      if (timeToFullRamp_s <= deltaT_seconds) {
        const rampDoneX = prevX + timeToFullRamp_s * 1000;
        xPointsRamped.push(rampDoneX);
        yPointsRamped.push(currY);

        // If there's leftover time in the segment, stay flat.
        if (rampDoneX < currX) {
          xPointsRamped.push(currX);
          yPointsRamped.push(currY);
        }
      } else {
        // Partially ramp over the entire duration.
        const maxDeltaY = rampRate * deltaT_seconds;
        const partialY = prevY + Math.sign(deltaY) * maxDeltaY;
        xPointsRamped.push(currX);
        yPointsRamped.push(partialY);
      }
    }

    // Extend ramp to reach final temperature if needed.
    const finalDataY = yPoints[yPoints.length - 1]!;
    const lastRampY = yPointsRamped[yPointsRamped.length - 1]!;
    if (Math.abs(finalDataY - lastRampY) > 1e-9) {
      const lastRampX = xPointsRamped[xPointsRamped.length - 1]!;
      const remainingDeltaY = finalDataY - lastRampY;
      const extraTime_s = Math.abs(remainingDeltaY) / rampRate;
      const extendedX = lastRampX + extraTime_s * 1000;
      xPointsRamped.push(extendedX);
      yPointsRamped.push(finalDataY);
    }

    const rampTrace: Partial<PlotData> = {
      name: 'Setting after ramp limit',
      type: 'scattergl',
      x: xPointsRamped,
      y: yPointsRamped,
      line: {
        color: 'rgb(255, 0, 0)',
        dash: 'dot',
      },
    };
    traces.push(rampTrace);
  }

  // Set all graph traces at once
  graphData.value = traces;
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
