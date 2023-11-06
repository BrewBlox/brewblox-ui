<script setup lang="ts">
import { LoggedSession } from '../types';
import SessionHeaderDialog from './SessionHeaderDialog.vue';
import { createComponentDialog } from '@/utils/dialog';
import { dateString } from '@/utils/quantity';
import { computed } from 'vue';

interface Props {
  session: LoggedSession;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:session': [payload: LoggedSession];
}>();

const tags = computed<string[]>(() => props.session.tags ?? []);

function showDialog(): void {
  createComponentDialog({
    component: SessionHeaderDialog,
    componentProps: {
      modelValue: props.session,
      title: 'Edit session',
    },
  }).onOk((v) => emit('update:session', v));
}
</script>

<template>
  <div
    class="row text-grey-2 q-pa-sm items-baseline clickable rounded-borders"
    @click="showDialog"
  >
    <q-tooltip
      v-if="tags.length > 0"
      style="background: transparent"
      anchor="bottom right"
      self="top right"
    >
      <div
        class="row wrap q-gutter-xs"
        style="max-width: 350px"
      >
        <q-badge
          v-for="tag in tags"
          :key="`tag--${tag}`"
          color="blue-grey-7"
        >
          <small>{{ tag }}</small>
        </q-badge>
      </div>
    </q-tooltip>
    <div
      class="col-auto text-italic text-bold"
      style="font-size: 120%"
    >
      {{ session.title }}
    </div>
    <q-space />
    <div class="col-auto">
      {{ dateString(session.date) }}
    </div>
  </div>
</template>
