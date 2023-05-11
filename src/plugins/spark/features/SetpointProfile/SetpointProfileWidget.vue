<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createComponentDialog } from '@/utils/dialog';
import { deepCopy, isJsonEqual } from '@/utils/objects';
import { prettyLink } from '@/utils/quantity';
import { Link, SetpointProfileBlock } from 'brewblox-proto/ts';
import { computed, defineComponent, ref, watch } from 'vue';
import { GraphProps, profileGraphProps } from './helpers';
import ProfileExportAction from './ProfileExportAction.vue';
import ProfileImportAction from './ProfileImportAction.vue';
import ProfilePresetAction from './ProfilePresetAction.vue';
import SetpointProfileBasic from './SetpointProfileBasic.vue';
import SetpointProfileDisableDialog from './SetpointProfileDisableDialog.vue';
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
    const { block, patchBlock } = useBlockWidget.setup<SetpointProfileBlock>();

    const usedData = ref<SetpointProfileData>(deepCopy(block.value.data));
    const revision = ref<Date>(new Date());

    const target = computed<Link>(() => block.value.data.targetId);

    const graphProps = computed<GraphProps>(() =>
      profileGraphProps(block.value),
    );

    function refresh(): void {
      usedData.value = deepCopy(block.value.data);
      revision.value = new Date();
    }

    function changeEnabled(enabled: boolean): void {
      if (enabled) {
        patchBlock({ enabled });
      } else {
        createComponentDialog({
          component: SetpointProfileDisableDialog,
          componentProps: {
            block: block.value,
          },
        });
      }
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
      changeEnabled,
    };
  },
});
</script>

<template>
  <PreviewCard
    show-initial
    :enabled="inDialog && context.mode === 'Full'"
    :no-scroll="context.mode === 'Basic'"
  >
    <template #preview>
      <PlotlyGraph
        :data="graphProps.data"
        :layout="graphProps.layout"
        :revision="revision"
      />
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
          emit-toggle
          @change="changeEnabled"
        >
          <template #enabled>
            Setpoint Profile is enabled and claims
            <i> {{ prettyLink(target) }} </i>.
          </template>
          <template #disabled>
            Setpoint Profile is disabled and does not claim
            <i> {{ prettyLink(target) }} </i>.
          </template>
        </BlockEnableToggle>
      </template>

      <template #graph>
        <q-resize-observer @resize="refresh" />
        <PlotlyGraph
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
