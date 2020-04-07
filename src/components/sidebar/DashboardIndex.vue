<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { startChangeDashboardId, startChangeDashboardTitle, startRemoveDashboard } from '@/helpers/dashboards';
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
    return [...dashboardStore.dashboards].sort(objectSorter('order'));
  }

  set dashboards(dashboards: Dashboard[]) {
    dashboardStore.updateDashboardOrder(dashboards.map(dashboard => dashboard.id));
  }

  toggleDefaultDashboard(dashboard: Dashboard): void {
    dashboardStore.updatePrimaryDashboard(dashboard.primary ? null : dashboard.id);
  }

  startWizard(): void {
    createDialog({
      parent: this,
      component: 'WizardDialog',
      initialWizard: 'DashboardWizard',
    });
  }

  onIdChanged(oldId: string, newId: string): void {
    if (newId && this.$route.path === `/dashboard/${oldId}`) {
      this.$router.replace(`/dashboard/${newId}`);
    }
  }

  changeDashboardId(dashboard: Dashboard): void {
    const oldId = dashboard.id;
    startChangeDashboardId(dashboard, newId => this.onIdChanged(oldId, newId));
  }

  changeDashboardTitle(dashboard: Dashboard): void {
    const oldId = dashboard.id;
    startChangeDashboardTitle(dashboard, newId => this.onIdChanged(oldId, newId));
  }

  removeDashboard(dashboard: Dashboard): void {
    startRemoveDashboard(dashboard);
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
          :icon="editing ? 'mdi-pencil-off' : 'mdi-pencil'"
          round
          flat
          size="sm"
          @click="editing = !editing"
        >
          <q-tooltip>
            {{ editing ? 'Stop editing' : 'Edit dashboards' }}
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
        :class="{hoverable: editing && !dragging, bordered: editing, 'q-pb-sm': true}"
        style="min-height: 0px"
      >
        <q-item-section :class="{'text-italic': editing, ellipsis: true}">
          {{ dashboard.title }}
        </q-item-section>
        <template v-if="editing">
          <q-item-section avatar>
            <q-icon name="mdi-dots-vertical" />
          </q-item-section>
          <q-menu :offset="[-50, 0]">
            <q-list bordered>
              <q-item
                clickable
                @click="toggleDefaultDashboard(dashboard)"
              >
                <q-item-section avatar>
                  <q-icon
                    :color="dashboard.primary ? 'primary' : ''"
                    name="home"
                  />
                </q-item-section>
                <q-item-section>
                  {{ dashboard.primary ? 'Is home page' : 'Make home page' }}
                </q-item-section>
              </q-item>
              <ActionItem
                icon="edit"
                label="Change dashboard ID"
                @click="changeDashboardId(dashboard)"
              />
              <ActionItem
                icon="edit"
                label="Change dashboard Title"
                @click="changeDashboardTitle(dashboard)"
              />
              <ActionItem
                icon="delete"
                label="Remove dashboard"
                @click="removeDashboard(dashboard)"
              />
            </q-list>
          </q-menu>
        </template>
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
