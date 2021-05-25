<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useGlobals } from '@/composables';
import { builderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import { startAddLayout } from '@/plugins/builder/utils';
import { objectSorter } from '@/utils/functional';

export default defineComponent({
  name: 'BreweryIndex',
  props: {
    editing: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:editing'],
  setup() {
    const { dense } = useGlobals.setup();
    const dragging = ref(false);
    const route = useRoute();
    const router = useRouter();

    const layouts = computed<BuilderLayout[]>({
      // avoid modifying the store object
      get: () => [...builderStore.layouts]
        .filter(layout => layout.listed ?? true)
        .sort(objectSorter('order')),
      set: layouts => builderStore.updateLayoutOrder(layouts.map(v => v.id)),
    });

    const navPrefix = computed<string>(
      () => route.path.startsWith('/builder')
        ? '/builder'
        : '/brewery',
    );

    const editorButtonPath = computed<string>(
      () => {
        if (route.path.startsWith('/brewery')) {
          return route.path.replace('/brewery', '/builder');
        }
        else if (route.path.startsWith('/builder')) {
          return route.path.replace('/builder', '/brewery');
        }
        else {
          return '/builder';
        }
      },
    );

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
      editorButtonPath,
      createLayout,
    };
  },
});
</script>

<template>
  <div>
    <q-item class="q-pb-none">
      <q-item-section class="text-bold">
        Builder layouts
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          :to="editorButtonPath"
          icon="mdi-tools"
          size="sm"
          :color="navPrefix === '/builder' ? 'primary' : ''"
          flat
          round
        >
          <q-tooltip>Toggle editor mode</q-tooltip>
        </q-btn>
      </q-item-section>
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
      <q-item-section class="col-auto">
        <q-btn
          :disable="layouts.length === 0"
          :color="editing ? 'primary' : ''"
          icon="mdi-sort"
          round
          flat
          size="sm"
          @click="$emit('update:editing', !editing)"
        >
          <q-tooltip>
            Rearrange layouts
          </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>

    <draggable
      v-model="layouts"
      :disabled="dense || !editing"
      item-key="id"
      @start="dragging=true"
      @end="dragging=false"
    >
      <template #item="{element}">
        <q-item
          :to="editing ? undefined : `${navPrefix}/${element.id}`"
          :inset-level="0.2"
          :class="[
            'q-pb-sm',
            editing && 'bordered pointer',
          ]"
          style="min-height: 0px"
        >
          <q-item-section
            :class="['ellipsis', editing && 'text-italic']"
          >
            {{ element.title }}
          </q-item-section>
        </q-item>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.bordered {
  border: 1px solid whitesmoke;
  margin-top: 2px;
}
</style>
