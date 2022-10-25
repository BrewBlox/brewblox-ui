<script lang="ts">
import { FlowPart } from '@/plugins/builder/types';
import { coord2grid, textTransformation } from '@/plugins/builder/utils';
import { preciseNumber } from '@/utils/quantity';
import { ActuatorPwmBlock, BlockType, FastPwmBlock } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';
import { usePart, useSettingsBlock } from '../composables';

export default defineComponent({
  name: 'PwmValues',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      required: true,
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
    startX: {
      type: Number,
      default: 0,
    },
    startY: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const width = 1;
    const height = 1;

    const { bordered } = usePart.setup(props.part);
    const { block, blockStatus, isBroken } = useSettingsBlock.setup<
      ActuatorPwmBlock | FastPwmBlock
    >(props.part, props.settingsKey, [
      BlockType.ActuatorPwm,
      BlockType.FastPwm,
    ]);

    const pwmValue = computed<number | null>(() =>
      block.value?.data.enabled ? block.value.data.value : null,
    );

    const dimensions = computed(() => ({
      x: coord2grid(props.startX),
      y: coord2grid(props.startY),
      width: coord2grid(width),
      height: coord2grid(height),
    }));

    const contentTransform = computed<string>(() =>
      textTransformation(props.part, [width, height]),
    );

    return {
      coord2grid,
      preciseNumber,
      dimensions,
      contentTransform,
      block,
      blockStatus,
      isBroken,
      pwmValue,
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
    <g class="outline">
      <rect
        v-show="bordered"
        :width="48"
        :height="48"
        :stroke="color"
        stroke-width="2"
        fill="black"
        x="1"
        y="1"
        rx="6"
        ry="6"
      />
    </g>
    <g
      :transform="contentTransform"
      class="content"
    >
      <BrokenSvgIcon v-if="isBroken" />
      <UnlinkedSvgIcon v-else-if="!block" />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <PwmSvgIcon
          width="25"
          height="25"
          x="12.5"
          y="5"
        />
        <text
          x="50%"
          y="38"
          font-weight="bold"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ preciseNumber(pwmValue) }}
          <template v-if="pwmValue != null">%</template>
        </text>
      </template>
    </g>
  </svg>
</template>
