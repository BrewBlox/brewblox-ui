<script lang="ts">
import NewServiceWizard from '@/components/Wizard/NewServiceWizard.vue';
import { objectSorter } from '@/helpers/functional';
import {
  createDashboard,
  removeDashboard,
  updateDashboardOrder,
  updatePrimaryDashboard,
} from '@/store/dashboards/actions';
import {
  allDashboards,
  primaryDashboard,
} from '@/store/dashboards/getters';
import { Dashboard } from '@/store/dashboards/state';
import {
  removeService as removeServiceInStore,
  updateServiceOrder,
} from '@/store/services/actions';
import { serviceValues } from '@/store/services/getters';
import { Service } from '@/store/services/state';
import Vue from 'vue';
import Component from 'vue-class-component';
import draggable from 'vuedraggable';

@Component({
  components: {
    draggable,
    NewServiceWizard,
  },
})
export default class DefaultLayout extends Vue {
  leftDrawerOpen: boolean = false;
  dashboardEditing: boolean = false;
  serviceEditing: boolean = false;
  wizardModalOpen: boolean = false;
  $q: any;

  get version() {
    return process.env.GIT_VERSION || 'UNKNOWN';
  }

  get dashboards() {
    return [...allDashboards(this.$store)].sort(objectSorter('order'));
  }

  get defaultDashboard() {
    return primaryDashboard(this.$store);
  }

  set dashboards(dashboards: Dashboard[]) {
    updateDashboardOrder(this.$store, dashboards.map(dashboard => dashboard.id));
  }

  get services() {
    return [...serviceValues(this.$store)].sort(objectSorter('order'));
  }

  set services(services: Service[]) {
    updateServiceOrder(this.$store, services.map(service => service.id));
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
    }).then((name: string) => createDashboard(this.$store, name));
  }

  removeDashboard(dashboard: Dashboard) {
    this.$q.dialog({
      title: 'Remove dashboard',
      message: `Are you sure you want to remove ${dashboard.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    }).then(() => removeDashboard(this.$store, dashboard));
  }

  createService() {
    this.wizardModalOpen = true;
  }

  removeService(service: Service) {
    this.$q.dialog({
      title: 'Remove service',
      message: `Are you sure you want to remove ${service.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    }).then(() => removeServiceInStore(this.$store, service));
  }

  updateDefaultDashboard(id: string) {
    updatePrimaryDashboard(this.$store, this.defaultDashboard === id ? null : id);
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar glossy color="dark-bright">
        <q-btn flat dense round @click="toggleDrawer">
          <q-icon name="menu"/>
        </q-btn>
        <q-toolbar-title>
          <portal-target name="toolbar-title">BrewBlox</portal-target>
        </q-toolbar-title>
        <portal-target name="toolbar-buttons" class="toolbar-buttons"/>
      </q-toolbar>
    </q-layout-header>
    <q-layout-drawer v-model="leftDrawerOpen">
      <q-list no-border link inset-delimiter>
        <q-item link to="/" active-class="q-item-no-link-highlighting">
          <q-item-side icon="home"/>Main menu
        </q-item>
        <q-item-separator/>
        <!-- dashboards -->
        <q-list-header>
          <q-item-side icon="dashboard"/>Dashboards
          <q-btn
            v-if="dashboards.length > 0"
            :flat="!dashboardEditing"
            :icon="dashboardEditing ? 'check' : 'mode edit'"
            :color="dashboardEditing ? 'primary': ''"
            round
            size="sm"
            @click="toggleDashboardEditing"
          />
        </q-list-header>
        <draggable
          :class="{ editing: dashboardEditing }"
          :options="{ disabled: !dashboardEditing }"
          v-model="dashboards"
        >
          <q-item
            v-for="dashboard in dashboards"
            :link="!dashboardEditing"
            :key="dashboard.id"
            :to="dashboardEditing ? undefined : `/dashboard/${dashboard.id}`"
            dark
          >
            <q-item-side v-if="dashboardEditing" icon="drag_indicator"/>
            <q-item-main :label="dashboard.title"/>
            <q-item-side v-if="dashboardEditing" right>
              <q-btn
                :color="defaultDashboard === dashboard.id ? 'primary' : ''"
                round
                flat
                icon="home"
                @click="updateDefaultDashboard(dashboard.id)"
              />
            </q-item-side>
            <q-item-side v-if="dashboardEditing" right>
              <q-btn round flat icon="delete" @click="removeDashboard(dashboard)"/>
            </q-item-side>
          </q-item>
        </draggable>
        <div class="q-list-container">
          <q-btn
            v-if="dashboardEditing || dashboards.length === 0"
            icon="add"
            label="Add dashboard"
            color="dark-bright"
            @click="createDashboard"
          />
        </div>
        <q-item-separator/>
        <!-- services -->
        <q-list-header>
          <q-item-side icon="cloud"/>Services
          <q-btn
            v-if="services.length > 0"
            :flat="!serviceEditing"
            :icon="serviceEditing ? 'check' : 'mode edit'"
            :color="serviceEditing ? 'primary': ''"
            round
            size="sm"
            @click="toggleServiceEditing"
          />
        </q-list-header>
        <draggable
          :class="{ editing: serviceEditing }"
          :options="{ disabled: !serviceEditing }"
          :striped="serviceEditing"
          v-model="services"
        >
          <q-item
            v-for="service in services"
            :link="!serviceEditing"
            :key="service.id"
            :to="serviceEditing ? undefined : `/service/${service.id}`"
            dark
          >
            <q-item-side v-if="serviceEditing" icon="drag_indicator"/>
            <q-item-main :label="service.title"/>
            <q-item-side v-if="serviceEditing" right>
              <q-btn round flat icon="delete" @click="removeService(service)"/>
            </q-item-side>
          </q-item>
        </draggable>
        <div class="q-list-container">
          <q-btn
            v-if="serviceEditing || services.length === 0"
            icon="add"
            label="Add service"
            color="dark-bright"
            @click="createService"
          />
        </div>
      </q-list>
      <q-list no-border class="build-info">
        <q-item>
          <small>version: {{ version }}</small>
        </q-item>
      </q-list>
    </q-layout-drawer>
    <q-modal v-model="wizardModalOpen">
      <new-service-wizard v-if="wizardModalOpen"/>
    </q-modal>
    <q-page-container>
      <router-view/>
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

.widget-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.widget-modal {
  width: 800px;
  max-width: 100vw;
  padding: 10px;
  display: flex;
}

.widget-body {
  flex: 1 0;
  overflow: auto;
  flex-wrap: nowrap;
  justify-content: space-around;
}

.centered {
  margin: auto;
}

.editable {
  border-bottom: 1px solid gray;
  cursor: pointer;
  margin-bottom: 1px;
}

.darkened {
  color: grey;
}

.unpadded {
  padding: 0px;
}

.title-bar {
  padding: 5px 10px;
  width: 100%;
}

.q-card-main {
  padding: 10px;
}

.build-info {
  bottom: 0;
  position: absolute;
}

.inline-popup {
  display: inline-block;
  margin: 0px 10px;
}
</style>
