<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useGlobals } from '@/composables';

import { builderTools } from '../const';
import { BuilderToolName } from '../types';


export default defineComponent({
  name: 'BuilderToolsMenu',
  props: {
    expanded: {
      type: Boolean,
      required: true,
    },
    activeTool: {
      type: String as PropType<string | null>,
      required: true,
    },
    disabledTools: {
      type: Array as PropType<BuilderToolName[]>,
      default: () => [],
    },
  },
  emits: [
    'update:expanded',
    'use',
  ],
  setup(props, { emit }) {
    const { dense } = useGlobals.setup();

    function handleSwipe(args: SwipeArguments): void {
      const desiredState = (args.direction === 'left');
      if (props.expanded !== desiredState) {
        emit('update:expanded', desiredState);
      }
    }

    return {
      builderTools,
      dense,
      handleSwipe,
    };
  },
});
</script>

<template>
  <div
    v-touch-swipe.mouse.left.right="handleSwipe"
    class="absolute-right full-height scroll bg-dark"
    @click="$emit('update:expanded', !expanded)"
  >
    <div class="column no-wrap" @click.stop>
      <!-- <div
        class="no-select q-py-sm q-pl-md text-italic text-grey-5"
        style="font-size: 120%"
      >
        Modes
      </div>

      <ActionItem
        v-for="opt in builderModes"
        :key="'mode-' + opt.value"
        :active="mode === opt.value"
        :icon="opt.icon"
        :label="expanded ? opt.label : ''"
        :inset-level="0.2"
        :class="[expanded ? 'q-pr-md' : 'q-pr-none']"
        style="min-height: 0px"
        @click="$emit('update:mode', opt.value)"
      /> -->

      <div
        class="no-select q-py-sm q-pl-md text-italic text-grey-5"
        style="font-size: 120%"
      >
        Tools
      </div>

      <ActionItem
        v-for="tool in builderTools"
        :key="'tool-' + tool.value"
        :active="activeTool === tool.value"
        :disable="disabledTools.includes(tool.value)"
        :icon="tool.icon"
        :label="expanded ? tool.label : ''"
        :inset-level="0.2"
        :class="[expanded ? 'q-pr-md' : 'q-pr-none']"
        style="min-height: 0px"
        @click="$emit('use', tool.value)"
      >
        <q-item-section
          v-if="expanded && !dense"
          side
          class="text-uppercase"
        >
          {{ tool.shortcut }}
        </q-item-section>
      </ActionItem>
    </div>
  </div>
</template>
