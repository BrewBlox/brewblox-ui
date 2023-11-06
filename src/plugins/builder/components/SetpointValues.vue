<script setup lang="ts">
import { usePart, useSettingsBlock } from '../composables';
import { SetpointBlockT, SETPOINT_KEY, SETPOINT_TYPES } from '../const';
import { useSparkStore } from '@/plugins/spark/store';
import { userUnits } from '@/user-settings';
import { makeTypeFilter } from '@/utils/functional';
import { preciseNumber, prettyUnit } from '@/utils/quantity';
import { BlockType, PidBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';

interface Props {
  width?: number;
  height?: number;
  settingsKey?: string;
  x?: number;
  y?: number;
  always?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: 100,
  height: 50,
  settingsKey: SETPOINT_KEY,
  x: 0,
  y: 0,
  always: false,
});

const pidFilter = makeTypeFilter<PidBlock>(BlockType.Pid);

const sparkStore = useSparkStore();
const { placeholder } = usePart.setup();
const {
  address,
  block,
  blockStatus,
  isBroken,
  showBlockDialog,
  showBlockSelectDialog,
} = useSettingsBlock.setup<SetpointBlockT>(props.settingsKey, SETPOINT_TYPES);

const isUsed = computed<boolean>(
  () =>
    block.value !== null &&
    block.value.data.enabled &&
    sparkStore
      .blocksByService(address.value.serviceId)
      .filter(pidFilter)
      .some((blk) => blk.data.inputId.id === address.value.id),
);

const setpointSetting = computed<number | null>(() => {
  if (placeholder) {
    return 26;
  }
  if (block.value && isUsed.value) {
    return block.value.data.desiredSetting.value;
  }
  return null;
});

const setpointValue = computed<number | null>(() => {
  if (placeholder) {
    return 21;
  }
  return block.value?.data.value.value ?? null;
});

const tempUnit = computed<string>(() =>
  prettyUnit(userUnits.value.temperature),
);
</script>

<template>
  <svg
    v-if="block || always"
    v-bind="{ x, y, width, height }"
    viewBox="0 0 100 50"
  >
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
      <SensorSvgIcon
        x="20"
        y="3"
        width="20"
        height="20"
      />
      <foreignObject
        x="40"
        y="5"
        width="50"
        height="18"
      >
        <div class="fit builder-text">
          {{ preciseNumber(setpointValue) }}
          <small>{{ tempUnit }}</small>
        </div>
      </foreignObject>
      <SetpointSvgIcon
        x="20"
        y="25"
        width="20"
        height="20"
      />
      <foreignObject
        x="40"
        y="27"
        width="50"
        height="18"
      >
        <div class="fit builder-text">
          {{ preciseNumber(setpointSetting) }}
          <small>{{ tempUnit }}</small>
        </div>
      </foreignObject>
    </template>

    <slot />

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
          <slot name="menu-content" />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
