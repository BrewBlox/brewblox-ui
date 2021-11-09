<script lang="ts">
import { mdiThermometer } from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';

import { CENTER } from '@/plugins/builder/const';
import {
  coord2grid,
  liquidOnCoord,
  textTransformation,
} from '@/plugins/builder/utils';
import { useTiltStore } from '@/plugins/tilt/store';
import { TiltStateValue } from '@/plugins/tilt/types';
import { Quantity } from '@/shared-types';
import { fixedNumber, prettyQty, prettyUnit } from '@/utils/formatting';
import { bloxQty, tempQty } from '@/utils/quantity';

import { usePart } from '../composables';
import { SIZE_X, SIZE_Y, TILT_COLOR_KEY } from '../specs/TiltDisplay';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'TiltDisplay',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { bordered, scale } = usePart.setup(props.part);
    const tiltStore = useTiltStore();

    const tiltColor = computed<string | null>(
      () => props.part.settings[TILT_COLOR_KEY] ?? null,
    );

    const tiltState = computed<TiltStateValue | null>(
      () => tiltStore.values.find((v) => v.color === tiltColor.value) ?? null,
    );

    const temperature = computed<Quantity>(() => {
      if (tiltState.value == null) {
        return tempQty(null);
      }
      const { temperature, calibratedTemperature } = tiltState.value.data;
      return calibratedTemperature.value != null
        ? calibratedTemperature
        : temperature;
    });

    const sg = computed<number | null>(() => {
      if (tiltState.value == null) {
        return null;
      }
      const { specificGravity, calibratedSpecificGravity } =
        tiltState.value.data;
      return calibratedSpecificGravity ?? specificGravity;
    });

    const plato = computed<Quantity>(() => {
      if (tiltState.value == null) {
        return bloxQty(null, 'degP');
      }
      const { plato, calibratedPlato } = tiltState.value.data;
      return calibratedPlato.value != null ? calibratedPlato : plato;
    });

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      prettyUnit,
      prettyQty,
      SIZE_X,
      SIZE_Y,
      mdiThermometer,
      coord2grid,
      textTransformation,
      fixedNumber,
      temperature,
      sg,
      plato,
      color,
      bordered,
      scale,
    };
  },
});
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <SvgEmbedded :width="coord2grid(SIZE_X)" :height="coord2grid(SIZE_Y)">
      <div class="q-ma-xs">
        <div class="row q-gutter-x-xs">
          <q-icon :name="mdiThermometer" size="20px" class="static col-auto" />
          <q-space />
          <div class="col-auto text-bold">
            {{ fixedNumber(temperature.value, 1) }}
            <small>{{ prettyUnit(temperature) }}</small>
          </div>
        </div>
        <div class="row text-bold">
          SG
          <q-space />
          {{ fixedNumber(sg, 3) }}
        </div>
      </div>
    </SvgEmbedded>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="coord2grid(SIZE_X) - 2"
        :height="coord2grid(SIZE_Y) - 2"
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
