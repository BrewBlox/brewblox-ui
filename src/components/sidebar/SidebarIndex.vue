<script lang="ts">
import {
  DASHBOARD_NAMESPACE,
  LAYOUT_NAMESPACE,
  SERVICE_NAMESPACE,
} from '@/const';
import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import {
  startChangeLayoutTitle,
  startRemoveLayout,
} from '@/plugins/builder/utils';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { ServiceFeature, useFeatureStore } from '@/store/features';
import { Service, ServiceStub, useServiceStore } from '@/store/services';
import { SidebarDirectory, useSidebarStore } from '@/store/sidebar';
import {
  startChangeDirectoryTitle,
  startCreateDirectory,
  startRemoveDirectory,
} from '@/store/sidebar/utils';
import {
  startChangeDashboardTitle,
  startRemoveDashboard,
} from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import {
  startChangeServiceTitle,
  startCreateService,
  startRemoveService,
} from '@/utils/services';
import isArray from 'lodash/isArray';
import { QTreeNode, useQuasar } from 'quasar';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
type SidebarObject = Dashboard | Service | BuilderLayout;

interface ServiceSuggestion {
  stub: ServiceStub;
  feature: ServiceFeature;
}

const sorter = makeObjectSorter<{ title: string }>('title');
const dashboardDirNodeId = 'MISC/DASHBOARDS';
const layoutDirNodeId = 'MISC/LAYOUTS';
const serviceDirNodeId = 'MISC/SERVICES';

