<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorLogicBlock, Link } from '@/plugins/spark/types';
import { prettyLink } from '@/utils/bloxfield';

import ActuatorLogicBasic from './ActuatorLogicBasic.vue';
import ActuatorLogicFull from './ActuatorLogicFull.vue';

export default defineComponent({
  name: 'ActuatorLogicWidget',
  components: {
    'Basic': ActuatorLogicBasic,
    'Full': ActuatorLogicFull,
  },
  setup() {
    const {
      context,
      inDialog,
    } = useContext.setup();
    const {
      widgetId,
      block,
      saveBlock,
    } = useBlockWidget.setup<ActuatorLogicBlock>();

    function enable(): void {
      block.value.data.enabled = true;
      saveBlock();
    }

    const target = computed<Link>(
      () => block.value.data.targetId,
    );
    return {
      prettyLink,
      context,
      inDialog,
      widgetId,
      block,
      enable,
      target,
    };
  },
});
</script>


<template>
  <PreviewCard :enabled="inDialog">
    <template #graph>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <component :is="context.mode">
      <template #warnings>
        <CardWarning v-if="!target.id">
          <template #message>
            Logic Actuator has no target actuator configured.
          </template>
        </CardWarning>
        <BlockEnableToggle
          v-else
          :hide-enabled="context.mode === 'Basic'"
        >
          <template #enabled>
            Logic Actuator is enabled and driving <i>{{ prettyLink(target) }}</i>.
          </template>
          <template #disabled>
            Logic Actuator is disabled and not driving <i>{{ prettyLink(target) }}</i>.
          </template>
        </BlockEnableToggle>
      </template>
    </component>
  </PreviewCard>
</template>
