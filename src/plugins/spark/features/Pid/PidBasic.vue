<script setup lang="ts">
import { isBlockCompatible } from '../../utils/info';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { userUnits } from '@/user-settings';
import { createBlockDialog } from '@/utils/block-dialog';
import { fixedNumber, prettyQty, prettyUnit } from '@/utils/quantity';
import {
  Block,
  BlockType,
  PidBlock,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { computed } from 'vue';

const sparkStore = useSparkStore();
const { serviceId, block } = useBlockWidget.setup<PidBlock>();

const inputBlock = computed<SetpointSensorPairBlock | null>(() =>
  sparkStore.blockByLink(serviceId, block.value.data.inputId),
);

const outputBlock = computed<Block | null>(() =>
  sparkStore.blockByLink(serviceId, block.value.data.outputId),
);

const outputSuffix = computed<string>(() => {
  if (isBlockCompatible(outputBlock.value, BlockType.ActuatorOffset)) {
    return prettyUnit(userUnits.value.temperature);
  }
  return '%';
});

const kp = computed<number | null>(() => block.value.data.kp.value);

function fit(v: number): number {
  return Math.min(v, 100);
}

function showInput(): void {
  createBlockDialog(inputBlock.value, { mode: 'Basic' });
}

function showOutput(): void {
  createBlockDialog(outputBlock.value, { mode: 'Basic' });
}
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <SettingValueField
        editable
        class="col-grow"
        @click="showInput"
      >
        <template #header> Input </template>
        <template #valueIcon>
          <SensorSvgIcon
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #value>
          {{ prettyQty(block.data.inputValue) }}
        </template>
        <template #settingIcon>
          <SetpointSvgIcon
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #setting>
          {{ prettyQty(block.data.inputSetting) }}
        </template>
      </SettingValueField>
      <SettingValueField
        editable
        class="col-grow"
        @click="showOutput"
      >
        <template #header> Output </template>
        <template #valueIcon>
          <CoolingSvgIcon
            v-if="kp && kp < 0"
            x="0"
            y="0"
            width="30"
            height="30"
          />
          <HeatingSvgIcon
            v-else
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #value>
          {{ fixedNumber(block.data.outputValue) }}
          <small>{{ outputSuffix }}</small>
        </template>
        <template #settingIcon>
          <SetpointSvgIcon
            x="0"
            y="0"
            width="30"
            height="30"
          />
        </template>
        <template #setting>
          {{ fixedNumber(block.data.outputSetting) }}
          <small>{{ outputSuffix }}</small>
        </template>
      </SettingValueField>

      <div class="col-break" />

      <div class="col row no-wrap q-gutter-x-sm q-mr-md">
        <div class="col-auto self-center text-bold">P</div>
        <q-slider
          :model-value="fit(block.data.p)"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div class="col-auto self-center text-bold">I</div>
        <q-slider
          :model-value="fit(block.data.i)"
          :max="100"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div class="col-auto self-center text-bold">D</div>
        <q-slider
          :model-value="fit(block.data.d)"
          :max="100"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div
          v-if="!!block.data.boilMinOutput"
          :class="[
            'col-auto self-center text-bold',
            `text-${block.data.boilModeActive ? 'deep-orange' : 'grey'}`,
          ]"
        >
          boil
        </div>
      </div>
    </div>
  </div>
</template>
