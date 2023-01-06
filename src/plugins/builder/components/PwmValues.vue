<script lang="ts">
import { coord2grid, textTransformation } from '@/plugins/builder/utils';
import { preciseNumber } from '@/utils/quantity';
import { computed, defineComponent } from 'vue';
import { usePart, useSettingsBlock } from '../composables';
import { PwmBlockT, PWM_KEY, PWM_TYPES } from '../const';

export default defineComponent({
  name: 'PwmValues',
  props: {
    width: {
      type: Number,
      default: 50,
    },
    height: {
      type: Number,
      default: 50,
    },
    settingsKey: {
      type: String,
      default: PWM_KEY,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const { part, placeholder } = usePart.setup();
    const {
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
    } = useSettingsBlock.setup<PwmBlockT>(props.settingsKey, PWM_TYPES);

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
      textTransformation(part.value, [1, 1]),
    );

    return {
      coord2grid,
      preciseNumber,
      contentTransform,
      block,
      blockStatus,
      isBroken,
      placeholder,
      pwmValue,
      showBlockDialog,
      showBlockSelectDialog,
    };
  },
});
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
