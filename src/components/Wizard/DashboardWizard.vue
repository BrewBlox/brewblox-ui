<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { createDashboard } from '@/store/dashboards/actions';


@Component
export default class DashboardWizard extends Vue {
  dashboardName: string = '';

  createDashboard() {
    createDashboard(this.$store, this.dashboardName);
  }
}
</script>

<template>
  <div>
    <q-toolbar class="unpadded">
      <q-toolbar-title>Create new dashboard</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-card dark>
      <q-card-main>
        <q-field icon="edit">
          <q-input v-model="dashboardName" float-label="Dashboard Name" clearable/>
        </q-field>
      </q-card-main>
      <q-card-actions align="end">
        <q-btn :disable="!dashboardName" color="primary" label="create" @click="createDashboard"/>
      </q-card-actions>
    </q-card>
  </div>
</template>
