<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { dateString } from '@/utils/quantity';
import { computed, defineComponent, PropType } from 'vue';
import { LoggedSession } from '../types';
import SessionHeaderDialog from './SessionHeaderDialog.vue';

export default defineComponent({
  name: 'SessionHeaderField',
  props: {
    session: {
      type: Object as PropType<LoggedSession>,
      required: true,
    },
  },
  emits: ['update:session'],
  setup(props, { emit }) {
    const tags = computed<string[]>(() => props.session.tags ?? []);

    function showDialog(): void {
      createDialog({
        component: SessionHeaderDialog,
        componentProps: {
          modelValue: props.session,
          title: 'Edit session',
        },
      }).onOk((v) => emit('update:session', v));
    }

    return {
      dateString,
      tags,
      showDialog,
    };
  },
});
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
