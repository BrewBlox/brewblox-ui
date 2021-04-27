<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { QuickstartAction } from '../types';


export default defineComponent({
  name: 'QuickstartTaskMaster',
  props: {
    tasks: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: [
    'back',
    'close',
  ],
  setup(props, { emit }) {
    const config = ref<AnyDict>({});
    const actions = ref<QuickstartAction[]>([]);

    const taskQueue: string[] = [...props.tasks].reverse();
    const taskHistory: string[] = [];
    const currentTask = ref<string | null>(taskQueue.pop() ?? null);

    function previousTask(): void {
      if (taskHistory.length > 0) {
        if (currentTask.value !== null) {
          taskQueue.push(currentTask.value);
        }
        currentTask.value = taskHistory.pop() ?? null;
      } else {
        emit('back');
      }
    }

    function nextTask(): void {
      if (taskQueue.length === 0) {
        return;
      }
      if (currentTask.value) {
        taskHistory.push(currentTask.value);
      }
      currentTask.value = taskQueue.pop() ?? null;
    }

    return {
      config,
      actions,
      currentTask,
      previousTask,
      nextTask,
    };
  },
});
</script>

<template>
  <div class="full-height">
    <component
      :is="currentTask"
      v-if="currentTask"
      v-model:config="config"
      v-model:actions="actions"
      @back="previousTask"
      @next="nextTask"
      @close="$emit('close')"
    />
  </div>
</template>
