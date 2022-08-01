<script lang="ts">
import { useGlobals } from '@/composables';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { QTreeNode } from 'quasar';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const dashboardSorter = makeObjectSorter<Dashboard>('order');

export default defineComponent({
  name: 'DashboardIndex',
  props: {
    editing: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:editing'],
  setup() {
    const dashboardStore = useDashboardStore();
    const { dense } = useGlobals.setup();
    const router = useRouter();

    const dashboards = computed<Dashboard[]>({
      // Avoid modifying the store object when calling sort()
      get: () =>
        [...dashboardStore.dashboards]
          .filter((dashboard) => dashboard.listed ?? true)
          .sort(dashboardSorter),
      set: (dashboards) =>
        dashboardStore.updateDashboardOrder(dashboards.map((v) => v.id)),
    });

    const nodes = computed<QTreeNode[]>(() => {
      const rootNodes: QTreeNode[] = [];

      dashboards.value.forEach((dashboard) => {
        const path = dashboard.path ?? '';
        const slugs = path.split('/').filter((s) => s !== '');
        let nodes = rootNodes;

        slugs.forEach((slug: string, i: number) => {
          const path = slugs.slice(0, i + 1).join('/') + '/';
          const existing = nodes.find((n) => n.id === path && n.children);
          if (existing) {
            nodes = existing.children!;
          } else {
            const children = [];
            nodes.push({
              id: path,
              label: slug,
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
          url: `/dashboard/${dashboard.id}`,
          body: 'dashboard',
          path,
          handler: (node) => router.push(node.url),
        });
      });

      return rootNodes;
    });

    const selected = ref<string | null>(null);
    const expanded = ref<string[]>([]);

    function startWizard(): void {
      createDialog({
        component: 'WizardDialog',
        componentProps: {
          initialWizard: 'DashboardWizard',
        },
      });
    }

    onMounted(() => {
      const activePath = router.currentRoute.value.path;
      const activeDashboard = dashboards.value.find(
        (v) => activePath === `/dashboard/${v.id}`,
      );
      if (activeDashboard && activeDashboard.path) {
        const slugs = activeDashboard.path.split('/').filter((s) => s !== '');
        expanded.value = slugs.map(
          (_, i) => slugs.slice(0, i + 1).join('/') + '/',
        );
      }
    });

    return {
      dense,
      dashboards,
      nodes,
      selected,
      expanded,
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
      <q-item-section class="col-auto">
        <q-btn
          :disable="dashboards.length === 0"
          :color="editing ? 'primary' : ''"
          icon="mdi-sort"
          round
          flat
          size="sm"
          @click="$emit('update:editing', !editing)"
        >
          <q-tooltip> Rearrange dashboards </q-tooltip>
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
        <span :class="[node.url === $route.path && 'text-primary']">{{
          node.label
        }}</span>
      </template>
      <template
        v-if="editing"
        #body-dashboard="{ node }"
      >
        <div
          v-if="editing"
          :class="[!node.path && 'q-pl-lg']"
          class="col"
        >
          body
        </div>
      </template>
    </q-tree>
  </div>
</template>

<style scoped>
.bordered {
  border: 1px solid whitesmoke;
  margin-top: 2px;
}
</style>
