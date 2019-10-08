<script lang="ts">
import isString from 'lodash/isString';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { dashboardIdRules } from '@/helpers/dashboards';
import { Dashboard, dashboardStore } from '@/store/dashboards';

@Component
export default class DashboardWizard extends Vue {
  dashboardId = '';
  dashboardTitle = '';

  get idRules(): InputRule[] {
    return dashboardIdRules();
  }

  back(): void {
    this.$emit('back');
  }

  async createDashboard(): Promise<void> {
    const errors = this.idRules
      .map(rule => rule(this.dashboardId))
      .filter(isString);

    if (errors.length > 0) {
      this.$q.notify({
        message: errors.join(', '),
        color: 'negative',
        icon: 'error',
      });
      return;
    }

    const dashboard: Dashboard = {
      id: this.dashboardId,
      title: this.dashboardTitle || this.dashboardId,
      order: dashboardStore.dashboardIds.length + 1,
    };

    await dashboardStore.createDashboard(dashboard);
    this.$q.notify({
      icon: 'mdi-check-all',
      color: 'positive',
      message: `Added dashboard ${dashboard.title}`,
    });
    this.$emit('close');
  }

  mounted(): void {
    this.$emit('title', 'Dashboard wizard');
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="dashboardId" :rules="idRules" label="Dashboard ID" dark lazy-rules>
            <template #after>
              <q-icon name="information">
                <q-tooltip>The unique identifier for this dashboard.</q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-input v-model="dashboardTitle" label="Dashboard Title" dark>
            <template #after>
              <q-icon name="information">
                <q-tooltip>
                  The Dashboard Title is how the dashboard is displayed in the UI.
                  <br />This choice is purely graphical: pick a name that makes sense to you.
                  <br />If left empty, the dashboard ID will be used.
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark />

    <q-card-actions>
      <q-btn unelevated label="Back" class="full-width" @click="back" />
      <q-btn unelevated label="Create" color="primary" class="full-width q-mt-sm" @click="createDashboard" />
    </q-card-actions>
  </div>
</template>