export default defineComponent({
  name: 'SidebarIndex',
  props: {
    editing: { type: Boolean, required: true },
  },
  setup() {
    const dashboardStore = useDashboardStore();
    const serviceStore = useServiceStore();
    const builderStore = useBuilderStore();
    const featureStore = useFeatureStore();
    const sidebarStore = useSidebarStore();
    const route = useRoute();
    const router = useRouter();
    const { localStorage } = useQuasar();

    const selected = ref<string | null>(null);
    const _expanded = ref<string[]>([]);

    const expanded = computed<string[]>({
      get: () => _expanded.value,
      set: (v) => {
        _expanded.value = v;
        localStorage.set('sidebar_expanded', v);
      },
    });

    onBeforeMount(() => {
      const stored = localStorage.getItem('sidebar_expanded');
      if (isArray(stored)) {
        _expanded.value = stored;
      }
    });

    const builderRoutePrefix = computed<string>(() =>
      route.path.startsWith('/builder') ? '/builder' : '/brewery',
    );

    const directories = computed<SidebarDirectory[]>(() =>
      [...sidebarStore.directories].sort(sorter),
    );

    const objects = computed<SidebarObject[]>(() =>
      [
        ...dashboardStore.dashboards,
        ...builderStore.layouts,
        ...serviceStore.services,
      ].sort(sorter),
    );

    const suggestions = computed<ServiceSuggestion[]>(() =>
      serviceStore.stubs
        .map((stub) => {
          const feature = featureStore.serviceById(stub.type)!;
          return { stub, feature };
        })
        .filter(({ feature }) => feature !== null),
    );

    function directoryHandler(node: QTreeNode): void {
      selected.value = node.id;
      if (expanded.value.includes(node.id)) {
        expanded.value = expanded.value.filter((s) => s !== node.id);
      } else {
        expanded.value = [...expanded.value, node.id];
      }
    }

    const treeNodes = computed<QTreeNode[]>(() => {
      const miscDashboardNodes: QTreeNode[] = [];
      const miscLayoutNodes: QTreeNode[] = [];
      const miscServiceNodes: QTreeNode[] = [];

      const rootNodes: QTreeNode[] = [
        {
          id: dashboardDirNodeId,
          kind: 'miscDirectory',
          parent: null,
          label: 'Dashboards',
          icon: 'mdi-view-dashboard',
          children: miscDashboardNodes,
          handler: directoryHandler,
        },
        {
          id: layoutDirNodeId,
          kind: 'miscDirectory',
          parent: null,
          label: 'Layouts',
          icon: 'mdi-tools',
          children: miscLayoutNodes,
          handler: directoryHandler,
        },
        {
          id: serviceDirNodeId,
          kind: 'miscDirectory',
          parent: null,
          label: 'Services',
          icon: 'mdi-code-braces',
          children: miscServiceNodes,
          handler: directoryHandler,
        },
      ];

      const dirNodes = directories.value.reduce(
        (acc: Mapped<QTreeNode>, dir: SidebarDirectory) => {
          return {
            ...acc,
            [dir.id]: {
              id: dir.id,
              kind: 'directory',
              label: dir.title,
              parent: dir.parent,
              icon: 'mdi-folder',
              body: 'directory',
              children: [],
              handler: directoryHandler,
            },
          };
        },
        {},
      );

      directories.value.forEach((dir) => {
        const node = dirNodes[dir.id];
        if (dir.parent) {
          const parent = dirNodes[dir.parent];
          (parent?.children ?? rootNodes).push(node);
        } else {
          rootNodes.push(node);
        }
      });

      objects.value.forEach((obj) => {
        const parent = dirNodes[obj.dir ?? ''];

        if (obj.namespace === DASHBOARD_NAMESPACE) {
          (parent?.children ?? miscDashboardNodes).push({
            id: obj.id,
            parent: obj.dir,
            kind: 'dashboard',
            label: obj.title,
            url: `/dashboard/${obj.id}`,
            icon: 'mdi-view-dashboard',
            body: 'dashboard',
            handler: (node) => router.push(node.url),
          });
        }

        if (obj.namespace === LAYOUT_NAMESPACE) {
          (parent?.children ?? miscLayoutNodes).push({
            id: obj.id,
            parent: obj.dir,
            kind: 'layout',
            label: obj.title,
            url: `${builderRoutePrefix.value}/${obj.id}`,
            icon: 'mdi-tools',
            body: 'layout',
            handler: (node) => router.push(node.url),
          });
        }

        if (obj.namespace === SERVICE_NAMESPACE) {
          (parent?.children ?? miscServiceNodes).push({
            id: obj.id,
            parent: obj.dir,
            kind: 'service',
            label: obj.title,
            url: `/service/${obj.id}`,
            icon: 'mdi-code-braces',
            header: 'service',
            body: 'service',
            status: serviceStore.statuses.find((v) => v.id === obj.id),
            handler: (node) => router.push(node.url),
          });
        }
      });

      suggestions.value.forEach((suggestion) => {
        const { stub, feature } = suggestion;
        rootNodes.push({
          stub,
          feature,
          id: stub.id,
          label: stub.id,
          icon: 'mdi-code-braces',
          header: 'suggestion',
          body: 'suggestion',
          handler: (node) => startCreateService(node.stub, router),
        });
      });

      return rootNodes;
    });

    function changeDirectoryTitle(node: QTreeNode): void {
      startChangeDirectoryTitle(sidebarStore.directoryById(node.id));
    }

    function changeDashboardTitle(node: QTreeNode): void {
      const dashboard = dashboardStore.dashboardById(node.id);
      if (dashboard) {
        const active = route.path === `/dashboard/${node.id}`;
        startChangeDashboardTitle(
          dashboard,
          (newId) => active && router.replace(`/dashboard/${newId}`),
        );
      }
    }

    function changeLayoutTitle(node: QTreeNode): void {
      startChangeLayoutTitle(builderStore.layoutById(node.id));
    }

    function changeServiceTitle(node: QTreeNode): void {
      startChangeServiceTitle(serviceStore.serviceById(node.id));
    }

    function removeDirectory(node: QTreeNode): void {
      startRemoveDirectory(sidebarStore.directoryById(node.id));
    }

    function removeDashboard(node: QTreeNode): void {
      startRemoveDashboard(dashboardStore.dashboardById(node.id));
    }

    function removeLayout(node: QTreeNode): void {
      startRemoveLayout(builderStore.layoutById(node.id));
    }

    function removeService(node: QTreeNode): void {
      startRemoveService(serviceStore.serviceById(node.id), router);
    }

    function makeSelectNodes(): QTreeNode[] {
      const selectNodes: QTreeNode[] = [];

      const dirNodes = directories.value.reduce(
        (acc: Mapped<QTreeNode>, dir: SidebarDirectory) => {
          return {
            ...acc,
            [dir.id]: {
              id: dir.id,
              label: dir.title,
              parent: dir.parent,
              children: [],
            },
          };
        },
        {},
      );

      directories.value.forEach((dir) => {
        const node = dirNodes[dir.id];
        if (dir.parent) {
          const parent = dirNodes[dir.parent];
          (parent?.children ?? selectNodes).push(node);
        } else {
          selectNodes.push(node);
        }
      });

      return selectNodes;
    }

    function createDirectory(node: QTreeNode): void {
      startCreateDirectory(node.id);
    }

    function moveToDirectory(node: QTreeNode): void {
      createDialog({
        component: 'TreeSelectDialog',
        componentProps: {
          modelValue: node.parent,
          title: 'Move to directory',
          message: `To which directory do you want to move ${node.kind} <b>${node.label}</b>?`,
          html: true,
          clearable: true,
          nodes: makeSelectNodes(),
        },
      }).onOk((dir: string | null) => {
        // Prevent circular directory relations
        let familyId: Maybe<string> = dir;
        while (familyId) {
          if (familyId === node.id) {
            return;
          }
          familyId = sidebarStore.directoryById(familyId)?.parent;
        }

        if (node.kind === 'directory') {
          const directory = sidebarStore.directoryById(node.id);
          if (directory) {
            sidebarStore.saveDirectory({ ...directory, parent: dir });
          }
        }
        if (node.kind === 'dashboard') {
          const dashboard = dashboardStore.dashboardById(node.id);
          if (dashboard) {
            dashboardStore.saveDashboard({ ...dashboard, dir });
          }
        }
        if (node.kind === 'layout') {
          const layout = builderStore.layoutById(node.id);
          if (layout) {
            builderStore.saveLayout({ ...layout, dir });
          }
        }
        if (node.kind === 'service') {
          const service = serviceStore.serviceById(node.id);
          if (service) {
            serviceStore.saveService({ ...service, dir });
          }
        }

        if (dir && !expanded.value.includes(dir)) {
          expanded.value = [...expanded.value, dir];
        }
      });
    }

    function misalignedDirectory(node: QTreeNode): boolean {
      // Node bodies of top level directories without children require extra indenting
      return (
        !node.children?.length &&
        !!treeNodes.value.find((n) => n.id === node.id)
      );
    }

    return {
      selected,
      expanded,
      treeNodes,
      createDirectory,
      changeDirectoryTitle,
      changeDashboardTitle,
      changeLayoutTitle,
      changeServiceTitle,
      removeDirectory,
      removeDashboard,
      removeLayout,
      removeService,
      moveToDirectory,
      misalignedDirectory,
    };
  },
});
</script>

