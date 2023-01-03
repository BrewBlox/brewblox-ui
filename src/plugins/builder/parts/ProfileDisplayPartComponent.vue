<script lang="ts">
import { userUnits } from '@/user-settings';
import { makeObjectSorter } from '@/utils/functional';
import { durationMs, preciseNumber, prettyUnit } from '@/utils/quantity';
import { Setpoint } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';
import { usePart, useSettingsBlock } from '../composables';
import { ProfileBlockT, PROFILE_KEY, PROFILE_TYPES } from '../const';
import { liquidBorderColor } from '../utils';

export default defineComponent({
  name: 'ProfileDisplayPartComponent',
  setup() {
    const { part, width, height, bordered } = usePart.setup();

    const color = computed<string>(() => liquidBorderColor(part.value));

    const {
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
    } = useSettingsBlock.setup<ProfileBlockT>(PROFILE_KEY, PROFILE_TYPES);

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
      preciseNumber,
      width,
      height,
      bordered,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
      currentValue,
      nextValue,
      tempUnit,
      color,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
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
          x="4"
          y="16"
          width="20"
          height="20"
        />
        <foreignObject
          x="20"
          y="8"
          width="80"
          height="18"
        >
          <div class="fit builder-text">
            <small>Now:</small> {{ preciseNumber(currentValue) }}
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
            <small>Next:</small> {{ preciseNumber(nextValue) }}
            <small v-if="nextValue != null">{{ tempUnit }}</small>
          </div>
        </foreignObject>
      </template>
    </g>
    <BuilderBorder
      v-if="bordered"
      :width="100"
      :color="color"
    />
    <BuilderInteraction
      :width="100"
      @interact="showBlockDialog"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <BlockMenuContent
            :available="!!block"
            @show="showBlockDialog"
            @assign="showBlockSelectDialog"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
