<script lang="ts">
import { mdiArrowRightBold } from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';

import { coord2grid } from '@/plugins/builder/utils';
import { Setpoint, SetpointProfileBlock } from '@/plugins/spark/types';
import { fixedNumber } from '@/utils/formatting';
import { makeObjectSorter } from '@/utils/functional';

import { usePart, useSettingsBlock } from '../composables';
import { PROFILE_KEY, PROFILE_TYPES } from '../specs/ProfileDisplay';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'ProfileDisplay',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      sizeX,
      sizeY,
      bordered,
    } = usePart.setup(props.part);

    const {
      block,
      isBroken,
      address,
    } = useSettingsBlock.setup<SetpointProfileBlock>(props.part, PROFILE_KEY, PROFILE_TYPES);

    const points = computed<Setpoint[]>(
      () => {
        if (!block.value) {
          return [];
        }
        // Sorting modifies the list. Make a copy to prevent this.
        return [...block.value.data.points]
          .sort(makeObjectSorter('time'));
      },
    );

    const currentValue = computed<number | null>(
      () => {
        if (!block.value || !block.value.data.enabled) {
          return null;
        }
        const now = new Date().getTime() / 1000;
        const start = block.value.data.start || 0;
        const idx = points.value.findIndex(point => start + point.time > now);
        if (idx < 1) {
          return null;
        }
        const prev = points.value[idx - 1];
        const next = points.value[idx];
        const prevVal = prev.temperature.value as number;
        const nextVal = next.temperature.value as number;
        const duration = (next.time - prev.time) || 1;
        return prevVal + (now - start + prev.time) * (nextVal - prevVal) / duration;
      },
    );

    const nextValue = computed<number | null>(
      () => {
        if (!block.value) {
          return null;
        }
        const now = new Date().getTime() / 1000;
        const start = block.value.data.start || 0;
        if (!block.value.data.enabled || !block.value.data.drivenTargetId.id) {
          return null;
        }
        const point: Setpoint | undefined = points.value
          .find(point => start + point.time > now);
        return point ? point.temperature.value : null;
      },
    );

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
      <BrokenIcon v-if="isBroken" class="col" />
      <UnlinkedIcon v-else-if="!block" class="col" />
      <div v-else class="col column q-ma-xs">
        <small class="col-auto">
          Setpoint Profile
        </small>
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
        :width="coord2grid(sizeX)-2"
        :height="coord2grid(sizeY)-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
