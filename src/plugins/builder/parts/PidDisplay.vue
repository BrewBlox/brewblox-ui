<script lang="ts">
import { mdiCalculatorVariant, mdiPlusMinus } from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';

import { CENTER, COLD_WATER, HOT_WATER } from '@/plugins/builder/const';
import { liquidOnCoord, squares, textTransformation } from '@/plugins/builder/utils';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockType, PidBlock } from '@/plugins/spark/types';
import { systemStore } from '@/store/system';
import { deltaTempQty, prettyUnit } from '@/utils/bloxfield';
import { truncateRound } from '@/utils/functional';

import { usePart, useSettingsBlock } from '../composables';
import { PID_KEY, PID_TYPES, SCALE_KEY } from '../specs/PidDisplay';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'PidDisplay',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      bordered,
    } = usePart.setup(props.part);

    const {
      block,
      isBroken,
    } = useSettingsBlock.setup<PidBlock>(props.part, PID_KEY, PID_TYPES);

    const scale = computed<number>(
      () => props.part.settings[SCALE_KEY] ?? 1,
    );

    const outputValue = computed<number | null>(
      () => block.value?.data.enabled
        ? block.value.data.outputValue
        : null,
    );

    const outputSetting = computed<number | null>(
      () => block.value?.data.enabled
        ? block.value.data.outputSetting
        : null,
    );

    const kp = computed<number | null>(
      () => block.value?.data.kp.value ?? null,
    );

    const target = computed<Block | null>(
      () => block.value !== null
        ? sparkStore.blockById(block.value.serviceId, block.value.data.inputId.id)
        : null,
    );

    const drivingOffset = computed<boolean>(
      () => target.value !== null
        && target.value.type === BlockType.ActuatorOffset,
    );

    const deltaTempUnit = computed<string>(
      () => `delta_${systemStore.units.temperature}`,
    );

    const convertedOutputSetting = computed<number | null>(
      () => drivingOffset.value
        && block.value !== null
        ? deltaTempQty(outputSetting.value).value
        : outputSetting.value,
    );

    const suffix = computed<string>(
      () => outputSetting.value === null
        ? ''
        : drivingOffset.value
          ? prettyUnit(deltaTempUnit.value)
          : '%',
    );

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      HOT_WATER,
      COLD_WATER,
      squares,
      textTransformation,
      truncateRound,
      mdiCalculatorVariant,
      mdiPlusMinus,
      scale,
      block,
      isBroken,
      outputValue,
      outputSetting,
      kp,
      target,
      drivingOffset,
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
      :transform="textTransformation(part, [1,1])"
      :width="squares(1)"
      :height="squares(1)"
      content-class="column items-center q-pt-xs"
    >
      <BrokenIcon v-if="isBroken" class="col" />
      <UnlinkedIcon v-else-if="!block" class="col" />
      <SleepingIcon v-else-if="!block.data.enabled" class="col" />
      <template v-else>
        <q-icon
          v-if="kp === null"
          :name="mdiCalculatorVariant"
          class="col-auto static"
          size="25px"
        />
        <q-icon
          v-else-if="drivingOffset"
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
          {{ truncateRound(convertedOutputSetting) }}
          <small v-if="!!block">{{ suffix }}</small>
        </div>
      </template>
    </SvgEmbedded>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="squares(1)-2"
        :height="squares(1)-2"
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
