<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { createDashboard } from '@/store/dashboards/actions';
import { dashboardIds } from '@/store/dashboards/getters';
import isString from 'lodash/isString';
import { Dashboard } from '@/store/dashboards/state';

@Component
export default class DashboardWizard extends Vue {
  $q: any;
  dashboardId: string = '';
  dashboardTitle: string = '';

  get dashboardIdRules(): InputRule[] {
    return [
      v => !!v || 'ID is required',
      v => !dashboardIds(this.$store).includes(v) || 'ID must be unique',
    ];
  }

  back() {
    this.$emit('back');
  }

  async create() {
    const errors = this.dashboardIdRules
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
      order: dashboardIds(this.$store).length + 1,
    };

    await createDashboard(this.$store, dashboard);
    this.$q.notify({
      icon: 'mdi-check-all',
      color: 'positive',
      message: `Added dashboard ${dashboard.title}`,
    });
    this.$emit('close');
  }

  mounted() {
    this.$emit('title', 'Dashboard wizard');
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input
            v-model="dashboardId"
            :rules="dashboardIdRules"
            label="Dashboard ID"
            dark
            lazy-rules
          >
            <template v-slot:after>
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
            <template v-slot:after>
              <q-icon name="information">
                <q-tooltip>
                  The Dashboard Title is how the dashboard is displayed in the UI.
                  <br>This choice is purely graphical: pick a name that makes sense to you.
                  <br>If left empty, the dashboard ID will be used.
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions>
      <q-btn unelevated label="Back" class="full-width" @click="back"/>
      <q-btn unelevated label="Create" color="primary" class="full-width q-mt-sm" @click="create"/>
    </q-card-actions>
  </div>
</template>
