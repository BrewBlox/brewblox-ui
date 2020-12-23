<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectSorter } from '@/helpers/functional';
import { Dashboard, dashboardStore } from '@/store/dashboards';


@Component
export default class DashboardIndex extends Vue {
  dragging = false;

  @Prop({ type: Boolean, required: true })
  public readonly value!: boolean;

  get editing(): boolean {
    return this.value;
  }

  set editing(val: boolean) {
    this.$emit('input', val);
  }

  get dashboards(): Dashboard[] {
    // avoid modifying the store object
    return [...dashboardStore.dashboards].sort(objectSorter('order'));
  }

  set dashboards(dashboards: Dashboard[]) {
    dashboardStore.updateDashboardOrder(dashboards.map(v => v.id));
  }

  startWizard(): void {
    createDialog({
      component: 'WizardDialog',
      initialWizard: 'DashboardWizard',
    });
  }
}
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
          @click="editing = !editing"
        >
          <q-tooltip>
            Rearrange dashboards
          </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>

    <draggable
      v-model="dashboards"
      :disabled="$dense || !editing"
      @start="dragging=true"
      @end="dragging=false"
    >
      <q-item
        v-for="dashboard in dashboards"
        :key="dashboard.id"
        :to="editing ? undefined : `/dashboard/${dashboard.id}`"
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
          {{ dashboard.title }}
        </q-item-section>
      </q-item>
    </draggable>
  </div>
</template>

<style scoped>
.bordered {
  border: 1px solid whitesmoke;
  margin-top: 2px;
}
</style>
