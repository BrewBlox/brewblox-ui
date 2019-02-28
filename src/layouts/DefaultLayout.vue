<script lang="ts">
import ServiceWizardPicker from '@/components/Wizard/ServiceWizardPicker.vue';
import { objectSorter } from '@/helpers/functional';
import {
  removeDashboard,
  updateDashboardOrder,
  updatePrimaryDashboard,
  saveDashboard,
} from '@/store/dashboards/actions';
import {
  dashboardValues,
  primaryDashboardId,
} from '@/store/dashboards/getters';
import { Dashboard } from '@/store/dashboards/state';
import {
  removeService as removeServiceInStore,
  updateServiceOrder,
  saveService,
} from '@/store/services/actions';
import { serviceValues } from '@/store/services/getters';
import { Service } from '@/store/services/state';
import Vue from 'vue';
import Component from 'vue-class-component';
import draggable from 'vuedraggable';

@Component({
  components: {
    draggable,
    ServiceWizardPicker,
  },
})
export default class DefaultLayout extends Vue {
  $q: any;
  leftDrawerOpen: boolean = true;
  dashboardEditing: boolean = false;
  serviceEditing: boolean = false;
  wizardModalOpen: boolean = false;

  get version() {
    return process.env.GIT_VERSION || 'UNKNOWN';
  }

  get dashboards() {
    return [...dashboardValues(this.$store)].sort(objectSorter('order'));
  }

  set dashboards(dashboards: Dashboard[]) {
    updateDashboardOrder(this.$store, dashboards.map(dashboard => dashboard.id));
  }

  get defaultDashboard() {
    return primaryDashboardId(this.$store);
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

  removeDashboard(dashboard: Dashboard) {
    this.$q.dialog({
      title: 'Remove dashboard',
      message: `Are you sure you want to remove ${dashboard.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    }).then(() => removeDashboard(this.$store, dashboard));
  }

  changeDashboardTitle(dashboard: Dashboard, title: string) {
    saveDashboard(this.$store, { ...dashboard, title });
  }

  removeService(service: Service) {
    this.$q.dialog({
      title: 'Remove service',
      message: `Are you sure you want to remove ${service.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    }).then(() => removeServiceInStore(this.$store, service));
  }

  changeServiceTitle(service: Service, title: string) {
    saveService(this.$store, { ...service, title });
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
        <q-item link exact to="/">
          <q-item-side icon="home"/>Main menu
        </q-item>
        <q-item-separator/>
        <q-item @click.native="wizardModalOpen = true">
          <q-item-side icon="add"/>Wizardry
        </q-item>
        <q-item-separator/>
        <!-- dashboards -->
        <q-list-header>
          <q-item-side icon="dashboard"/>Dashboards
          <q-btn
            :disable="dashboards.length === 0"
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
            <q-item-main>
              <InputPopupEdit
                v-if="dashboardEditing"
                :field="dashboard.title"
                :change="v => changeDashboardTitle(dashboard, v)"
                label="Title"
                tag="span"
              />
              <span v-else>{{ dashboard.title }}</span>
            </q-item-main>
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
        <q-item-separator/>
        <!-- services -->
        <q-list-header>
          <q-item-side icon="cloud"/>
          <label>Services</label>
          <q-btn
            :disable="services.length === 0"
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
            <q-item-main>
              <InputPopupEdit
                v-if="serviceEditing"
                :field="service.title"
                :change="v => changeServiceTitle(service, v)"
                label="Title"
                tag="span"
              />
              <span v-else>{{ service.title }}</span>
            </q-item-main>
            <q-item-side v-if="serviceEditing" right>
              <q-btn round flat icon="delete" @click="removeService(service)"/>
            </q-item-side>
          </q-item>
        </draggable>
      </q-list>
      <q-list no-border class="build-info">
        <q-item>
          <small>version: {{ version }}</small>
        </q-item>
      </q-list>
    </q-layout-drawer>
    <q-modal v-model="wizardModalOpen" no-backdrop-dismiss>
      <WizardPicker v-if="wizardModalOpen" @close="wizardModalOpen = false"/>
    </q-modal>
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="stylus">
</style>
