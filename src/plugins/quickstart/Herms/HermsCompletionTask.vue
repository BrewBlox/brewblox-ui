<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';

import { QuickstartAction } from '../types';
import { executeActions } from '../utils';
import { HermsConfig } from './types';

export default defineComponent({
  name: 'HermsCompletionTask',
  props: {
    config: {
      type: Object as PropType<HermsConfig>,
      required: true,
    },
    actions: {
      type: Array as PropType<QuickstartAction[]>,
      required: true,
    },
  },
  emits: [
    'close',
  ],
  setup(props, { emit }) {
    const router = useRouter();
    const busy = ref(true);

    onMounted(() =>
      executeActions(props.actions, props.config)
        .finally(() => busy.value = false),
    );

    function done(): void {
      router.push(`/dashboard/${props.config.dashboardId}`);
      emit('close');
    }

    return {
      busy,
      done,
    };
  },
});
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item>
        <big>About your new HERMS dashboard</big>
      </q-item>
      <q-item>
        <q-item-section>
          <p>
            While the wizard is configuring the Spark and your new dashboard,
            here is a quick explanation of what we set up.
          </p>
          <p>
            We did not put every controller block on your new dashboard.
            You can find all blocks and their relations on the Spark controller service page.
          </p>
          <p>
            On your new dashboard, you will find:
            <ul>
              <li>A graphical representation of your setup. Parts are clickable for quick access to settings.</li>
              <li>A graph with the most important metrics.</li>
              <li>Actions that reconfigure your blocks for different behavior.</li>
            </ul>
          </p>
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn
        :loading="busy"
        unelevated
        label="Go to dashboard"
        color="primary"
        @click="done"
      >
        <q-tooltip v-if="busy">
          Creating everything...
        </q-tooltip>
      </q-btn>
    </template>
  </ActionCardBody>
</template>
