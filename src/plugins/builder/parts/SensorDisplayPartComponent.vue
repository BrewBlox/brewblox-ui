<script setup lang="ts">
import { computed } from 'vue';
import {
  SENSOR_KEY,
  SENSOR_TYPES,
  SensorBlockT,
} from '@/plugins/builder/const';
import { liquidBorderColor, textTransformation } from '@/plugins/builder/utils';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/SensorDisplay';
import { usePart, useSettingsBlock } from '../composables';

const { part, flows, width, height, bordered, passthrough, placeholder } =
  usePart.setup();

const color = computed<string>(() => liquidBorderColor(flows.value));

const { block, blockStatus, isBroken, showBlockDialog, showBlockSelectDialog } =
  useSettingsBlock.setup<SensorBlockT>(SENSOR_KEY, SENSOR_TYPES);

const contentTransform = computed<string>(() =>
  textTransformation(part.value, { width: 1, height: 1 }),
);

const tempValue = computed<number | null>(() => {
  if (placeholder) {
    return 21;
  }
  return block.value?.data.value?.value ?? null;
});

const tempUnit = computed<string>(() => prettyUnit(block.value?.data.value));
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
      <UnlinkedSvgIcon v-else-if="!block && !placeholder" />
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
    <BuilderInteraction @interact="showBlockDialog">
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
