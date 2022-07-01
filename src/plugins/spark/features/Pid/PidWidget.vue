<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { PidBlock } from '@/plugins/spark/types';
import { Link } from '@/shared-types';
import { prettyLink } from '@/utils/formatting';

import PidBasic from './PidBasic.vue';
import PidFull from './PidFull.vue';
import { startRelationsDialog } from './relations';

export default defineComponent({
  name: 'PidWidget',
  components: {
    Basic: PidBasic,
    Full: PidFull,
  },
  setup() {
    const { context, inDialog } = useContext.setup();
    const { block } = useBlockWidget.setup<PidBlock>();

    const inputLink = computed<Link>(() => block.value.data.inputId);

    const outputLink = computed<Link>(() => block.value.data.outputId);

    function showRelations(): void {
      startRelationsDialog(block.value);
    }

    return {
      prettyLink,
      context,
      inDialog,
      block,
      inputLink,
      outputLink,
      showRelations,
    };
  },
});
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle>
        <template #actions>
          <ActionItem
            icon="mdi-vector-line"
            label="Relations"
            @click="showRelations"
          />
        </template>
      </BlockWidgetToolbar>
    </template>

    <component :is="context.mode">
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
                PID is inactive and not driving
                <i> {{ prettyLink(outputLink) }} </i>.
              </span>
            </template>
          </CardWarning>
          <BlockEnableToggle :hide-enabled="context.mode === 'Basic'">
            <template #enabled>
              PID is enabled and driving <i> {{ prettyLink(outputLink) }} </i>.
            </template>
            <template #disabled>
              PID is disabled and not driving
              <i> {{ prettyLink(outputLink) }} </i>.
            </template>
          </BlockEnableToggle>
        </template>
      </template>
    </component>
  </PreviewCard>
</template>
