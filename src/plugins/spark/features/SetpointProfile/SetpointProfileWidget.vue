<script setup lang="ts">
import ProfileExportAction from './ProfileExportAction.vue';
import ProfileImportAction from './ProfileImportAction.vue';
import ProfilePresetAction from './ProfilePresetAction.vue';
import SetpointProfileBasic from './SetpointProfileBasic.vue';
import SetpointProfileDisableDialog from './SetpointProfileDisableDialog.vue';
import SetpointProfileFull from './SetpointProfileFull.vue';
import { GraphProps, profileGraphProps } from './helpers';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { WidgetModeComponents } from '@/store/features';
import { createComponentDialog } from '@/utils/dialog';
import { isJsonEqual } from '@/utils/objects';
import { prettyLink } from '@/utils/quantity';
import { Link, SetpointProfileBlock } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { computed, ref, watch } from 'vue';

type SetpointProfileData = SetpointProfileBlock['data'];

const modes: WidgetModeComponents = {
  Basic: SetpointProfileBasic,
  Full: SetpointProfileFull,
};

const { context, inDialog } = useContext.setup();
const { block, patchBlock } = useBlockWidget.setup<SetpointProfileBlock>();

const usedData = ref<SetpointProfileData>(cloneDeep(block.value.data));
const revision = ref<Date>(new Date());

const target = computed<Link>(() => block.value.data.targetId);

const graphProps = computed<GraphProps>(() => profileGraphProps(block.value));

function refresh(): void {
  usedData.value = cloneDeep(block.value.data);
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
</script>

<template>
  <PreviewCard
    show-initial
    :enabled="inDialog && context.mode === 'Full'"
    :no-scroll="context.mode === 'Basic'"
  >
    <template #preview>
      <PlotlyGraph
        v-bind="graphProps"
        :revision="revision"
        class="fit"
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

    <component :is="modes[context.mode]">
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
        <PlotlyGraph
          v-bind="graphProps"
          :revision="revision"
          class="fit"
        />
      </template>
    </component>
  </PreviewCard>
</template>
