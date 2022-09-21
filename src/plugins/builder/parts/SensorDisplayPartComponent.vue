<script lang="ts">
import { CENTER } from '@/plugins/builder/const';
import {
  coord2grid,
  liquidOnCoord,
  textTransformation,
} from '@/plugins/builder/utils';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import { mdiThermometer } from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';
import { SensorT, SENSOR_KEY, SENSOR_TYPES } from '../blueprints/SensorDisplay';
import { usePart, useSettingsBlock } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'SensorDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { bordered, scale } = usePart.setup(props.part);

    const { block, isBroken } = useSettingsBlock.setup<SensorT>(
      props.part,
      SENSOR_KEY,
      SENSOR_TYPES,
    );

    const temperature = computed<number | null>(
      () => block.value?.data.value?.value ?? null,
    );

    const tempUnit = computed<string>(() =>
      prettyUnit(block.value?.data.value),
    );

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      mdiThermometer,
      coord2grid,
      textTransformation,
      fixedNumber,
      scale,
      block,
      isBroken,
      temperature,
      tempUnit,
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
      <template v-else>
        <div class="col row q-pt-xs">
          <q-icon
            :name="mdiThermometer"
            class="static"
            size="20px"
          />
          <small>{{ tempUnit }}</small>
        </div>
        <div class="col text-bold text-center">
          {{ fixedNumber(temperature, 1) }}
        </div>
      </template>
    </SvgEmbedded>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="coord2grid(1) - 2"
        :height="coord2grid(1) - 2"
        :stroke="color"
        stroke-width="2px"
        x="1"
        y="1"
        rx="6"
        ry="6"
      />
    </g>
  </g>
</template>
