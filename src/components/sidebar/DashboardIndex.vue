<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useGlobals } from '@/composables';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { createDialog, makeObjectSorter } from '@/utils';

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
    const { dense } = useGlobals.setup();
    const dragging = ref(false);

    const dashboards = computed<Dashboard[]>({
      // Avoid modifying the store object when calling sort()
      get: () => [...dashboardStore.dashboards].sort(dashboardSorter),
      set: dashboards => dashboardStore.updateDashboardOrder(dashboards.map(v => v.id)),
    });

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
      dragging,
      dashboards,
      startWizard,
    };
  },
});
</script>

<template>
  <div>
    <q-item class="q-pb-none">
      <q-item-section class="text-bold">
        Dashboards
      </q-item-section>
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
          <q-tooltip>
            Rearrange dashboards
          </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>

    <draggable
      v-model="dashboards"
      :disabled="dense || !editing"
      item-key="id"
      @start="dragging=true"
      @end="dragging=false"
    >
      <template #item="{element}">
        <q-item
          :to="editing ? undefined : `/dashboard/${element.id}`"
          :inset-level="0.2"
          :class="[
            'q-pb-sm',
            editing && 'bordered pointer',
          ]"
          style="min-height: 0px"
        >
          <!-- {{ element }} -->
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
