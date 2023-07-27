<script setup lang="ts">
import { DigitalState } from 'brewblox-proto/ts';
import { computed } from 'vue';
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
} from '../blueprints/DigitalBaseDisplay';
import { usePart, useSettingsBlock } from '../composables';
import {
  DigitalBaseBlockT,
  DIGITAL_BASE_KEY,
  DIGITAL_BASE_TYPES,
} from '../const';
import { liquidBorderColor, textTransformation } from '../utils';

const { part, flows, width, height, bordered, passthrough, placeholder } =
  usePart.setup();

const color = computed<string>(() => liquidBorderColor(flows.value));

const { block, blockStatus, isBroken, showBlockDialog, showBlockSelectDialog } =
  useSettingsBlock.setup<DigitalBaseBlockT>(
    DIGITAL_BASE_KEY,
    DIGITAL_BASE_TYPES,
  );

const contentTransform = computed<string>(() =>
  textTransformation(part.value, { width: 1, height: 1 }),
);

const stateText = computed<string>(() => {
  if (placeholder) {
    return 'ON/OFF';
  }

  switch (block.value?.data.state) {
    case DigitalState.STATE_ACTIVE:
      return 'ON';
    case DigitalState.STATE_INACTIVE:
      return 'OFF';
    default:
      return '???';
  }
});

const stateColor = computed<string>(() => {
  if (placeholder) {
    return 'white';
  }

  switch (block.value?.data.state) {
    case DigitalState.STATE_ACTIVE:
      return 'positive';
    case DigitalState.STATE_UNKNOWN:
      return 'warning';
    default:
      return 'grey';
  }
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
      <UnlinkedSvgIcon v-else-if="!block && !placeholder" />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <foreignObject
          y="15"
          width="50"
          height="15"
        >
          <div :class="`fit builder-text text-bold text-${stateColor}`">
            {{ stateText }}
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
