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
import { GravityUnit, Quantity } from '@/shared-types';
import { useSystemStore } from '@/store/system';
import { fixedNumber, prettyQty, prettyUnit } from '@/utils/formatting';
import { bloxQty, tempQty } from '@/utils/quantity';

import { usePart } from '../composables';
import { SIZE_X, SIZE_Y, TILT_ID_KEY } from '../specs/TiltDisplay';
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
    const systemStore = useSystemStore();

    const tiltId = computed<string | null>(
      () => props.part.settings[TILT_ID_KEY] ?? null,
    );

    const tiltState = computed<TiltStateValue | null>(
      () => tiltStore.values.find((v) => v.id === tiltId.value) ?? null,
    );

    const temperature = computed<Quantity>(
      () => tiltState.value?.data.temperature ?? tempQty(null),
    );

    const sg = computed<number | null>(
      () => tiltState.value?.data.specificGravity ?? null,
    );

    const plato = computed<Quantity>(
      () => tiltState.value?.data.plato ?? bloxQty(null, 'degP'),
    );

    const gravityUnit = computed<GravityUnit>(() => systemStore.units.gravity);

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
      gravityUnit,
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
        <div class="row q-gutter-x-xs text-bold">
          <q-icon :name="mdiThermometer" size="20px" class="static col-auto" />
          <q-space />
          {{ fixedNumber(temperature.value, 1) }}
          <small class="self-center">{{ prettyUnit(temperature) }}</small>
        </div>
        <div class="row q-gutter-x-xs text-bold">
          SG
          <q-space />
          <template v-if="gravityUnit === 'G'">
            {{ fixedNumber(sg, 3) }}
          </template>
          <template v-if="gravityUnit === 'degP'">
            {{ fixedNumber(plato.value, 1) }}
            <small class="self-center">{{ prettyUnit(plato) }}</small>
          </template>
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
