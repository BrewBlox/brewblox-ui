<script lang="ts">
import { useGlobals } from '@/composables';
import { ServiceFeature, useFeatureStore } from '@/store/features';
import {
  Service,
  ServiceStatus,
  ServiceStub,
  useServiceStore,
} from '@/store/services';
import { makeObjectSorter } from '@/utils/functional';
import { startCreateService } from '@/utils/services';
import isArray from 'lodash/isArray';
import nth from 'lodash/nth';
import { QTreeNode, useQuasar } from 'quasar';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface ServiceSuggestion {
  stub: ServiceStub;
  feature: ServiceFeature;
}

const sorter = makeObjectSorter<Service>('dir', 'title');

export default defineComponent({
  name: 'ServiceIndex',
  setup() {
    const serviceStore = useServiceStore();
    const featureStore = useFeatureStore();
    const route = useRoute();
    const router = useRouter();
    const { dense } = useGlobals.setup();
    const { localStorage } = useQuasar();

    const selected = ref<string | null>(null);
    const _expanded = ref<string[]>([]);

    const expanded = computed<string[]>({
      get: () => _expanded.value,
      set: (v) => {
        _expanded.value = v;
        localStorage.set('service_expanded', v);
      },
    });

    onBeforeMount(() => {
      const stored = localStorage.getItem('service_expanded');
      if (isArray(stored)) {
        _expanded.value = stored;
      }
    });

    const services = computed<Service[]>(
      // Avoid modifying the store object when calling sort()
      () => [...serviceStore.services].sort(sorter),
    );

    const activePath = computed<string | null>(() => {
      const service = services.value.find(
        (v) => `/service/${v.id}` === route.path,
      );
      return service ? `${service.dir ?? ''}/${service.id}` : null;
    });

    const suggestions = computed<ServiceSuggestion[]>(() =>
      serviceStore.stubs
        .map((stub) => {
          const feature = featureStore.serviceById(stub.type)!;
          return { stub, feature };
        })
        .filter(({ feature }) => feature !== null),
    );

    const nodes = computed<QTreeNode[]>(() => {
      const rootNodes: QTreeNode[] = [];

      services.value.forEach((service) => {
        const dir = service.dir ?? '';
        const dirPaths = intermediatePaths(dir);
        let nodes = rootNodes;

        dirPaths.forEach((path: string) => {
          const id = `dir://${path}`;
          const existing = nodes.find((n) => n.id === id);
          if (existing) {
            nodes = existing.children!;
          } else {
            const children = [];
            nodes.push({
              id,
              path,
              label: nth(path.split('/'), -1),
              children,
              handler: (node) => {
                if (expanded.value.includes(node.id)) {
                  expanded.value = expanded.value.filter((s) => s !== node.id);
                } else {
                  expanded.value = [...expanded.value, node.id];
                }
              },
            });
            nodes = children;
          }
        });

        nodes.push({
          id: service.id,
          label: service.title,
          path: `${dir}/${service.id}`,
          url: `/service/${service.id}`,
          status: serviceStore.statuses.find((v) => v.id === service.id),
          handler: (node) => router.push(node.url),
        });
      });

      suggestions.value.forEach((suggestion) => {
        const { stub, feature } = suggestion;
        rootNodes.push({
          stub,
          feature,
          id: stub.id,
          label: stub.id,
          header: 'suggestion',
          body: 'suggestion',
          handler: (node) => createService(node.stub),
        });
      });

      return rootNodes;
    });

    function intermediatePaths(path: string): string[] {
      const slugs = path.split('/').filter((s) => s !== '');
      return slugs.map((_, i) => slugs.slice(0, i + 1).join('/'));
    }

    function status(service: Service): ServiceStatus | null {
      return serviceStore.statuses.find((v) => v.id === service.id) ?? null;
    }

    function createService(stub: ServiceStub): void {
      startCreateService(stub, router);
    }

    return {
      dense,
      services,
      suggestions,
      activePath,
      selected,
      expanded,
      nodes,
      status,
      createService,
    };
  },
});
</script>

<template>
  <div>
    <q-item class="q-pb-none">
      <q-item-section class="text-bold"> Services </q-item-section>
    </q-item>

    <q-tree
      v-model:selected="selected"
      v-model:expanded="expanded"
      :nodes="nodes"
      node-key="id"
    >
      <template #default-header="{ node }">
        <q-item-section
          :class="[activePath?.startsWith(node.path) && 'text-primary']"
        >
          {{ node.label }}
        </q-item-section>
        <template v-if="node.status">
          <q-item-section class="col-auto q-mr-sm">
            <q-icon
              :name="node.status.icon || 'mdi-checkbox-blank-circle'"
              :color="node.status.color"
            />
            <q-tooltip>
              {{ node.status.desc }}
            </q-tooltip>
          </q-item-section>
        </template>
      </template>
      <template #header-suggestion="{ node }">
        <q-item-section class="col ellipsis text-secondary">
          {{ node.stub.id }}
        </q-item-section>
        <q-item-section class="col-auto text-grey text-italic q-mr-sm">
          Click to add
        </q-item-section>
        <q-tooltip>
          Click to create UI service for
          {{ node.feature.title }}
          '{{ node.stub.id }}'
        </q-tooltip>
      </template>
    </q-tree>
  </div>
</template>
