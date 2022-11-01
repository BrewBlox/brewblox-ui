<script lang="ts">
import { coord2grid } from '@/plugins/builder/utils';
import { userUnits } from '@/user-settings';
import { makeObjectSorter } from '@/utils/functional';
import { durationMs, fixedNumber, prettyUnit } from '@/utils/quantity';
import { Setpoint, SetpointProfileBlock } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';
import { PROFILE_KEY, PROFILE_TYPES } from '../blueprints/ProfileDisplay';
import { usePart, useSettingsBlock } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'ProfileDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { sizeX, sizeY, bordered } = usePart.setup(props.part);

    const dimensions = computed(() => ({
      width: coord2grid(sizeX.value),
      height: coord2grid(sizeY.value),
    }));

    const { block, blockStatus, isBroken } =
      useSettingsBlock.setup<SetpointProfileBlock>(
        props.part,
        PROFILE_KEY,
        PROFILE_TYPES,
      );

    const points = computed<Setpoint[]>(() => {
      if (!block.value) {
        return [];
      }
      // Sorting modifies the list. Make a copy to prevent this.
      return [...block.value.data.points].sort(makeObjectSorter('time'));
    });

    const currentValue = computed<number | null>(() => {
      if (
        !block.value ||
        !block.value.data.enabled ||
        !block.value.data.start
      ) {
        return null;
      }
      const now = new Date().getTime();
      const start = new Date(block.value.data.start).getTime();
      const idx = points.value.findIndex(
        (point) => start + durationMs(point.time) > now,
      );
      if (idx < 1) {
        return null;
      }
      const prev = points.value[idx - 1];
      const next = points.value[idx];
      const prevVal = prev.temperature.value!;
      const nextVal = next.temperature.value!;
      const prevTime = durationMs(prev.time);
      const nextTime = durationMs(next.time);
      const durationBetween = nextTime - prevTime || 1;
      const elapsedBetween = now - prevTime - start;
      const progress = elapsedBetween / durationBetween; // 0-1
      const tempDelta = nextVal - prevVal;

      return prevVal + progress * tempDelta;
    });

    const nextValue = computed<number | null>(() => {
      if (!block.value || !block.value.data.start) {
        return null;
      }
      const now = new Date().getTime();
      const start = new Date(block.value.data.start).getTime();
      if (!block.value.data.enabled || !block.value.data.targetId.id) {
        return null;
      }
      const point: Setpoint | undefined = points.value.find(
        (point) => start + durationMs(point.time) > now,
      );
      return point ? point.temperature.value : null;
    });

    const tempUnit = computed<string>(() =>
      prettyUnit(userUnits.value.temperature),
    );

    return {
      fixedNumber,
      bordered,
      dimensions,
      block,
      blockStatus,
      isBroken,
      currentValue,
      nextValue,
      tempUnit,
    };
  },
});
</script>

<template>
  <svg
    :width="dimensions.width"
    :height="dimensions.height"
    viewBox="0 0 100 50"
  >
    <g class="content">
      <BrokenSvgIcon
        v-if="isBroken"
        x="30"
      />
      <UnlinkedSvgIcon
        v-else-if="!block"
        x="30"
      />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <SetpointSvgIcon
          x="6"
          y="16"
          width="20"
          height="20"
        />
        <foreignObject
          x="20"
          y="10"
          width="80"
          height="18"
        >
          <div class="fit builder-text">
            Now: {{ fixedNumber(currentValue, 0) }}
            <small v-if="currentValue != null">{{ tempUnit }}</small>
          </div>
        </foreignObject>
        <foreignObject
          x="20"
          y="25"
          width="80"
          height="18"
        >
          <div class="fit builder-text">
            Next: {{ fixedNumber(nextValue, 0) }}
            <small v-if="nextValue != null">{{ tempUnit }}</small>
          </div>
        </foreignObject>
      </template>
    </g>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="dimensions.width - 2"
        :height="dimensions.height - 2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </svg>
</template>
