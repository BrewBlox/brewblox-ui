<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import draggable from 'vuedraggable';

import byOrder from '@/helpers/byOrder';

import { Dashboard } from '@/store/dashboards/state';
import { allDashboards, isFetching } from '@/store/dashboards/getters';
import { addNewDashboard, updateDashboardOrder, removeDashboard } from '@/store/dashboards/actions';

import { updateServiceOrder } from '@/store/services/actions';
import { Service } from '@/store/services/state';
import { allServices } from '@/store/services/getters';

/* eslint-disable indent */
@Component({
  components: {
    draggable,
  },
})
/* eslint-enable */
export default class LayoutDefault extends Vue {
  leftDrawerOpen: boolean = false;
  dashboardEditing: boolean = false;
  serviceEditing: boolean = false;
  $q: any;

  get dashboards() {
    return [...allDashboards(this.$store)].sort(byOrder);
  }

  set dashboards(dashboards: Dashboard[]) {
    updateDashboardOrder(this.$store, dashboards.map(dashboard => dashboard.id));
  }

  get services() {
    return [...allServices(this.$store)].sort(byOrder);
  }

  set services(services: Service[]) {
    updateServiceOrder(this.$store, services.map(service => service.id));
  }

  get isFetching() {
    return isFetching(this.$store);
  }

  toggleDrawer() {
    this.leftDrawerOpen = !this.leftDrawerOpen;
  }

  toggleDashboardEditing() {
    this.dashboardEditing = !this.dashboardEditing;
  }

  toggleServiceEditing() {
    this.serviceEditing = !this.serviceEditing;
  }

  createDashboard() {
    this.$q.dialog({
      title: 'Add dashboard',
      message: 'Enter name of the dashboard',
      cancel: true,
      prompt: {
        model: '',
      },
    })
      .then((dashboardName: string) => {
        addNewDashboard(this.$store, dashboardName);
      });
  }

  removeDashboard() {
    this.$q.dialog({
      title: 'Remove dashboard',
      message: 'Select dashboard to remove',
      cancel: true,
      options: {
        type: 'radio',
        model: 'opt2',
        items: allDashboards(this.$store)
          .map(dashboard => ({ label: dashboard.title, value: dashboard })),
      },
    }).then((dashboard: Dashboard) => removeDashboard(this.$store, dashboard));
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        glossy
        color="dark-bright"
      >
        <q-btn
          flat
          dense
          round
          @click="toggleDrawer"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          <portal-target name="toolbar-title">BrewBlox</portal-target>
        </q-toolbar-title>

        <portal-target
          name="toolbar-buttons"
          class="toolbar-buttons"
        />
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >

        <q-item
          link
          to="/"
          active-class="q-item-no-link-highlighting"
        >
          <q-item-side icon="home" />
          Main menu
        </q-item>

        <q-item-separator />

        <q-list-header v-if="!isFetching">
          <q-item-side icon="dashboard" />
          Dashboards

          <q-btn
            round
            flat
            icon="mode edit"
            size="sm"
            v-if="!dashboardEditing"
            @click="toggleDashboardEditing"
          />

          <q-btn
            round
            color="primary"
            icon="check"
            size="sm"
            v-if="dashboardEditing"
            @click="toggleDashboardEditing"
          />
        </q-list-header>

        <q-item v-if="!isFetching && dashboards.length === 0">
          No dashboards yet
        </q-item>

        <draggable
          :class="{ editing: dashboardEditing }"
          :options="{ disabled: !dashboardEditing }"
          v-model="dashboards"
        >
          <q-item
            v-for="dashboard in dashboards"
            :link="!dashboardEditing"
            :key="dashboard.id"
            :to="dashboardEditing ? undefined : `/dashboard/${ dashboard.id }`"
          >
            <q-item-main :label="dashboard.title" />
            <q-item-side
              right
              v-if="dashboardEditing"
            >
              <q-icon name="menu" />
            </q-item-side>
          </q-item>
        </draggable>

        <div class="q-list-container">
          <q-btn
            icon="add"
            label="Add dashboard"
            color="dark-bright"
            v-if="dashboardEditing"
            @click="createDashboard"
          />
          <q-btn
            icon="delete"
            label="Remove dashboard"
            color="error"
            v-if="dashboardEditing"
            @click="removeDashboard"
          />
        </div>

        <q-item-separator />

        <q-list-header v-if="!isFetching">
          <q-item-side icon="cloud" />
          Services

          <q-btn
            round
            flat
            icon="mode edit"
            size="sm"
            v-if="!serviceEditing"
            @click="toggleServiceEditing"
          />

          <q-btn
            round
            color="primary"
            icon="check"
            size="sm"
            v-if="serviceEditing"
            @click="toggleServiceEditing"
          />

        </q-list-header>

        <q-item v-if="!isFetching && services.length === 0">
          No services yet
        </q-item>

        <draggable
          :class="{ editing: serviceEditing }"
          :options="{ disabled: !serviceEditing }"
          v-model="services"
        >
          <q-item
            v-for="service in services"
            :link="!serviceEditing"
            :key="service.id"
            :to="serviceEditing ? undefined : `/service/${service.id}`"
          >
            <q-item-main :label="service.title" />
            <q-item-side
              right
              v-if="serviceEditing"
            >
              <q-icon name="menu" />
            </q-item-side>
          </q-item>
        </draggable>

        <div class="q-list-container">
          <q-btn
            icon="add"
            label="Add service"
            color="dark-bright"
            v-if="serviceEditing"
            @click="createDashboard"
          />
          <q-btn
            icon="delete"
            label="Remove service"
            color="error"
            v-if="serviceEditing"
            @click="removeDashboard"
          />
        </div>

      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<style>
/* not scoped */
.toolbar-buttons .q-btn {
  margin-left: 10px;
}

.q-list-container {
  padding: 16px;
}

.q-list-header {
  display: flex;
  align-items: center;
}

.q-list-header .q-btn {
  margin-left: auto;
  margin-right: 8px;
}

.q-list .editing .q-item {
  cursor: move;
}
</style>
