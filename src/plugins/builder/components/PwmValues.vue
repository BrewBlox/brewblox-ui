<script lang="ts">
import { coord2grid, textTransformation } from '@/plugins/builder/utils';
import { preciseNumber } from '@/utils/quantity';
import { computed, defineComponent } from 'vue';
import { usePart, useSettingsBlock } from '../composables';
import { PwmBlockT, PWM_KEY, PWM_TYPES } from '../const';

export default defineComponent({
  name: 'PwmValues',
  props: {
    width: {
      type: Number,
      default: 50,
    },
    height: {
      type: Number,
      default: 50,
    },
    settingsKey: {
      type: String,
      default: PWM_KEY,
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { part, bordered } = usePart.setup();
    const { block, blockStatus, isBroken, showBlockDialog } =
      useSettingsBlock.setup<PwmBlockT>(props.settingsKey, PWM_TYPES);

    const pwmValue = computed<number | null>(() =>
      block.value?.data.enabled ? block.value.data.value : null,
    );

    const contentTransform = computed<string>(() =>
      textTransformation(part.value, [1, 1]),
    );

    return {
      coord2grid,
      preciseNumber,
      contentTransform,
      block,
      blockStatus,
      isBroken,
      pwmValue,
      bordered,
      showBlockDialog,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ x, y, width, height }"
    viewBox="0 0 50 50"
    class="interaction"
    @click="showBlockDialog"
  >
    <rect class="interaction-background" />
    <g
      :transform="contentTransform"
      class="content"
    >
      <BrokenSvgIcon v-if="isBroken" />
      <UnlinkedSvgIcon v-else-if="!block" />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <AnalogSvgIcon
          x="12.5"
          y="5"
          width="25"
          height="25"
        />
        <foreignObject
          y="30"
          width="50"
          height="15"
        >
          <div class="fit builder-text">
            {{ preciseNumber(pwmValue) }}
            <small v-if="pwmValue != null">%</small>
          </div>
        </foreignObject>
      </template>
    </g>
    <g class="outline">
      <rect
        v-show="bordered"
        :stroke="color"
        stroke-width="2"
        x="1"
        y="1"
        width="48"
        height="48"
        rx="6"
        ry="6"
      />
    </g>
  </svg>
</template>
