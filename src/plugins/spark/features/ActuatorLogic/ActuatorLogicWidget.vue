<script setup lang="ts">
import ActuatorLogicBasic from './ActuatorLogicBasic.vue';
import ActuatorLogicFull from './ActuatorLogicFull.vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { prettyLink } from '@/utils/quantity';
import { ActuatorLogicBlock, Link } from 'brewblox-proto/ts';
import { computed } from 'vue';

const modes = {
  Basic: ActuatorLogicBasic,
  Full: ActuatorLogicFull,
} as const;

const { context, inDialog } = useContext.setup();
const { block } = useBlockWidget.setup<ActuatorLogicBlock>();

const target = computed<Link>(() => block.value.data.targetId);
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <component :is="modes[context.mode]">
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
            Logic Actuator is enabled and claims
            <i> {{ prettyLink(target) }} </i>.
          </template>
          <template #disabled>
            Logic Actuator is disabled and does not claim
            <i> {{ prettyLink(target) }} </i>.
          </template>
        </BlockEnableToggle>
      </template>
    </component>
  </PreviewCard>
</template>
