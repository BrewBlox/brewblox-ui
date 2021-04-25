<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useGlobals } from '@/composables';
import { builderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
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

    const layouts = computed<BuilderLayout[]>({
      // avoid modifying the store object
      get: () => [...builderStore.layouts]
        .filter(layout => layout.listed ?? true)
        .sort(objectSorter('order')),
      set: layouts => builderStore.updateLayoutOrder(layouts.map(v => v.id)),
    });

    const builderPath = computed<string>(
      () => route.path.startsWith('/brewery')
        ? route.path.replace('/brewery', '/builder')
        : '/builder',
    );

    return {
      dense,
      dragging,
      layouts,
      builderPath,
    };
  },
});

// @Component
// export default class BuilderLayoutIndex extends Vue {
//   dragging = false;

//   @Prop({ type: Boolean, required: true })
//   public readonly value!: boolean;

//   get editing(): boolean {
//     return this.value;
//   }

//   set editing(val: boolean) {
//     this.$emit('input', val);
//   }

//   get layouts(): BuilderLayout[] {
//     // avoid modifying the store object
//     return [...builderStore.layouts]
//       .filter(layout => layout.listed ?? true)
//       .sort(objectSorter('order'));
//   }

//   set layouts(layouts: BuilderLayout[]) {
//     builderStore.updateLayoutOrder(layouts.map(v => v.id));
//   }

//   get builderPath(): string {
//     const { path } = this.$route;
//     return path.startsWith('/brewery')
//       ? path.replace('/brewery', '/builder')
//       : '/builder';
//   }
// }
</script>

<template>
  <div>
    <q-item class="q-pb-none">
      <q-item-section class="text-bold">
        Builder layouts
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          :to="builderPath"
          icon="mdi-tools"
          size="sm"
          flat
          round
        >
          <q-tooltip>Open builder</q-tooltip>
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
          :to="editing ? undefined : `/brewery/${element.id}`"
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
