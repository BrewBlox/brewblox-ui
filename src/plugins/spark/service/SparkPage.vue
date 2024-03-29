<script setup lang="ts">
import {
  BlockRelation,
  BlockType,
  SparkStatusDescription,
} from 'brewblox-proto/ts';
import { computed, watch } from 'vue';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import type {
  BlockRelationNode,
  PageMode,
  SparkService,
} from '@/plugins/spark/types';
import { useFeatureStore } from '@/store/features';
import { useServiceStore } from '@/store/services';
import { makeObjectSorter } from '@/utils/functional';
import { startChangeServiceTitle } from '@/utils/services';
import SparkListView from './SparkListView.vue';
import SparkTroubleshooter from './SparkTroubleshooter.vue';

interface Props {
  serviceId: string;
}

const props = defineProps<Props>();

const serviceStore = useServiceStore();
const featureStore = useFeatureStore();
const sparkStore = useSparkStore();
const specStore = useBlockSpecStore();
const validTypes = specStore.blockSpecs.map((s) => s.type);

const service = computed<SparkService | null>(() =>
  serviceStore.serviceById(props.serviceId),
);

const title = computed<string>(() => service.value?.title ?? 'Spark service');

watch(
  () => title.value,
  (title) => {
    document.title = `Brewblox | ${title}`;
  },
  { immediate: true },
);

const isAvailable = computed<boolean>(
  () => service.value !== null && sparkStore.has(props.serviceId),
);

const isReady = computed<boolean>(
  () =>
    isAvailable.value &&
    sparkStore.lastBlocksAtByService(props.serviceId) != null,
);

const status = computed<SparkStatusDescription | null>(() =>
  sparkStore.statusByService(props.serviceId),
);

const statusNok = computed<boolean>(
  () => status.value?.connection_status !== 'SYNCHRONIZED',
);

const pageMode = computed<PageMode>({
  get: () =>
    sparkStore.sessionConfigByService(props.serviceId).pageMode ?? 'Relations',
  set: (v) => sparkStore.updateSessionConfig(props.serviceId, { pageMode: v }),
});

const nodes = computed<BlockRelationNode[]>(() =>
  sparkStore
    .blocksByService(props.serviceId)
    .filter((block) => validTypes.includes(block.type))
    .map(
      (block): BlockRelationNode => ({
        id: block.id,
        type: featureStore.widgetTitle(block.type),
        name: block.type === BlockType.SysInfo ? title.value : undefined,
        status: specStore.blockSpecByType(block.type)?.analyze(block),
      }),
    )
    .sort(makeObjectSorter('type')),
);

const edges = computed<BlockRelation[]>(() =>
  sparkStore.relationsByService(props.serviceId),
);

function editTitle(): void {
  if (service.value) {
    startChangeServiceTitle(service.value);
  }
}
</script>

<template>
  <q-page class="page-height">
    <TitleTeleport>
      <span
        class="cursor-pointer"
        @click="editTitle"
      >
        {{ title }}
      </span>
    </TitleTeleport>
    <ButtonsTeleport>
      <q-btn-group
        rounded
        outline
        class="q-pa-xs self-center"
      >
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
    <div
      v-if="statusNok"
      class="q-pa-lg row"
    >
      <SparkTroubleshooter :service-id="serviceId" />
    </div>

    <!-- Relations graph display -->
    <RelationsDiagram
      v-else-if="pageMode === 'Relations'"
      :service-id="serviceId"
      :nodes="nodes"
      :edges="edges"
      class="fit"
    />

    <!-- Block list display -->
    <SparkListView
      v-else-if="pageMode === 'List'"
      :service-id="serviceId"
    />
  </q-page>
</template>
