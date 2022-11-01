<script lang="ts">
import { FlowPart } from '@/plugins/builder/types';
import { coord2grid } from '@/plugins/builder/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { makeTypeFilter } from '@/utils/functional';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import { mdiThermometer } from '@quasar/extras/mdi-v5';
import {
  BlockType,
  PidBlock,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';
import { useSettingsBlock } from '../composables';

const pidFilter = makeTypeFilter<PidBlock>(BlockType.Pid);

export default defineComponent({
  name: 'SetpointValues',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      required: true,
    },
    startX: {
      type: Number,
      default: 0,
    },
    startY: {
      type: Number,
      default: 0,
    },
    hideUnset: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const width = 2;
    const height = 1;

    const sparkStore = useSparkStore();
    const { address, block, blockStatus, isBroken } =
      useSettingsBlock.setup<SetpointSensorPairBlock>(
        props.part,
        props.settingsKey,
        [BlockType.SetpointSensorPair],
      );
    const { serviceId } = address.value;

    const dimensions = computed(() => ({
      x: coord2grid(props.startX),
      y: coord2grid(props.startY),
      width: coord2grid(width),
      height: coord2grid(height),
    }));

    const isUsed = computed<boolean>(
      () =>
        block.value !== null &&
        block.value.data.enabled &&
        sparkStore
          .blocksByService(serviceId)
          .filter(pidFilter)
          .some((blk) => blk.data.inputId.id === address.value.id),
    );

    const setpointSetting = computed<number | null>(() =>
      block.value && isUsed.value
        ? block.value.data.desiredSetting.value
        : null,
    );

    const setpointValue = computed<number | null>(
      () => block.value?.data.value.value ?? null,
    );

    const setpointUnit = computed<string>(() =>
      prettyUnit(block.value?.data.desiredSetting),
    );

    return {
      mdiThermometer,
      coord2grid,
      fixedNumber,
      block,
      blockStatus,
      isBroken,
      dimensions,
      setpointSetting,
      setpointValue,
      setpointUnit,
    };
  },
});
</script>

<template>
  <svg
    v-if="block || !hideUnset"
    :x="dimensions.x"
    :y="dimensions.y"
    :width="dimensions.width"
    :height="dimensions.height"
    viewBox="0 0 100 50"
  >
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
          {{ fixedNumber(setpointValue, 1) }}
          <small>{{ setpointUnit }}</small>
        </div>
      </foreignObject>
      <SetpointSvgIcon
        x="20"
        y="23"
        width="20"
        height="20"
      />
      <foreignObject
        x="40"
        y="25"
        width="50"
        height="18"
      >
        <div class="fit builder-text">
          {{ fixedNumber(setpointSetting, 1) }}
          <small>{{ setpointUnit }}</small>
        </div>
      </foreignObject>
    </template>
  </svg>
</template>
