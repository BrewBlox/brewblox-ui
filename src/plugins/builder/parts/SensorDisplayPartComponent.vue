<script lang="ts">
import {
  SensorBlockT,
  SENSOR_KEY,
  SENSOR_TYPES,
} from '@/plugins/builder/const';
import { liquidBorderColor, textTransformation } from '@/plugins/builder/utils';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import { computed, defineComponent } from 'vue';
import { usePart, useSettingsBlock } from '../composables';

export default defineComponent({
  name: 'SensorDisplayPartComponent',
  setup() {
    const { part, width, height, bordered } = usePart.setup();

    const color = computed<string>(() => liquidBorderColor(part.value));

    const {
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
    } = useSettingsBlock.setup<SensorBlockT>(SENSOR_KEY, SENSOR_TYPES);

    const contentTransform = computed<string>(() =>
      textTransformation(part.value, [1, 1]),
    );

    const tempValue = computed<number | null>(
      () => block.value?.data.value?.value ?? null,
    );

    const tempUnit = computed<string>(() =>
      prettyUnit(block.value?.data.value),
    );

    return {
      fixedNumber,
      width,
      height,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
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
  >
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
    <BuilderBorder
      v-if="bordered"
      :color="color"
    />
    <BuilderInteraction
      :width="100"
      @interact="showBlockDialog"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <BlockMenuContent
            :available="!!block"
            @show="showBlockDialog"
            @assign="showBlockSelectDialog"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
