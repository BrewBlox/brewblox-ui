<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';

import { QuickstartAction } from '../types';
import { executeActions } from '../utils';
import { RimsConfig } from './types';

export default defineComponent({
  name: 'RimsCompletionTask',
  props: {
    config: {
      type: Object as PropType<RimsConfig>,
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
  setup(props) {
    const router = useRouter();
    const busy = ref(true);

    onMounted(() =>
      executeActions(props.actions, props.config)
        .finally(() => busy.value = false),
    );

    function done(): void {
      // Will cause dialog to autoclose
      router.push(`/dashboard/${props.config.dashboardId}`);
    }

    return {
      busy,
      done,
    };
  },
});
</script>

<template>
  <WizardBody>
    <q-card-section>
      <q-item class="text-big">
        About your new RIMS dashboard
      </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            While the wizard is configuring the Spark and your new dashboard,
            here is a quick explanation of what we set up.
          </p>
          <p>
            On the controller we created two PIDs to dynamically control the tube heater element.
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
              <li>Actions that reconfigure your blocks for the various brewing steps.</li>
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
  </WizardBody>
</template>