<template>
  <div>
    <q-tree
      v-model:selected="selected"
      v-model:expanded="expanded"
      :nodes="treeNodes"
      node-key="id"
    >
      <template #default-header="{ node }">
        <q-item-section class="col-auto">
          <q-icon :name="node.icon" />
        </q-item-section>
        <q-item-section
          :class="{
            col: true,
            'text-primary': $route.path === node.url,
          }"
        >
          {{ node.label }}
        </q-item-section>
      </template>
      <template #header-service="{ node }">
        <q-item-section
          v-if="node.status"
          class="col-auto"
        >
          <q-icon
            :name="node.status.icon || node.icon"
            :color="node.status.color"
          />
          <q-tooltip>
            {{ node.status.desc }}
          </q-tooltip>
        </q-item-section>
        <q-item-section
          v-else
          class="col-auto"
        >
          <q-icon :name="node.icon" />
        </q-item-section>
        <q-item-section
          :class="{
            col: true,
            'text-primary': $route.path === node.url,
          }"
        >
          {{ node.label }}
        </q-item-section>
      </template>
      <template #header-suggestion="{ node }">
        <q-item-section class="col-auto">
          <q-icon :name="node.icon" />
        </q-item-section>
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
      <template
        v-if="editing"
        #body-directory="{ node }"
      >
        <div class="row">
          <div
            v-if="misalignedDirectory(node)"
            class="col-auto q-ml-md"
          />
          <q-btn
            flat
            round
            icon="mdi-folder-move"
            size="sm"
            @click="moveToDirectory(node)"
          />
          <q-btn
            flat
            round
            icon="edit"
            size="sm"
            @click="changeDirectoryTitle(node)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            size="sm"
            @click="removeDirectory(node)"
          />
        </div>
      </template>
      <template
        v-if="editing"
        #body-dashboard="{ node }"
      >
        <q-btn
          flat
          round
          icon="mdi-folder-move"
          size="sm"
          @click="moveToDirectory(node)"
        />
        <q-btn
          flat
          round
          icon="edit"
          size="sm"
          @click="changeDashboardTitle(node)"
        />
        <q-btn
          flat
          round
          icon="mdi-delete"
          size="sm"
          @click="removeDashboard(node)"
        />
      </template>
      <template
        v-if="editing"
        #body-layout="{ node }"
      >
        <q-btn
          flat
          round
          icon="mdi-folder-move"
          size="sm"
          @click="moveToDirectory(node)"
        />
        <q-btn
          flat
          round
          icon="edit"
          size="sm"
          @click="changeLayoutTitle(node)"
        />
        <q-btn
          flat
          round
          icon="mdi-delete"
          size="sm"
          @click="removeLayout(node)"
        />
      </template>
      <template
        v-if="editing"
        #body-service="{ node }"
      >
        <q-btn
          flat
          round
          icon="mdi-folder-move"
          size="sm"
          @click="moveToDirectory(node)"
        />
        <q-btn
          flat
          round
          icon="edit"
          size="sm"
          @click="changeServiceTitle(node)"
        />
        <q-btn
          flat
          round
          icon="mdi-delete"
          size="sm"
          @click="removeService(node)"
        />
      </template>
    </q-tree>
  </div>
</template>
