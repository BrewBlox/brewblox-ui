<script lang="ts">
import { coord2grid } from '@/plugins/builder/utils';
import { makeObjectSorter } from '@/utils/functional';
import { durationMs, fixedNumber } from '@/utils/quantity';
import { mdiArrowRightBold } from '@quasar/extras/mdi-v5';
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

    const { block, isBroken, address } =
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

    return {
      coord2grid,
      fixedNumber,
      mdiArrowRightBold,
      bordered,
      sizeX,
      sizeY,
      block,
      address,
      isBroken,
      currentValue,
      nextValue,
    };
  },
});
</script>

<template>
  <g>
    <SvgEmbedded
      :width="coord2grid(2)"
      :height="coord2grid(1)"
      content-class="column items-center q-pt-xs"
    >
      <BrokenIcon
        v-if="isBroken"
        class="col"
      />
      <UnlinkedIcon
        v-else-if="!block"
        class="col"
      />
      <div
        v-else
        class="col column q-ma-xs"
      >
        <small class="col-auto"> Setpoint Profile </small>
        <div class="col row">
          <div class="col">
            {{ fixedNumber(currentValue, 0) }}
          </div>
          <div class="col">
            <q-icon
              :name="mdiArrowRightBold"
              size="20px"
              class="static"
            />
          </div>
          <div class="col">
            {{ fixedNumber(nextValue, 0) }}
          </div>
        </div>
      </div>
    </SvgEmbedded>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="coord2grid(sizeX) - 2"
        :height="coord2grid(sizeY) - 2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
