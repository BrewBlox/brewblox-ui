<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useGlobals } from '@/composables';

import { builderModes, builderTools } from '../const';
import { BuilderModeName, BuilderToolName } from '../types';


export default defineComponent({
  name: 'BuilderToolsMenu',
  props: {
    mode: {
      type: String as PropType<BuilderModeName>,
      required: true,
    },
    expanded: {
      type: Boolean,
      required: true,
    },
    disabledTools: {
      type: Array as PropType<BuilderToolName[]>,
      default: () => [],
    },
  },
  emits: [
    'update:mode',
    'update:expanded',
    'use',
  ],
  setup() {
    const { dense } = useGlobals.setup();

    return {
      builderModes,
      builderTools,
      dense,
    };
  },
});
</script>

<template>
  <div
    class="absolute-right page-height scroll bg-dark"
    @click="$emit('update:expanded', !expanded)"
  >
    <div class="column no-wrap" @click.stop>
      <div
        class="no-select q-py-sm q-pl-md text-italic text-grey-5"
        style="font-size: 120%"
        @click="$emit('update:expanded', !expanded)"
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
        :class="[!expanded && 'q-pr-none']"
        style="min-height: 0px"
        @click.stop="$emit('update:mode', opt.value)"
      />

      <div
        class="no-select q-py-sm q-pl-md text-italic text-grey-5"
        style="font-size: 120%"
        @click="$emit('update:expanded', !expanded)"
      >
        Tools
      </div>

      <ActionItem
        v-for="tool in builderTools"
        :key="'tool-' + tool.value"
        :disable="disabledTools.includes(tool.value)"
        :icon="tool.icon"
        :label="expanded ? tool.label : ''"
        :inset-level="0.2"
        :class="[!expanded && 'q-pr-none']"
        style="min-height: 0px"
        @click.stop="$emit('use', tool.value)"
      >
        <q-item-section v-if="expanded && !dense" side class="text-uppercase">
          {{ tool.shortcut }}
        </q-item-section>
      </ActionItem>
    </div>
  </div>
</template>
