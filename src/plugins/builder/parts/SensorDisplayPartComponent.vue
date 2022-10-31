<script lang="ts">
import { CENTER } from '@/plugins/builder/const';
import {
  coord2grid,
  liquidOnCoord,
  textTransformation,
} from '@/plugins/builder/utils';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import { computed, defineComponent, PropType } from 'vue';
import { SensorT, SENSOR_KEY, SENSOR_TYPES } from '../blueprints/SensorDisplay';
import { usePart, useSettingsBlock } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'SensorDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const width = 1;
    const height = 1;

    const { bordered, scale } = usePart.setup(props.part);

    const { block, blockStatus, isBroken } = useSettingsBlock.setup<SensorT>(
      props.part,
      SENSOR_KEY,
      SENSOR_TYPES,
    );

    const dimensions = computed(() => ({
      x: 0,
      y: 0,
      width: coord2grid(scale.value * width),
      height: coord2grid(scale.value * height),
    }));

    const contentTransform = computed<string>(() =>
      textTransformation(props.part, [width, height]),
    );

    const tempValue = computed<number | null>(
      () => block.value?.data.value?.value ?? null,
    );

    const tempUnit = computed<string>(() =>
      prettyUnit(block.value?.data.value),
    );

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      fixedNumber,
      block,
      blockStatus,
      isBroken,
      dimensions,
      contentTransform,
      tempValue,
      tempUnit,
      color,
      bordered,
    };
  },
});
</script>

<template>
  <svg
    :x="dimensions.x"
    :y="dimensions.y"
    :width="dimensions.width"
    :height="dimensions.height"
    viewBox="0 0 50 50"
  >
    <g
      :transform="contentTransform"
      class="content"
    >
      <BrokenSvgIcon v-if="isBroken" />
      <UnlinkedSvgIcon v-else-if="!block" />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <SensorSvgIcon
          x="12.5"
          y="5"
          width="25"
          height="25"
        />
        <foreignObject
          x="0"
          y="30"
          width="50"
          height="16"
        >
          <div class="fit builder-text">
            {{ fixedNumber(tempValue, 1) }}
            <small>{{ tempUnit }}</small>
          </div>
        </foreignObject>
      </template>
    </g>
  </svg>
</template>
