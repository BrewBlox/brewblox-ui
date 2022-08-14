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
import { useFeatureStore } from '@/store/features';
import { Service, ServiceStub, useServiceStore } from '@/store/services';
import { SidebarFolder, useSidebarStore } from '@/store/sidebar';
import {
  startChangeFolderTitle,
  startCreateFolder,
  startRemoveFolder,
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

const sorter = makeObjectSorter<{ title: string }>('title');
const dashboardFolderNodeId = 'MISC/DASHBOARDS';
const layoutFolderNodeId = 'MISC/LAYOUTS';
const serviceFolderNodeId = 'MISC/SERVICES';
const spacerNodeId = '/SPACER';

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

    const folders = computed<SidebarFolder[]>(() =>
      [...sidebarStore.folders].sort(sorter),
    );

    const objects = computed<SidebarObject[]>(() =>
      [
        ...dashboardStore.dashboards,
        ...builderStore.layouts,
        ...serviceStore.services,
      ].sort(sorter),
    );

    const stubs = computed<ServiceStub[]>(() =>
      serviceStore.stubs.filter((stub) =>
        featureStore.serviceIds.includes(stub.type),
      ),
    );

    function folderHandler(node: QTreeNode): void {
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

      const rootNodes: QTreeNode[] = [];

      const dirNodes = folders.value.reduce(
        (acc: Mapped<QTreeNode>, dir: SidebarFolder) => {
          return {
            ...acc,
            [dir.id]: {
              id: dir.id,
              kind: 'folder',
              label: dir.title,
              parent: dir.parentFolder,
              icon: 'mdi-folder',
              header: 'folder',
              children: [],
              handler: folderHandler,
            },
          };
        },
        {},
      );

      folders.value.forEach((dir) => {
        const node = dirNodes[dir.id];
        if (dir.parentFolder) {
          const parent = dirNodes[dir.parentFolder];
          (parent?.children ?? rootNodes).push(node);
        } else {
          rootNodes.push(node);
        }
      });

      if (rootNodes.length) {
        rootNodes.push({
          id: spacerNodeId + '/misc',
          selectable: false,
          label: '',
        });
      }

      objects.value.forEach((obj) => {
        const parent = dirNodes[obj.parentFolder ?? ''];

        if (obj.namespace === DASHBOARD_NAMESPACE) {
          (parent?.children ?? miscDashboardNodes).push({
            id: obj.id,
            parent: obj.parentFolder,
            kind: 'dashboard',
            label: obj.title,
            url: `/dashboard/${obj.id}`,
            icon: 'mdi-view-dashboard',
            header: 'dashboard',
            handler: (node) => router.push(node.url),
          });
        }

        if (obj.namespace === LAYOUT_NAMESPACE) {
          (parent?.children ?? miscLayoutNodes).push({
            id: obj.id,
            parent: obj.parentFolder,
            kind: 'layout',
            label: obj.title,
            url: `${builderRoutePrefix.value}/${obj.id}`,
            icon: 'mdi-tools',
            header: 'layout',
            handler: (node) => router.push(node.url),
          });
        }

        if (obj.namespace === SERVICE_NAMESPACE) {
          (parent?.children ?? miscServiceNodes).push({
            id: obj.id,
            parent: obj.parentFolder,
            kind: 'service',
            label: obj.title,
            url: `/service/${obj.id}`,
            icon: 'mdi-code-braces',
            header: 'service',
            status: serviceStore.statuses.find((v) => v.id === obj.id),
            handler: (node) => router.push(node.url),
          });
        }
      });

      rootNodes.push(
        {
          id: dashboardFolderNodeId,
          kind: 'miscFolder',
          parent: null,
          label: 'Dashboards',
          icon: 'mdi-view-dashboard',
          header: 'misc',
          children: miscDashboardNodes,
          handler: folderHandler,
        },
        {
          id: layoutFolderNodeId,
          kind: 'miscFolder',
          parent: null,
          label: 'Layouts',
          icon: 'mdi-tools',
          header: 'misc',
          children: miscLayoutNodes,
          handler: folderHandler,
        },
        {
          id: serviceFolderNodeId,
          kind: 'miscFolder',
          parent: null,
          label: 'Services',
          icon: 'mdi-code-braces',
          header: 'misc',
          children: miscServiceNodes,
          handler: folderHandler,
        },
      );

      if (stubs.value.length) {
        rootNodes.push({
          id: spacerNodeId + '/stubs',
          selectable: false,
          label: '',
        });
      }

      stubs.value.forEach((stub) => {
        rootNodes.push({
          id: stub.id,
          label: stub.id,
          featureTitle: featureStore.serviceById(stub.type)?.title,
          icon: 'mdi-code-braces',
          header: 'stub',
          handler: () => startCreateService(stub, router),
        });
      });

      return rootNodes;
    });

    function findRouteFolders(nodes: QTreeNode[], parents: string[]): string[] {
      for (const node of nodes) {
        if (node.url === route.path) {
          return parents;
        }
        if (node.children) {
          const extendedParents = [...parents, node.id];
          const childResults = findRouteFolders(node.children, extendedParents);
          if (childResults.length) {
            return childResults;
          }
        }
      }
      return [];
    }

    const routeFolderIds = computed<string[]>(() =>
      findRouteFolders(treeNodes.value, []),
    );

    function changeFolderTitle(node: QTreeNode): void {
      startChangeFolderTitle(sidebarStore.folderById(node.id));
    }

    function changeDashboardTitle(node: QTreeNode): void {
      startChangeDashboardTitle(dashboardStore.dashboardById(node.id), router);
    }

    function changeLayoutTitle(node: QTreeNode): void {
      startChangeLayoutTitle(builderStore.layoutById(node.id));
    }

    function changeServiceTitle(node: QTreeNode): void {
      startChangeServiceTitle(serviceStore.serviceById(node.id));
    }

    function removeFolder(node: QTreeNode): void {
      startRemoveFolder(sidebarStore.folderById(node.id));
    }

    function removeDashboard(node: QTreeNode): void {
      startRemoveDashboard(dashboardStore.dashboardById(node.id), router);
    }

    function removeLayout(node: QTreeNode): void {
      startRemoveLayout(builderStore.layoutById(node.id), router);
    }

    function removeService(node: QTreeNode): void {
      startRemoveService(serviceStore.serviceById(node.id), router);
    }

    function makeSelectNodes(): QTreeNode[] {
      const selectNodes: QTreeNode[] = [];

      const dirNodes = folders.value.reduce(
        (acc: Mapped<QTreeNode>, dir: SidebarFolder) => {
          return {
            ...acc,
            [dir.id]: {
              id: dir.id,
              label: dir.title,
              parent: dir.parentFolder,
              children: [],
            },
          };
        },
        {},
      );

      folders.value.forEach((dir) => {
        const node = dirNodes[dir.id];
        if (dir.parentFolder) {
          const parent = dirNodes[dir.parentFolder];
          (parent?.children ?? selectNodes).push(node);
        } else {
          selectNodes.push(node);
        }
      });

      return selectNodes;
    }

    function createFolder(node: QTreeNode): void {
      startCreateFolder(node.id);
    }

    function moveToFolder(node: QTreeNode): void {
      createDialog({
        component: 'TreeSelectDialog',
        componentProps: {
          modelValue: node.parent,
          title: 'Move to folder',
          message: `To which folder do you want to move ${node.kind} <b>${node.label}</b>?`,
          html: true,
          clearable: true,
          nodes: makeSelectNodes(),
        },
      }).onOk((parentFolder: string | null) => {
        // Prevent circular folder relations
        let familyId: Maybe<string> = parentFolder;
        while (familyId) {
          if (familyId === node.id) {
            return;
          }
          familyId = sidebarStore.folderById(familyId)?.parentFolder;
        }

        if (node.kind === 'folder') {
          const folder = sidebarStore.folderById(node.id);
          if (folder) {
            sidebarStore.saveFolder({ ...folder, parentFolder });
          }
        }
        if (node.kind === 'dashboard') {
          const dashboard = dashboardStore.dashboardById(node.id);
          if (dashboard) {
            dashboardStore.saveDashboard({ ...dashboard, parentFolder });
          }
        }
        if (node.kind === 'layout') {
          const layout = builderStore.layoutById(node.id);
          if (layout) {
            builderStore.saveLayout({ ...layout, parentFolder });
          }
        }
        if (node.kind === 'service') {
          const service = serviceStore.serviceById(node.id);
          if (service) {
            serviceStore.saveService({ ...service, parentFolder });
          }
        }

        if (parentFolder && !expanded.value.includes(parentFolder)) {
          expanded.value = [...expanded.value, parentFolder];
        }
      });
    }

    function misalignedFolder(node: QTreeNode): boolean {
      // Node bodies of top level folders without children require extra indenting
      return (
        !node.children?.length &&
        !!treeNodes.value.find((n) => n.id === node.id)
      );
    }

    return {
      selected,
      expanded,
      treeNodes,
      folders,
      routeFolderIds,
      createFolder,
      changeFolderTitle,
      changeDashboardTitle,
      changeLayoutTitle,
      changeServiceTitle,
      removeFolder,
      removeDashboard,
      removeLayout,
      removeService,
      moveToFolder,
      misalignedFolder,
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
      <template #header-folder="{ node }">
        <q-item-section class="col-auto">
          <q-icon :name="node.icon" />
        </q-item-section>
        <q-item-section
          :class="['col', { 'text-primary': routeFolderIds.includes(node.id) }]"
        >
          {{ node.label }}
        </q-item-section>
        <div
          v-if="editing"
          class="row"
          @click.stop
        >
          <q-btn
            flat
            round
            icon="edit"
            size="sm"
            @click="changeFolderTitle(node)"
          />
          <q-btn
            flat
            round
            icon="mdi-folder-move"
            size="sm"
            @click="moveToFolder(node)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            size="sm"
            @click="removeFolder(node)"
          />
        </div>
      </template>
      <template #header-dashboard="{ node }">
        <q-item-section class="col-auto">
          <q-icon :name="node.icon" />
        </q-item-section>
        <q-item-section
          :class="['col', { 'text-primary': $route.path === node.url }]"
        >
          {{ node.label }}
        </q-item-section>
        <div
          v-if="editing"
          class="row"
          @click.stop
        >
          <q-btn
            flat
            round
            icon="edit"
            size="sm"
            @click.stop="changeDashboardTitle(node)"
          />
          <q-btn
            :disable="!folders.length"
            flat
            round
            icon="mdi-folder-move"
            size="sm"
            @click="moveToFolder(node)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            size="sm"
            @click="removeDashboard(node)"
          />
        </div>
      </template>
      <template #header-layout="{ node }">
        <q-item-section class="col-auto">
          <q-icon :name="node.icon" />
        </q-item-section>
        <q-item-section
          :class="['col', { 'text-primary': $route.path === node.url }]"
        >
          {{ node.label }}
        </q-item-section>
        <div
          v-if="editing"
          class="row"
          @click.stop
        >
          <q-btn
            flat
            round
            icon="edit"
            size="sm"
            @click="changeLayoutTitle(node)"
          />
          <q-btn
            :disable="!folders.length"
            flat
            round
            icon="mdi-folder-move"
            size="sm"
            @click="moveToFolder(node)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            size="sm"
            @click="removeLayout(node)"
          />
        </div>
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
          :class="['col', { 'text-primary': $route.path === node.url }]"
        >
          {{ node.label }}
        </q-item-section>
        <div
          v-if="editing"
          class="row"
          @click.stop
        >
          <q-btn
            flat
            round
            icon="edit"
            size="sm"
            @click="changeServiceTitle(node)"
          />
          <q-btn
            :disable="!folders.length"
            flat
            round
            icon="mdi-folder-move"
            size="sm"
            @click="moveToFolder(node)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            size="sm"
            @click="removeService(node)"
          />
        </div>
      </template>
      <template #header-misc="{ node }">
        <q-item-section class="col-auto">
          <q-icon :name="node.icon" />
        </q-item-section>
        <q-item-section
          :class="[
            'col text-bold',
            { 'text-primary': routeFolderIds.includes(node.id) },
          ]"
        >
          {{ node.label }}
        </q-item-section>
      </template>
      <template #header-stub="{ node }">
        <q-item-section class="col-auto">
          <q-icon :name="node.icon" />
        </q-item-section>
        <q-item-section class="col ellipsis text-secondary">
          {{ node.id }}
        </q-item-section>
        <q-item-section class="col-auto text-grey text-italic q-mr-sm">
          Click to add
        </q-item-section>
        <q-tooltip>
          Click to create UI service for
          {{ node.featureTitle }}
          '{{ node.id }}'
        </q-tooltip>
      </template>
    </q-tree>
  </div>
</template>
