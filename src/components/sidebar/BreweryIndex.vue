<script lang="ts">
import { useGlobals } from '@/composables';
import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import { startAddLayout } from '@/plugins/builder/utils';
import { makeObjectSorter } from '@/utils/functional';
import isArray from 'lodash/isArray';
import nth from 'lodash/nth';
import { QTreeNode, useQuasar } from 'quasar';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const sorter = makeObjectSorter<BuilderLayout>('dir', 'title');

export default defineComponent({
  name: 'BreweryIndex',
  setup() {
    const builderStore = useBuilderStore();
    const { dense } = useGlobals.setup();
    const dragging = ref(false);
    const route = useRoute();
    const router = useRouter();
    const { localStorage } = useQuasar();

    const layouts = computed<BuilderLayout[]>(
      // Avoid modifying the store object when calling sort()
      () => [...builderStore.layouts].sort(sorter),
    );

    const selected = ref<string | null>(null);
    const _expanded = ref<string[]>([]);

    const expanded = computed<string[]>({
      get: () => _expanded.value,
      set: (v) => {
        _expanded.value = v;
        localStorage.set('layout_expanded', v);
      },
    });

    onBeforeMount(() => {
      const stored = localStorage.getItem('layout_expanded');
      if (isArray(stored)) {
        _expanded.value = stored;
      }
    });

    const navPrefix = computed<string>(() =>
      route.path.startsWith('/builder') ? '/builder' : '/brewery',
    );

    const activePath = computed<string | null>(() => {
      const prefix = navPrefix.value;
      const layout = layouts.value.find(
        (v) => `${prefix}/${v.id}` === route.path,
      );
      return layout ? `${layout.dir ?? ''}/${layout.id}` : null;
    });

    const nodes = computed<QTreeNode[]>(() => {
      const prefix = navPrefix.value;
      const rootNodes: QTreeNode[] = [];

      layouts.value.forEach((layout) => {
        const dir = layout.dir ?? '';
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
          id: layout.id,
          label: layout.title,
          path: `${dir}/${layout.id}`,
          url: `${prefix}/${layout.id}`,
          handler: (node) => router.push(node.url),
        });
      });

      return rootNodes;
    });

    function intermediatePaths(path: string): string[] {
      const slugs = path.split('/').filter((s) => s !== '');
      return slugs.map((_, i) => slugs.slice(0, i + 1).join('/'));
    }

    async function createLayout(): Promise<void> {
      const id = await startAddLayout();
      if (id) {
        router.push(`/builder/${id}`);
      }
    }

    return {
      dense,
      dragging,
      layouts,
      navPrefix,
      activePath,
      selected,
      expanded,
      nodes,
      createLayout,
    };
  },
});
</script>

<template>
  <div>
    <q-item class="q-pb-none">
      <q-item-section class="text-bold"> Builder layouts </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          icon="add"
          round
          flat
          size="sm"
          @click="createLayout"
        >
          <q-tooltip>Add layout</q-tooltip>
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
