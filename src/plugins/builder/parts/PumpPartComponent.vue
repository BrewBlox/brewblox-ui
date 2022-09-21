<script lang="ts">
import { DEFAULT_PUMP_PRESSURE, LEFT } from '@/plugins/builder/const';
import { liquidOnCoord, settingsBlock } from '@/plugins/builder/utils';
import { isCompatible } from '@/plugins/spark/utils/info';
import {
  ActuatorPwmBlock,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
} from 'brewblox-proto/ts';
import { computed, defineComponent, onBeforeMount, PropType, watch } from 'vue';
import {
  PumpT,
  PUMP_KEY,
  PUMP_TYPES,
  PWM_PUMP_TYPES,
} from '../blueprints/Pump';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'PumpPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  emits: ['update:part', 'dirty'],
  setup(props, { emit }) {
    const hasAddress = computed<boolean>(
      () => props.part.settings[PUMP_KEY]?.id != null,
    );

    const block = computed<PumpT | null>(() =>
      settingsBlock(props.part, PUMP_KEY, PUMP_TYPES),
    );

    const enabled = computed<boolean>(() => {
      if (block.value === null) {
        return hasAddress.value ? false : Boolean(props.part.settings.enabled);
      } else if (block.value.type === BlockType.DigitalActuator) {
        return block.value.data.state === DigitalState.STATE_ACTIVE;
      } else if (isCompatible(block.value.type, PWM_PUMP_TYPES)) {
        return block.value.data.enabled && Boolean(block.value.data.setting);
      } else {
        return false;
      }
    });

    const liquids = computed<string[]>(() => liquidOnCoord(props.part, LEFT));

    const pwmSetting = computed<number>(() =>
      block.value?.type === BlockType.ActuatorPwm ||
      block.value?.type === BlockType.FastPwm
        ? Number(block.value.data.setting)
        : 100,
    );

    const duration = computed<number>(() => {
      const pressure =
        ((props.part.settings.onPressure ?? DEFAULT_PUMP_PRESSURE) / 100) *
          pwmSetting.value || 0.01;
      const animationDuration = 60 / pressure;
      return Math.max(animationDuration, 0.5); // Max out animation speed at 120 pressure
    });

    watch(
      () => block.value,
      (newV, oldV) => {
        if (
          newV === null ||
          oldV === null ||
          (newV as DigitalActuatorBlock).data.state !==
            (oldV as DigitalActuatorBlock).data.state ||
          (newV as ActuatorPwmBlock).data.setting !==
            (oldV as ActuatorPwmBlock).data.setting ||
          (newV as ActuatorPwmBlock).data.enabled !==
            (oldV as ActuatorPwmBlock).data.enabled
        ) {
          emit('dirty');
        }
      },
    );

    onBeforeMount(() => {
      if (props.part.settings.pwm !== undefined) {
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            [PUMP_KEY]: props.part.settings.pwm,
            pwm: undefined,
          },
        });
      }
    });

    return {
      hasAddress,
      enabled,
      liquids,
      duration,
    };
  },
});
</script>

<template>
  <g>
    <!-- tube liquid bottom-->
    <LiquidStroke
      :paths="['M50,25H0']"
      :colors="liquids"
    />
    <!-- ball liquid -->
    <LiquidStroke
      :paths="['M 17 29 A 8 8 0 1 1 17 31 Z']"
      :colors="liquids"
      class="ballLiquid"
    />
    <!-- ball outline-->
    <circle
      cx="25"
      cy="30"
      r="16"
      class="outline"
    />
    <!-- blades -->
    <g
      class="blades-wrapper"
      transform="translate(25,30)"
    >
      <g class="outline">
        <line
          x1="-14"
          y1="0"
          x2="14"
          y2="0"
        />
        <line
          x1="7"
          y1="-12.1"
          x2="-7"
          y2="12.1"
        />
        <line
          x1="7"
          y1="12.1"
          x2="-7"
          y2="-12.1"
        />
        <!-- eslint-disable vue/attribute-hyphenation -->
        <animateTransform
          v-if="enabled"
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 0 0"
          to="-360 0 0"
          :dur="`${duration}s`"
          repeatCount="indefinite"
        />
        <!-- eslint-enable -->
      </g>
    </g>
    <!-- tube liquid top-->
    <LiquidStroke
      :paths="['M50,25H25V36']"
      :colors="liquids"
    />
    <!-- tubes -->
    <g class="outline">
      <polyline points="20.5,10 16.5,6 20.5,2 " />
      <line
        x1="32.5"
        y1="6"
        x2="16.5"
        y2="6"
      />
      <line
        x1="0"
        y1="21"
        x2="11"
        y2="21"
      />
      <line
        x1="0"
        y1="29"
        x2="9"
        y2="29"
      />
      <path
        d="M50,29H29v3.5c0,2.2-1.8,4-4,4s-4-1.8-4-4V25c0-2.2,1.8-4,4-4h25"
      />
    </g>
    <rect
      fill="green"
      fill-opacity="0"
      x="0"
      y="0"
      width="50"
      height="50"
    />
    <PowerIcon
      v-if="hasAddress"
      transform="translate(15,-5)"
    />
  </g>
</template>

<style
  lang="scss"
  scoped
>
:deep(.ballLiquid path) {
  stroke-width: 15px !important;
}
</style>
