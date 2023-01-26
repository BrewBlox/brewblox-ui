<script lang="ts">
import { liquidBorderColor } from '@/plugins/builder/utils';
import { useTiltStore } from '@/plugins/tilt/store';
import { TiltStateValue } from '@/plugins/tilt/types';
import { userUnits } from '@/user-settings';
import {
  fixedNumber,
  preciseNumber,
  prettyQty,
  prettyUnit,
} from '@/utils/quantity';
import { computed, defineComponent } from 'vue';
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
  TILT_ID_KEY,
} from '../blueprints/TiltDisplay';
import { usePart } from '../composables';

export default defineComponent({
  name: 'TiltDisplayPartComponent',
  setup() {
    const { flows, settings, width, height, bordered, passthrough } =
      usePart.setup();
    const tiltStore = useTiltStore();

    const color = computed<string>(() => liquidBorderColor(flows.value));

    const tiltId = computed<string | null>(
      () => settings.value[TILT_ID_KEY] ?? null,
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

    const unitlessGravity = computed<boolean>(
      () => userUnits.value.gravity === 'G',
    );

    function findTilts(): SelectOption[] {
      return useTiltStore().values.map((v) => ({ label: v.name, value: v.id }));
    }

    return {
      DEFAULT_SIZE,
      MAX_SIZE,
      MIN_SIZE,
      TILT_ID_KEY,
      prettyQty,
      preciseNumber,
      fixedNumber,
      width,
      height,
      temperature,
      gravity,
      tempUnit,
      gravityUnit,
      unitlessGravity,
      color,
      bordered,
      passthrough,
      findTilts,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 50"
  >
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
    <BuilderBorder
      v-if="bordered"
      :width="100"
      :color="color"
    />
    <BuilderInteraction :width="100">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <SelectMenuContent
            :settings-key="TILT_ID_KEY"
            title="Tilt device"
            label="Assign tilt"
            :opts="findTilts"
          />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <ToggleMenuContent
            v-model="bordered"
            label="Border"
          />
          <ToggleMenuContent
            v-model="passthrough"
            label="Flow through part"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
