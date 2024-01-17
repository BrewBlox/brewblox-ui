<script setup lang="ts">
import { Link, PidBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { prettyLink } from '@/utils/quantity';
import PidBasic from './PidBasic.vue';
import PidFull from './PidFull.vue';

const modes = {
  Basic: PidBasic,
  Full: PidFull,
} as const;

const { context, inDialog } = useContext.setup();
const { block } = useBlockWidget.setup<PidBlock>();

const inputLink = computed<Link>(() => block.value.data.inputId);

const outputLink = computed<Link>(() => block.value.data.outputId);
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
        <CardWarning v-if="!inputLink.id">
          <template #message> PID has no input block configured. </template>
        </CardWarning>

        <CardWarning v-if="!outputLink.id">
          <template #message> PID has no output block configured. </template>
        </CardWarning>

        <template v-if="inputLink.id && outputLink.id">
          <CardWarning v-if="block.data.enabled && !block.data.active">
            <template #message>
              <span>
                PID is inactive.
                <i> {{ prettyLink(outputLink) }} </i> is claimed but inactive.
              </span>
            </template>
          </CardWarning>
          <BlockEnableToggle :hide-enabled="context.mode === 'Basic'">
            <template #enabled>
              PID is enabled and claims <i> {{ prettyLink(outputLink) }} </i>.
            </template>
            <template #disabled>
              PID is disabled and does not claim
              <i> {{ prettyLink(outputLink) }} </i>.
            </template>
          </BlockEnableToggle>
        </template>
      </template>
    </component>
  </PreviewCard>
</template>
