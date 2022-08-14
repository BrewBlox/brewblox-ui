<script lang="ts">
import { CENTER, COLD_WATER, HOT_WATER } from '@/plugins/builder/const';
import {
  coord2grid,
  liquidOnCoord,
  textTransformation,
} from '@/plugins/builder/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { userUnits } from '@/user-settings';
import { deltaTempQty, preciseNumber, prettyUnit } from '@/utils/quantity';
import { mdiCalculatorVariant, mdiPlusMinus } from '@quasar/extras/mdi-v5';
import { Block, BlockType, PidBlock } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';
import { PID_KEY, PID_TYPES } from '../blueprints/PidDisplay';
import { usePart, useSettingsBlock } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'PidDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const sparkStore = useSparkStore();
    const { scale, bordered } = usePart.setup(props.part);

    const { block, isBroken } = useSettingsBlock.setup<PidBlock>(
      props.part,
      PID_KEY,
      PID_TYPES,
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
      block.value !== null
        ? sparkStore.blockById(
            block.value.serviceId,
            block.value.data.inputId.id,
          )
        : null,
    );

    const targetingOffset = computed<boolean>(() =>
      isBlockCompatible(target.value, BlockType.ActuatorOffset),
    );

    const deltaTempUnit = computed<string>(
      () => `delta_${userUnits.value.temperature}`,
    );

    const convertedOutputSetting = computed<number | null>(() =>
      targetingOffset.value && block.value !== null
        ? deltaTempQty(outputSetting.value).value
        : outputSetting.value,
    );

    const suffix = computed<string>(() =>
      outputSetting.value === null
        ? ''
        : targetingOffset.value
        ? prettyUnit(deltaTempUnit.value)
        : '%',
    );

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      HOT_WATER,
      COLD_WATER,
      coord2grid,
      textTransformation,
      preciseNumber,
      mdiCalculatorVariant,
      mdiPlusMinus,
      scale,
      block,
      isBroken,
      outputValue,
      outputSetting,
      kp,
      target,
      targetingOffset,
      convertedOutputSetting,
      suffix,
      color,
      bordered,
    };
  },
});
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <SvgEmbedded
      :transform="textTransformation(part, [1, 1])"
      :width="coord2grid(1)"
      :height="coord2grid(1)"
      content-class="column items-center q-pt-xs"
    >
      <BrokenIcon
        v-if="isBroken"
        class="col"
      />
      <UnlinkedIcon
        v-else-if="!block"
        class="col"
      />
      <SleepingIcon
        v-else-if="!block.data.enabled"
        class="col"
      />
      <template v-else>
        <q-icon
          v-if="kp === null"
          :name="mdiCalculatorVariant"
          class="col-auto static"
          size="25px"
        />
        <q-icon
          v-else-if="targetingOffset"
          :name="mdiPlusMinus"
          class="col-auto static"
          size="25px"
        />
        <template v-else>
          <HeatingIcon
            v-if="kp > 0"
            :color="outputValue ? HOT_WATER : 'white'"
          />
          <CoolingIcon
            v-if="kp < 0"
            :color="outputValue ? COLD_WATER : 'white'"
          />
        </template>
        <div class="col text-bold">
          {{ preciseNumber(convertedOutputSetting) }}
          <small v-if="!!block">{{ suffix }}</small>
        </div>
      </template>
    </SvgEmbedded>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="coord2grid(1) - 2"
        :height="coord2grid(1) - 2"
        :stroke="color"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
