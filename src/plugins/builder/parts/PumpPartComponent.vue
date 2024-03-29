<script setup lang="ts">
import { DigitalState } from 'brewblox-proto/ts';
import { computed, watch } from 'vue';
import {
  DEFAULT_PUMP_PRESSURE,
  DIGITAL_TYPES,
  DigitalBlockT,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  LEFT,
  MAX_PUMP_PRESSURE,
  MIN_PUMP_PRESSURE,
  PUMP_KEY,
  PUMP_TYPES,
  PumpBlockT,
  PWM_TYPES,
  PwmBlockT,
} from '@/plugins/builder/const';
import { liquidOnCoord, showAbsentBlock } from '@/plugins/builder/utils';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { ON_INTERACT_KEY, OnInteractBehavior } from '../blueprints/Pump';
import { usePart, useSettingsBlock } from '../composables';

const { part, flows, settings, width, height, patchSettings, reflow } =
  usePart.setup();

const {
  block,
  blockStatus,
  hasAddress,
  isClaimed,
  showBlockDialog,
  showBlockSelectDialog,
  patchBlock,
} = useSettingsBlock.setup<PumpBlockT>(PUMP_KEY, PUMP_TYPES);

function isDigital(v: Maybe<PumpBlockT>): v is DigitalBlockT {
  return isBlockCompatible<DigitalBlockT>(v, DIGITAL_TYPES);
}

function isPwm(v: Maybe<PumpBlockT>): v is PwmBlockT {
  return isBlockCompatible<PwmBlockT>(v, PWM_TYPES);
}

const onInteract = computed<OnInteractBehavior>(
  () => settings.value[ON_INTERACT_KEY] ?? 'toggle',
);

const enabled = computed<boolean>(() => {
  if (!hasAddress.value) {
    return Boolean(settings.value[IO_ENABLED_KEY]);
  }

  if (isDigital(block.value)) {
    return block.value.data.state === DigitalState.STATE_ACTIVE;
  }

  if (isPwm(block.value)) {
    return block.value.data.enabled;
  }

  return false;
});

const active = computed<boolean>(() => {
  if (isPwm(block.value)) {
    return enabled.value && Boolean(block.value.data.setting);
  }
  return enabled.value;
});

const liquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, LEFT),
);

const pwmSetting = computed<number>(() =>
  isPwm(block.value) ? Number(block.value.data.setting) : 100,
);

const duration = computed<number>(() => {
  const onPressure = Number(
    settings.value[IO_PRESSURE_KEY] ?? DEFAULT_PUMP_PRESSURE,
  );
  const pressure = (onPressure / 100) * pwmSetting.value || 0.01;
  const animationDuration = 60 / pressure;
  return Math.max(animationDuration, 0.5); // Max out animation speed at 120 pressure
});

function checkDirty(newV: PumpBlockT | null, oldV: PumpBlockT | null): boolean {
  if (newV == null || oldV == null) {
    return true;
  }
  if (newV.type !== oldV.type) {
    return true;
  }
  if (isDigital(newV) && isDigital(oldV)) {
    return newV.data.state !== oldV.data.state;
  }
  if (isPwm(newV) && isPwm(oldV)) {
    return (
      newV.data.setting !== oldV.data.setting ||
      newV.data.enabled !== oldV.data.enabled
    );
  }
  return false;
}

watch(
  () => block.value,
  (newV, oldV) => {
    if (checkDirty(newV, oldV)) {
      reflow();
    }
  },
);

function toggleHandler(): void {
  // No block has been linked - change the part setting
  if (!hasAddress.value) {
    patchSettings({ [IO_ENABLED_KEY]: !settings.value[IO_ENABLED_KEY] });
    return;
  }

  // A block has been linked, but is not available
  // We can't change the block setting
  if (!block.value) {
    showAbsentBlock(part.value, PUMP_KEY);
    return;
  }

  // We can't toggle the block setting if it's claimed
  // Show the dialog as fallback behavior
  if (isClaimed.value) {
    showBlockDialog();
    return;
  }

  if (isDigital(block.value)) {
    const storedState =
      block.value.data.state === DigitalState.STATE_INACTIVE
        ? DigitalState.STATE_ACTIVE
        : DigitalState.STATE_INACTIVE;
    patchBlock({ storedState }, true);
    return;
  }

  if (isPwm(block.value)) {
    const enabled = !block.value.data.enabled;
    patchBlock({ enabled }, true);
    return;
  }
}

function interactHandler(): void {
  // No block has been linked - we always toggle
  if (!hasAddress.value) {
    toggleHandler();
    return;
  }

  // A block has been linked, but is not available
  // We can't toggle or show a dialog - we show an error message instead
  if (!block.value) {
    showAbsentBlock(part.value, PUMP_KEY);
    return;
  }

  // We can now either toggle or show a dialog
  // This comes down to the onInteract setting
  if (onInteract.value === 'dialog') {
    showBlockDialog();
  } else {
    toggleHandler();
  }
}
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <!-- tube liquid bottom-->
    <LiquidStroke
      :paths="['M50,25H0']"
      :colors="liquids"
    />
    <!-- ball liquid -->
    <LiquidStroke
      :paths="['M 17 29 A 8 8 0 1 1 17 31 Z']"
      :colors="liquids"
      stroke-width="15"
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
        <animateTransform
          v-if="active"
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 0 0"
          to="-360 0 0"
          :dur="`${duration}s`"
          repeatCount="indefinite"
        />
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
        d="M50,29H29v3.5c0,2.2-1.8,4-4,4
        s-4-1.8-4-4V25c0-2.2,1.8-4,4-4h25"
      />
    </g>
    <BlockStatusSvg :status="blockStatus" />
    <BuilderInteraction @interact="interactHandler">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <ToggleMenuContent
            :model-value="enabled"
            label="Toggle"
            @update:model-value="toggleHandler()"
          />
          <SelectMenuContent
            :settings-key="ON_INTERACT_KEY"
            title="Click behavior"
            label="On click"
            message="
            Select the default behavior when the pump is clicked.
            When the pump is linked to a PWM block, toggle enables or
            disables the block. The speed is not changed.
            "
            default="toggle"
            :opts="[
              { label: 'Toggle', value: 'toggle' },
              { label: 'Show block', value: 'dialog' },
            ]"
          />
          <BlockMenuContent
            :available="!!block"
            @show="showBlockDialog"
            @assign="showBlockSelectDialog"
          />
          <PressureMenuContent
            :settings-key="IO_PRESSURE_KEY"
            :min="MIN_PUMP_PRESSURE"
            :max="MAX_PUMP_PRESSURE"
            :default="DEFAULT_PUMP_PRESSURE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
