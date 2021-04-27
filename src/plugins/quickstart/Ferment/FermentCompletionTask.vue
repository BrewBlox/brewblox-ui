<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';

import { QuickstartAction } from '../types';
import { executeActions } from '../utils';
import { FermentConfig } from './types';

export default defineComponent({
  name: 'FermentCompletionTask',
  props: {
    config: {
      type: Object as PropType<FermentConfig>,
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
        <big>About your new fermentation dashboard</big>
      </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            While the wizard is configuring the Spark and your new dashboard,
            here is a quick explanation of what we set up.
            <span>
              Visit our
              <a
                href="https://brewblox.netlify.app/user/ferment_guide.html"
                target="_blank"
                style="color: white"
              >documentation page</a> for a more in-depth guide.
            </span>
          </p>
          <p>
            On the controller we created two PIDs to drive the heater and the cooler.
            <br>The input to both will either be the
            <i>Fridge Setpoint</i> or the
            <i>Beer Setpoint</i>.
          </p>
          <p>
            We did not put every controller block on your new dashboard.
            You can find all blocks and their relations on the Spark service page.
          </p>
          <p>
            On your new dashboard, you will find:
            <ul>
              <li>An assistant widget to enable or disable temperature control.</li>
              <li>A graphical representation of your fridge. Parts are clickable for quick access to settings.</li>
              <li>A graph with the most important metrics.</li>
              <li>A temperature profile that can slowly change a setpoint over time.</li>
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
