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
  setup(props) {
    const router = useRouter();
    const busy = ref(true);

    async function execute(): Promise<void> {
      const createdBlocks = defineCreatedBlocks(props.config);
      const changedBlocks = defineChangedBlocks(props.config);
      const layouts = defineLayouts(props.config);
      const widgets = defineWidgets(props.config, layouts);
      const displayedBlocks = defineDisplayedBlocks(props.config);

      const finalizedConfig: HermsConfig = {
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
  <QuickstartCard>
    <q-card-section>
      <q-item class="text-big"> About your new HERMS dashboard </q-item>
      <q-item>
        <q-item-section>
          <p>
            While the wizard is configuring the Spark and your new dashboard,
            here is a quick explanation of what we set up.
          </p>
          <p>
            We did not put every controller block on your new dashboard. You can
            find all blocks and their relations on the Spark controller service
            page.
          </p>
          <p>On your new dashboard, you will find:</p>
          <ul>
            <li>
              A graphical representation of your setup. Parts are clickable for
              quick access to settings.
            </li>
            <li>A graph with the most important metrics.</li>
            <li>
              Actions that reconfigure your blocks for different behavior.
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
  </QuickstartCard>
</template>
