<script lang="ts">
import { CENTER } from '@/plugins/builder/const';
import {
  coord2grid,
  liquidOnCoord,
  textTransformation,
} from '@/plugins/builder/utils';
import { useTiltStore } from '@/plugins/tilt/store';
import { TiltStateValue } from '@/plugins/tilt/types';
import { userUnits } from '@/user-settings';
import {
  fixedNumber,
  preciseNumber,
  prettyQty,
  prettyUnit,
} from '@/utils/quantity';
import { computed, defineComponent, PropType } from 'vue';
import { SIZE_X, SIZE_Y, TILT_ID_KEY } from '../blueprints/TiltDisplay';
import { usePart } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'TiltDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { bordered, scale } = usePart.setup(props.part);
    const tiltStore = useTiltStore();

    const dimensions = computed(() => ({
      width: coord2grid(SIZE_X * scale.value),
      height: coord2grid(SIZE_Y * scale.value),
    }));

    const tiltId = computed<string | null>(
      () => props.part.settings[TILT_ID_KEY] ?? null,
    );

    const tiltState = computed<TiltStateValue | null>(
      () => tiltStore.values.find((v) => v.id === tiltId.value) ?? null,
    );

    const temperature = computed<number | null>(
      () => tiltState.value?.data.temperature.value ?? null,
    );

    const gravity = computed<number | null>(() => {
      const data = tiltState.value?.data;
      if (data == null) {
        return null;
      }
      return userUnits.value.gravity === 'G'
        ? data.specificGravity
        : data.plato.value;
    });

    const tempUnit = computed<string>(() =>
      prettyUnit(userUnits.value.temperature),
    );

    const gravityUnit = computed<string>(() =>
      prettyUnit(userUnits.value.gravity),
    );

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    const unitlessGravity = computed<boolean>(
      () => userUnits.value.gravity === 'G',
    );

    return {
      prettyQty,
      preciseNumber,
      dimensions,
      textTransformation,
      fixedNumber,
      temperature,
      gravity,
      tempUnit,
      gravityUnit,
      unitlessGravity,
      color,
      bordered,
      scale,
    };
  },
});
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <g class="content">
      <SensorSvgIcon
        x="15"
        y="3"
        width="20"
        height="20"
      />
      <foreignObject
        x="40"
        y="5"
        width="50"
        height="18"
      >
        <div class="fit builder-text">
          {{ preciseNumber(temperature) }}
          <small>{{ tempUnit }}</small>
        </div>
      </foreignObject>
      <TiltSvgIcon
        x="15"
        y="25"
        width="20"
        height="20"
      />
      <foreignObject
        x="40"
        y="27"
        width="50"
        height="18"
      >
        <div class="fit builder-text">
          <template v-if="unitlessGravity">
            {{ fixedNumber(gravity, 4) }}
          </template>
          <template v-else>
            {{ preciseNumber(gravity) }}
            <small>{{ gravityUnit }}</small>
          </template>
        </div>
      </foreignObject>
    </g>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="100 - 2"
        :height="50 - 2"
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
