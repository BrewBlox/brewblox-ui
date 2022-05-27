<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';

import { QuickstartAction } from '../types';
import { createOutputActions, executeActions } from '../utils';
import {
  defineChangedBlocks,
  defineCreatedBlocks,
  defineDisplayedBlocks,
  defineWidgets,
} from './changes';
import { defineLayouts } from './changes-layout';
import { FridgeConfig } from './types';

export default defineComponent({
  name: 'FridgeCompletionTask',
  props: {
    config: {
      type: Object as PropType<FridgeConfig>,
      required: true,
    },
    actions: {
      type: Array as PropType<QuickstartAction[]>,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const busy = ref(true);

    async function execute(): Promise<void> {
      const createdBlocks = defineCreatedBlocks(props.config);
      const changedBlocks = defineChangedBlocks(props.config);
      const layouts = defineLayouts(props.config);
      const widgets = defineWidgets(props.config, layouts);
      const displayedBlocks = defineDisplayedBlocks(props.config);

      const finalizedConfig: FridgeConfig = {
        ...props.config,
        createdBlocks,
        changedBlocks,
        layouts,
        widgets,
        displayedBlocks,
      };

      await executeActions(createOutputActions(), finalizedConfig);
    }

    onMounted(() => execute().finally(() => (busy.value = false)));

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
      <q-item class="text-big"> About your new fridge dashboard </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            While the wizard is configuring the Spark and your new dashboard,
            here is a quick explanation of what we set up.
          </p>
          <p>
            On the controller we created two PIDs to drive the heater and the
            cooler.
            <br />They both use the <i>Fridge Setpoint</i> as input.
          </p>
          <p>
            We did not put every controller block on your new dashboard. You can
            find all blocks and their relations on the Spark service page.
          </p>
          <p>On your new dashboard, you will find:</p>
          <ul>
            <li>
              An assistant widget to enable or disable temperature control.
            </li>
            <li>
              A graphical representation of your fridge. Parts are clickable for
              quick access to settings.
            </li>
            <li>A graph with the most important metrics.</li>
            <li>
              A temperature profile that can slowly change a setpoint over time.
            </li>
          </ul>
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
        <q-tooltip v-if="busy"> Creating everything... </q-tooltip>
      </q-btn>
    </template>
  </WizardBody>
</template>
