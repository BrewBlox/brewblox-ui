<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { Link, SetpointProfileBlock } from '@/plugins/spark/types';
import { prettyLink } from '@/utils/bloxfield';
import { deepCopy, isJsonEqual } from '@/utils/functional';

import { GraphProps, profileGraphProps } from './helpers';
import ProfileExportAction from './ProfileExportAction.vue';
import ProfileImportAction from './ProfileImportAction.vue';
import ProfilePresetAction from './ProfilePresetAction.vue';
import SetpointProfileBasic from './SetpointProfileBasic.vue';
import SetpointProfileFull from './SetpointProfileFull.vue';

type SetpointProfileData = SetpointProfileBlock['data'];

export default defineComponent({
  name: 'SetpointProfileWidget',
  components: {
    Basic: SetpointProfileBasic,
    Full: SetpointProfileFull,
    ProfileImportAction,
    ProfilePresetAction,
    ProfileExportAction,
  },
  setup() {
    const { context, inDialog } = useContext.setup();
    const { block } = useBlockWidget.setup<SetpointProfileBlock>();

    const usedData = ref<SetpointProfileData>(deepCopy(block.value.data));
    const revision = ref<number>(0);

    const target = computed<Link>(
      () => block.value.data.targetId,
    );

    const graphProps = computed<GraphProps>(
      () => profileGraphProps(block.value),
    );

    function refresh(): void {
      usedData.value = deepCopy(block.value.data);
      revision.value++;
    }

    watch(
      () => block.value.data,
      (newV) => {
        if (!isJsonEqual(newV, usedData.value)) {
          refresh();
        }
      },
    );

    return {
      prettyLink,
      context,
      inDialog,
      revision,
      target,
      graphProps,
      refresh,
    };
  },
});
</script>

<template>
  <PreviewCard
    show-initial
    :enabled="inDialog && context.mode ==='Full'"
    :no-scroll="context.mode === 'Basic'"
  >
    <template #preview>
      <GenericGraph v-bind="graphProps" :revision="revision" />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle>
        <template #actions>
          <ProfilePresetAction />
          <ProfileExportAction />
          <ProfileImportAction />
        </template>
      </BlockWidgetToolbar>
    </template>

    <component :is="context.mode">
      <template #warnings>
        <CardWarning v-if="!target.id">
          <template #message>
            Setpoint Profile has no target Setpoint configured.
          </template>
        </CardWarning>
        <BlockEnableToggle
          v-else
          :hide-enabled="context.mode === 'Basic'"
        >
          <template #enabled>
            Setpoint Profile is enabled and driving <i>{{ prettyLink(target) }}</i>.
          </template>
          <template #disabled>
            Setpoint Profile is disabled and not driving <i>{{ prettyLink(target) }}</i>.
          </template>
        </BlockEnableToggle>
      </template>

      <template #preview>
        <q-resize-observer @resize="refresh" />
        <GenericGraph
          v-bind="graphProps"
          :revision="revision"
          :maximized="inDialog"
          auto-fit
          auto-resize
        />
      </template>
    </component>
  </PreviewCard>
</template>
