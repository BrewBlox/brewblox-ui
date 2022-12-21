<script lang="ts">
import {
  CENTER,
  COLD_WATER,
  HOT_WATER,
  PidBlockT,
  PID_KEY,
  PID_TYPES,
} from '@/plugins/builder/const';
import { liquidOnCoord, textTransformation } from '@/plugins/builder/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { userUnits } from '@/user-settings';
import { preciseNumber, prettyUnit } from '@/utils/quantity';
import { mdiCalculatorVariant, mdiPlusMinus } from '@quasar/extras/mdi-v5';
import { Block, BlockType } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';
import { usePart, useSettingsBlock } from '../composables';

export default defineComponent({
  name: 'PidDisplayPartComponent',
  setup() {
    const sparkStore = useSparkStore();
    const { part, width, height, bordered } = usePart.setup();

    const { block, blockStatus, isBroken, showBlockDialog } =
      useSettingsBlock.setup<PidBlockT>(PID_KEY, PID_TYPES);

    const contentTransform = computed<string>(() =>
      textTransformation(part.value, [1, 1]),
    );

    const outputValue = computed<number | null>(() =>
      block.value?.data.enabled ? block.value.data.outputValue : null,
    );

    const outputSetting = computed<number | null>(() =>
      block.value?.data.enabled ? block.value.data.outputSetting : null,
    );

    const kp = computed<number | null>(
      () => block.value?.data.kp.value ?? null,
    );

    const target = computed<Block | null>(() =>
      sparkStore.blockById(
        block.value?.serviceId,
        block.value?.data.outputId.id,
      ),
    );

    const targetingOffset = computed<boolean>(() =>
      isBlockCompatible(target.value, BlockType.ActuatorOffset),
    );

    const suffix = computed<string>(() => {
      const setting = outputSetting.value;
      if (setting == null) {
        return '';
      }
      if (targetingOffset.value) {
        return prettyUnit(userUnits.value.temperature);
      }
      return '%';
    });

    const color = computed<string>(
      () => liquidOnCoord(part.value, CENTER)[0] ?? '',
    );

    return {
      HOT_WATER,
      COLD_WATER,
      preciseNumber,
      mdiCalculatorVariant,
      mdiPlusMinus,
      contentTransform,
      width,
      height,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      outputValue,
      outputSetting,
      kp,
      target,
      suffix,
      color,
      bordered,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
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
        <HeatingSvgIcon
          v-if="kp && kp > 0"
          :color="outputValue ? HOT_WATER : 'white'"
          x="12.5"
          y="5"
          width="25"
          height="25"
        />
        <CoolingSvgIcon
          v-else
          :color="outputValue ? COLD_WATER : 'white'"
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
            {{ preciseNumber(outputSetting) }}
            <small v-if="outputSetting != null">{{ suffix }}</small>
          </div>
        </foreignObject>
      </template>
    </g>
    <BuilderBorder
      v-if="bordered"
      :color="color"
    />
    <BuilderInteraction @interact="showBlockDialog" />
  </svg>
</template>
