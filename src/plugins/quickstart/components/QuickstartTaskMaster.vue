<script setup lang="ts">
import { PropType, provide, ref } from 'vue';
import { QuickstartCardTitleKey } from '../symbols';
import { QuickstartAction } from '../types';

const props = defineProps({
  tasks: {
    type: Array as PropType<string[]>,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'close'): void;
}>();

const config = ref<AnyDict>({});
const actions = ref<QuickstartAction[]>([]);

const taskQueue: string[] = [...props.tasks].reverse();
const taskHistory: string[] = [];
const currentTask = ref<string | null>(taskQueue.pop() ?? null);
const dialogTitle = ref<string>(props.title);

provide(QuickstartCardTitleKey, dialogTitle);

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
</script>

<template>
  <component
    :is="currentTask"
    v-if="currentTask"
    v-model:config="config"
    v-model:actions="actions"
    @back="previousTask"
    @next="nextTask"
    @close="$emit('close')"
  />
</template>
