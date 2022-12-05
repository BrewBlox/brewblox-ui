<script lang="ts">
import { CENTER, COLD_WATER, HOT_WATER } from '@/plugins/builder/const';
import { liquidOnCoord, textTransformation } from '@/plugins/builder/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { userUnits } from '@/user-settings';
import { preciseNumber, prettyUnit } from '@/utils/quantity';
import { mdiCalculatorVariant, mdiPlusMinus } from '@quasar/extras/mdi-v5';
import { Block, BlockType, PidBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';
import { PID_KEY, PID_TYPES } from '../blueprints/PidDisplay';
import { usePart, useSettingsBlock } from '../composables';

export default defineComponent({
  name: 'PidDisplayPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const sparkStore = useSparkStore();
    const { bordered } = usePart.setup(props.part);

    const { block, blockStatus, isBroken, showBlockDialog } =
      useSettingsBlock.setup<PidBlock>(props.part, PID_KEY, PID_TYPES);

    const contentTransform = computed<string>(() =>
      textTransformation(props.part, [1, 1]),
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
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      HOT_WATER,
      COLD_WATER,
      preciseNumber,
      mdiCalculatorVariant,
      mdiPlusMinus,
      contentTransform,
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
    class="interaction"
    @click="showBlockDialog"
  >
    <rect class="interaction-background" />
    <g class="outline">
      <rect
        v-show="bordered"
        width="46"
        height="46"
        stroke-width="2"
        x="1"
        y="1"
        rx="6"
        ry="6"
      />
    </g>
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
          :fill="outputValue ? HOT_WATER : 'white'"
          x="12.5"
          y="5"
          width="25"
          height="25"
        />
        <CoolingSvgIcon
          v-else
          :stroke="outputValue ? COLD_WATER : 'white'"
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
  </svg>
</template>
