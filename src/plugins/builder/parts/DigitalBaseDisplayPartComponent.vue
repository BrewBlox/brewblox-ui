<script setup lang="ts">
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
  LABEL_KEY,
} from '../const';
import { liquidBorderColor, textTransformation } from '../utils';
import { DigitalState } from 'brewblox-proto/ts';
import { computed } from 'vue';

const {
  part,
  flows,
  width,
  height,
  bordered,
  passthrough,
  placeholder,
  settings,
} = usePart.setup();

const color = computed<string>(() => liquidBorderColor(flows.value));

const { block, blockStatus, isBroken, showBlockDialog, showBlockSelectDialog } =
  useSettingsBlock.setup<DigitalBaseBlockT>(
    DIGITAL_BASE_KEY,
    DIGITAL_BASE_TYPES,
  );

const contentTransform = computed<string>(() =>
  textTransformation(part.value, { width: 1, height: 1 }),
);

const labelText = computed<string>(
  () => settings.value[LABEL_KEY] || block.value?.id || '---',
);

const backgroundColor = computed<string>(() => {
  if (placeholder) {
    return 'dodgerblue';
  }

  switch (block.value?.data.state) {
    case DigitalState.STATE_ACTIVE:
      return 'dodgerblue';
    case DigitalState.STATE_UNKNOWN:
      return 'warning';
    default:
      return '#333';
  }
});

const labelColor = computed<string>(() => {
  if (placeholder) {
    return 'white';
  }

  switch (block.value?.data.state) {
    case DigitalState.STATE_ACTIVE:
      return 'white';
    default:
      return '#AAA';
  }
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <g
      :transform="contentTransform"
      class="content"
    >
      <rect
        v-bind="{ width, height }"
        rx="6"
        :fill="backgroundColor"
      />
      <BrokenSvgIcon v-if="isBroken" />
      <UnlinkedSvgIcon v-else-if="!block && !placeholder" />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <foreignObject
          :y="height / 2 - 10"
          :width="width"
          :height="20"
        >
          <div
            class="fit builder-text text-bold"
            :style="{
              'line-height': '18px',
              color: labelColor,
            }"
          >
            {{ labelText }}
          </div>
        </foreignObject>
      </template>
    </g>
    <BuilderBorder
      v-if="bordered"
      v-bind="{ width, height }"
      :color="color"
    />
    <BuilderInteraction
      v-bind="{ width, height }"
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
          <TextMenuContent
            :settings-key="LABEL_KEY"
            label="Edit label"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
