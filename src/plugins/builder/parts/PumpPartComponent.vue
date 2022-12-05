<script lang="ts">
import { DEFAULT_PUMP_PRESSURE, LEFT } from '@/plugins/builder/const';
import {
  liquidOnCoord,
  scheduleSoftStartRefresh,
  showAbsentBlock,
} from '@/plugins/builder/utils';
import { PWM_SELECT_OPTIONS } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils/info';
import { createDialog } from '@/utils/dialog';
import {
  ActuatorPwmBlock,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
} from 'brewblox-proto/ts';
import { computed, defineComponent, onBeforeMount, watch } from 'vue';
import {
  PumpT,
  PUMP_KEY,
  PUMP_TYPES,
  PWM_PUMP_TYPES,
} from '../blueprints/Pump';
import { usePart, useSettingsBlock } from '../composables';

export default defineComponent({
  name: 'PumpPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props, { emit }) {
    const sparkStore = useSparkStore();
    const { patchSettings } = usePart.setup(props.part);

    const { block, blockStatus, hasAddress } = useSettingsBlock.setup<PumpT>(
      props.part,
      PUMP_KEY,
      PUMP_TYPES,
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
        patchSettings({
          [PUMP_KEY]: props.part.settings.pwm,
          pwm: undefined,
        });
      }
    });

    function interact(): void {
      if (!hasAddress.value) {
        patchSettings({ enabled: !props.part.settings.enabled });
      } else if (block.value == null) {
        showAbsentBlock(props.part, PUMP_KEY);
      } else if (block.value.type === BlockType.DigitalActuator) {
        const storedState =
          block.value.data.state === DigitalState.STATE_INACTIVE
            ? DigitalState.STATE_ACTIVE
            : DigitalState.STATE_INACTIVE;
        sparkStore.patchBlock(block.value, { storedState });
        scheduleSoftStartRefresh(block.value);
      } else if (isCompatible(block.value.type, PWM_PUMP_TYPES)) {
        const limiterWarning = block.value.data.constrainedBy?.constraints
          .length
          ? 'The value may be limited by constraints'
          : '';
        createDialog({
          component: 'SliderDialog',
          componentProps: {
            modelValue: block.value.data.storedSetting,
            title: 'Pump speed',
            message: limiterWarning,
            label: 'Percentage output',
            quickActions: PWM_SELECT_OPTIONS,
          },
        }).onOk((storedSetting: number) =>
          sparkStore.patchBlock(block.value, { storedSetting }),
        );
      }
    }

    return {
      block,
      hasAddress,
      blockStatus,
      enabled,
      liquids,
      duration,
      interact,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
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
      transform="translate(25,30)"
      class="outline"
    >
      <g>
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
    <BlockStatusSvg :status="blockStatus" />
  </svg>
</template>

<style lang="scss" scoped>
:deep(.ballLiquid path) {
  stroke-width: 15px !important;
}
</style>
