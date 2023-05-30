<script setup lang="ts">
import { userUnits } from '@/user-settings';
import { makeObjectSorter } from '@/utils/functional';
import { durationMs, preciseNumber, prettyUnit } from '@/utils/quantity';
import { Setpoint } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/ProfileDisplay';
import { usePart, useSettingsBlock } from '../composables';
import { ProfileBlockT, PROFILE_KEY, PROFILE_TYPES } from '../const';
import { liquidBorderColor } from '../utils';

const { flows, width, height, bordered, passthrough, placeholder } =
  usePart.setup();

const color = computed<string>(() => liquidBorderColor(flows.value));

const { block, blockStatus, isBroken, showBlockDialog, showBlockSelectDialog } =
  useSettingsBlock.setup<ProfileBlockT>(PROFILE_KEY, PROFILE_TYPES);

const points = computed<Setpoint[]>(() => {
  if (!block.value) {
    return [];
  }
  // Sorting modifies the list. Make a copy to prevent this.
  return [...block.value.data.points].sort(makeObjectSorter('time'));
});

const currentValue = computed<number | null>(() => {
  if (placeholder) {
    return 19;
  }
  if (!block.value) {
    return null;
  }
  return block.value.data.setting.value;
});

const nextValue = computed<number | null>(() => {
  if (placeholder) {
    return 21;
  }
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
        v-else-if="!block && !placeholder"
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
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <ToggleMenuContent
            v-model="bordered"
            label="Border"
          />
          <ToggleMenuContent
            v-model="passthrough"
            label="Flow through part"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
