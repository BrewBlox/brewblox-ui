<script lang="ts">
import { CENTER } from '@/plugins/builder/const';
import { liquidOnCoord, textTransformation } from '@/plugins/builder/utils';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import { computed, defineComponent } from 'vue';
import { SensorT, SENSOR_KEY, SENSOR_TYPES } from '../blueprints/SensorDisplay';
import { usePart, useSettingsBlock } from '../composables';

export default defineComponent({
  name: 'SensorDisplayPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const { bordered } = usePart.setup(props.part);

    const { block, blockStatus, isBroken, showBlockDialog } =
      useSettingsBlock.setup<SensorT>(props.part, SENSOR_KEY, SENSOR_TYPES);

    const contentTransform = computed<string>(() =>
      textTransformation(props.part, [1, 1]),
    );

    const tempValue = computed<number | null>(
      () => block.value?.data.value?.value ?? null,
    );

    const tempUnit = computed<string>(() =>
      prettyUnit(block.value?.data.value),
    );

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      fixedNumber,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      contentTransform,
      tempValue,
      tempUnit,
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
    <g
      :transform="contentTransform"
      class="content"
    >
      <BrokenSvgIcon v-if="isBroken" />
      <UnlinkedSvgIcon v-else-if="!block" />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <SensorSvgIcon
          x="12.5"
          y="5"
          width="25"
          height="25"
        />
        <foreignObject
          x="0"
          y="30"
          width="50"
          height="16"
        >
          <div class="fit builder-text">
            {{ fixedNumber(tempValue, 1) }}
            <small>{{ tempUnit }}</small>
          </div>
        </foreignObject>
      </template>
    </g>
  </svg>
</template>
