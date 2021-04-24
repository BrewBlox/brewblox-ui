<script lang="ts">

import { computed, defineComponent, PropType } from 'vue';

import { FlowPart } from '@/plugins/builder/types';
import { squares, textTransformation } from '@/plugins/builder/utils';
import { ActuatorPwmBlock, BlockType } from '@/plugins/spark/types';
import { truncateRound } from '@/utils/functional';

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
    const {
      bordered,
    } = usePart.setup(props.part);

    const {
      block,
      isBroken,
    } = useSettingsBlock.setup<ActuatorPwmBlock>(props.part, props.settingsKey, [BlockType.ActuatorPwm]);

    const pwmValue = computed<number | null>(
      () => block.value?.data.enabled
        ? block.value.data.value
        : null,
    );

    const transform = computed<string>(
      () => textTransformation(props.part, [1, 1]),
    );

    return {
      squares,
      truncateRound,
      block,
      isBroken,
      pwmValue,
      transform,
      bordered,
    };
  },
});
</script>

<template>
  <g>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="squares(1)-2"
        :height="squares(1)-2"
        :x="squares(startX)+1"
        :y="squares(startY)+1"
        :stroke="color"
        stroke-width="2px"
        rx="6"
        ry="6"
      />
    </g>
    <SvgEmbedded
      :x="squares(startX)"
      :y="squares(startY)"
      :transform="transform"
      :width="squares(1)"
      :height="squares(1)"
      content-class="column items-center q-pt-xs"
    >
      <BrokenIcon v-if="isBroken" class="col" />
      <UnlinkedIcon v-else-if="!block" class="col" />
      <SleepingIcon v-else-if="!block.data.enabled" class="col" />
      <template v-else>
        <PwmIcon class="col" />
        <div class="col text-bold">
          {{ truncateRound(pwmValue) }}
          <small v-if="!!block">%</small>
        </div>
      </template>
    </SvgEmbedded>
  </g>
</template>
