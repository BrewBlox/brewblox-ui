<script setup lang="ts">
import { TouchSwipeValue } from 'quasar';
import { useGlobals } from '@/composables';
import { builderTools } from '../const';
import { BuilderToolName } from '../types';

interface Props {
  expanded: boolean;
  activeTool: BuilderToolName | null;
  disabledTools?: BuilderToolName[];
}

const props = withDefaults(defineProps<Props>(), {
  disabledTools: () => [],
});

const emit = defineEmits<{
  'update:expanded': [payload: boolean];
  use: [payload: BuilderToolName];
}>();

const { dense } = useGlobals.setup();

const handleSwipe: TouchSwipeValue = (details) => {
  const desiredState = details.direction === 'left';
  if (props.expanded !== desiredState) {
    emit('update:expanded', desiredState);
  }
};
</script>

<template>
  <div
    v-touch-swipe.mouse.left.right="handleSwipe"
    class="absolute-right full-height scroll bg-dark"
    @click="$emit('update:expanded', !expanded)"
  >
    <div
      class="column no-wrap"
      @click.stop
    >
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
