<script lang="ts">
import { useGlobals } from '@/composables';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import isArray from 'lodash/isArray';
import nth from 'lodash/nth';
import { QTreeNode, useQuasar } from 'quasar';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const sorter = makeObjectSorter<Dashboard>('dir', 'title');

export default defineComponent({
  name: 'DashboardIndex',
  setup() {
    const dashboardStore = useDashboardStore();
    const { dense } = useGlobals.setup();
    const route = useRoute();
    const router = useRouter();
    const { localStorage } = useQuasar();

    const selected = ref<string | null>(null);
    const _expanded = ref<string[]>([]);

    const expanded = computed<string[]>({
      get: () => _expanded.value,
      set: (v) => {
        _expanded.value = v;
        localStorage.set('dashboard_expanded', v);
      },
    });

    onBeforeMount(() => {
      const stored = localStorage.getItem('dashboard_expanded');
      if (isArray(stored)) {
        _expanded.value = stored;
      }
    });

    const dashboards = computed<Dashboard[]>(
      // Avoid modifying the store object when calling sort()
      () => [...dashboardStore.dashboards].sort(sorter),
    );

    const activePath = computed<string | null>(() => {
      const dashboard = dashboards.value.find(
        (v) => `/dashboard/${v.id}` === route.path,
      );
      return dashboard ? `${dashboard.dir ?? ''}/${dashboard.id}` : null;
    });

    const nodes = computed<QTreeNode[]>(() => {
      const rootNodes: QTreeNode[] = [];

      dashboards.value.forEach((dashboard) => {
        const dir = dashboard.dir ?? '';
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
          id: dashboard.id,
          label: dashboard.title,
          path: `${dir}/${dashboard.id}`,
          url: `/dashboard/${dashboard.id}`,
          handler: (node) => router.push(node.url),
        });
      });

      return rootNodes;
    });

    function intermediatePaths(path: string): string[] {
      const slugs = path.split('/').filter((s) => s !== '');
      return slugs.map((_, i) => slugs.slice(0, i + 1).join('/'));
    }

    function startWizard(): void {
      createDialog({
        component: 'WizardDialog',
        componentProps: {
          initialWizard: 'DashboardWizard',
        },
      });
    }

    return {
      dense,
      dashboards,
      nodes,
      selected,
      expanded,
      activePath,
      startWizard,
    };
  },
});
</script>

<template>
  <div>
    <q-item class="q-pb-none">
      <q-item-section class="text-bold"> Dashboards </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          icon="add"
          round
          flat
          size="sm"
          @click="startWizard"
        >
          <q-tooltip>Add dashboard</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>

    <q-tree
      v-model:selected="selected"
      v-model:expanded="expanded"
      :nodes="nodes"
      node-key="id"
    >
      <template #default-header="{ node }">
        <span :class="[activePath?.startsWith(node.path) && 'text-primary']">{{
          node.label
        }}</span>
      </template>
    </q-tree>
  </div>
</template>
