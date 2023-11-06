<script setup lang="ts">
import { usePart, useSettingsBlock } from '../composables';
import { PwmBlockT, PWM_KEY, PWM_TYPES } from '../const';
import { textTransformation } from '@/plugins/builder/utils';
import { preciseNumber } from '@/utils/quantity';
import { computed } from 'vue';

interface Props {
  width?: number;
  height?: number;
  settingsKey?: string;
  x?: number;
  y?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 50,
  height: 50,
  settingsKey: PWM_KEY,
  x: 0,
  y: 0,
});

const { part, placeholder } = usePart.setup();
const { block, blockStatus, isBroken, showBlockDialog, showBlockSelectDialog } =
  useSettingsBlock.setup<PwmBlockT>(props.settingsKey, PWM_TYPES);

const pwmValue = computed<number | null>(() => {
  if (placeholder) {
    return 64;
  }
  if (block.value?.data.enabled) {
    return block.value.data.value;
  }
  return null;
});

const contentTransform = computed<string>(() =>
  textTransformation(part.value, { width: 1, height: 1 }),
);
</script>

<template>
  <svg
    v-bind="{ x, y, width, height }"
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
        <AnalogSvgIcon
          x="12.5"
          y="5"
          width="25"
          height="25"
        />
        <foreignObject
          y="30"
          width="50"
          height="15"
        >
          <div class="fit builder-text">
            {{ preciseNumber(pwmValue) }}
            <small v-if="pwmValue != null">%</small>
          </div>
        </foreignObject>
      </template>
    </g>

    <slot />

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
          <slot name="menu-content" />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
