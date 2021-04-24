<script lang="ts">
import {
  mdiBullseyeArrow,
  mdiGauge,
  mdiPlusMinus,
  mdiThermometer,
} from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';

import { squares } from '@/plugins/builder/utils';
import { sparkStore } from '@/plugins/spark/store';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  ReferenceKind,
  SetpointSensorPairBlock,
} from '@/plugins/spark/types';
import { prettyAny } from '@/plugins/spark/utils';
import { systemStore } from '@/store/system';
import { deltaTempQty, isQuantity, Quantity } from '@/utils/bloxfield';

import { usePart, useSettingsBlock } from '../composables';
import { DRIVER_KEY, DRIVER_TYPES, SCALE_KEY } from '../specs/SetpointDriverDisplay';
import { FlowPart } from '../types';

const icons = {
  mdiPlusMinus,
  mdiBullseyeArrow,
  mdiThermometer,
  mdiGauge,
};

export default defineComponent({
  name: 'SetpointDriverDisplay',
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
    } = useSettingsBlock.setup<ActuatorOffsetBlock>(props.part, DRIVER_KEY, DRIVER_TYPES);

    const scale = computed<number>(
      () => props.part.settings[SCALE_KEY] ?? 1,
    );

    // Reference actually is a BlockIntf.ProcessValueInterface
    // We don't have a TS type for that, but Setpoint/PWM are a good intersection
    const refBlock = computed<SetpointSensorPairBlock | ActuatorPwmBlock | null>(
      () => block.value !== null
        ? sparkStore.blockById(
          block.value.serviceId,
          block.value.data.referenceId.id)
        : null,
    );

    const refAmount = computed<Quantity | number | null>(
      () => {
        if (!block.value || !refBlock.value) {
          return null;
        }
        return block.value.data.referenceSettingOrValue === ReferenceKind.REF_SETTING
          ? refBlock.value.data.setting
          : refBlock.value.data.value;
      },
    );

    const refIcon = computed<keyof typeof icons | ''>(
      () => {
        if (!block.value || !refBlock.value) {
          return '';
        }
        if (block.value.data.referenceSettingOrValue === ReferenceKind.REF_SETTING) {
          return 'mdiBullseyeArrow';
        }
        return isQuantity(refAmount.value)
          ? 'mdiThermometer'
          : 'mdiGauge';
      },
    );

    const deltaTempUnit = computed<string>(
      () => `delta_${systemStore.units.temperature}`,
    );

    const actualSetting = computed<Quantity | number | null>(
      () => {
        const v = block.value?.data.setting ?? null;
        return isQuantity(refAmount.value)
          ? deltaTempQty(v)
          : v;
      },
    );

    return {
      squares,
      prettyAny,
      icons,
      bordered,
      isBroken,
      block,
      scale,
      refAmount,
      refIcon,
      deltaTempUnit,
      actualSetting,
    };
  },
});
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <SvgEmbedded
      :width="squares(2)"
      :height="squares(1)"
    >
      <BrokenIcon v-if="isBroken" class="col" />
      <UnlinkedIcon v-else-if="!block" class="col" />
      <div v-else class="col column q-ma-xs">
        <div class="col row q-gutter-x-xs">
          <q-icon
            :name="icons[refIcon]"
            size="20px"
            class="static col-auto"
          />
          <q-space />
          <div class="col-auto text-bold">
            {{ prettyAny(refAmount) }}
          </div>
        </div>
        <div class="col row q-gutter-x-xs">
          <q-icon
            :name="icons.mdiPlusMinus"
            size="20px"
            class="static col-auto"
          />
          <q-space />
          <div class="col-auto text-bold">
            {{ prettyAny(actualSetting) }}
          </div>
        </div>
      </div>
    </SvgEmbedded>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="squares(2)-2"
        :height="squares(1)-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
