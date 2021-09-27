<script lang="ts">
import { computed, defineComponent, watch } from 'vue';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type {
  BlockRelation,
  BlockRelationNode,
  PageMode,
  SparkService,
  SparkStatus,
} from '@/plugins/spark/types';
import { BlockType } from '@/shared-types';
import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';
import { makeObjectSorter } from '@/utils/functional';
import { startChangeServiceTitle } from '@/utils/services';

import SparkListView from './SparkListView.vue';
import Troubleshooter from './Troubleshooter.vue';

export default defineComponent({
  name: 'SparkPage',
  components: {
    Troubleshooter,
    SparkListView,
  },
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const validTypes: BlockType[] = sparkStore.blockSpecs.map((s) => s.type);

    const service = computed<SparkService | null>(() =>
      serviceStore.serviceById(props.serviceId),
    );

    const title = computed<string>(
      () => service.value?.title ?? 'Spark service',
    );

    watch(
      () => title.value,
      (title) => {
        document.title = `Brewblox | ${title}`;
      },
    );

    const sparkModule = computed<SparkServiceModule | null>(() =>
      sparkStore.moduleById(props.serviceId),
    );

    const isAvailable = computed<boolean>(
      () => service.value !== null && sparkModule.value !== null,
    );

    const isReady = computed<boolean>(
      () => isAvailable.value && sparkModule.value?.lastBlocks != null,
    );

    const status = computed<SparkStatus | null>(
      () => sparkModule.value?.status ?? null,
    );

    const statusNok = computed<boolean>(
      () =>
        isAvailable.value &&
        status.value !== null &&
        (!status.value.isSynchronized || !!status.value.isUpdating),
    );

    const pageMode = computed<PageMode>({
      get: () => sparkModule.value?.sessionConfig.pageMode ?? 'Relations',
      set: (v) => sparkModule.value?.updateSessionConfig({ pageMode: v }),
    });

    const nodes = computed<BlockRelationNode[]>(() =>
      sparkStore
        .serviceBlocks(props.serviceId)
        .filter((block) => validTypes.includes(block.type))
        .map(
          (block): BlockRelationNode => ({
            id: block.id,
            type: featureStore.widgetTitle(block.type),
            name: block.type === BlockType.SysInfo ? title.value : undefined,
          }),
        )
        .sort(makeObjectSorter('type')),
    );

    const edges = computed<BlockRelation[]>(
      () => sparkModule.value?.relations ?? [],
    );

    function editTitle(): void {
      if (service.value) {
        startChangeServiceTitle(service.value);
      }
    }

    return {
      title,
      editTitle,
      isReady,
      status,
      statusNok,
      pageMode,
      nodes,
      edges,
    };
  },
});
</script>

<template>
  <q-page class="page-height">
    <TitleTeleport>
      <span class="cursor-pointer" @click="editTitle">{{ title }}</span>
    </TitleTeleport>
    <ButtonsTeleport>
      <q-btn-group rounded outline class="q-pa-xs self-center">
        <q-btn
          :unelevated="pageMode === 'List'"
          :outline="pageMode !== 'List'"
          color="primary"
          icon="mdi-format-list-checkbox"
          @click="pageMode = 'List'"
        >
          <q-tooltip>Show blocks as list</q-tooltip>
        </q-btn>
        <q-btn
          rounded
          :unelevated="pageMode === 'Relations'"
          :outline="pageMode !== 'Relations'"
          color="primary"
          icon="mdi-vector-line"
          @click="pageMode = 'Relations'"
        >
          <q-tooltip>Show blocks as diagram</q-tooltip>
        </q-btn>
      </q-btn-group>
      <ActionMenu
        :disable="!isReady || statusNok"
        round
        size="12px"
        class="self-center"
      >
        <q-tooltip> Service actions </q-tooltip>
        <template #menus>
          <SparkActions :service-id="serviceId" />
        </template>
      </ActionMenu>
    </ButtonsTeleport>

    <!-- Troubleshooter -->
    <div v-if="statusNok" class="q-pa-lg row">
      <Troubleshooter :service-id="serviceId" />
    </div>

    <!-- Relations graph display -->
    <RelationsDiagram
      v-else-if="pageMode === 'Relations'"
      :service-id="serviceId"
      :nodes="nodes"
      :edges="edges"
      can-create
      class="fit"
    />

    <!-- Block list display -->
    <SparkListView v-else-if="pageMode === 'List'" :service-id="serviceId" />
  </q-page>
</template>
