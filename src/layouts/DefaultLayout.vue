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
    }).onOk(() => removeDashboard(this.$store, dashboard));
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
    }).onOk(() => removeServiceInStore(this.$store, service));
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
    <q-header class="glossy bg-dark">
      <q-toolbar>
        <q-btn flat dense round @click="toggleDrawer">
          <q-icon name="menu"/>
        </q-btn>
        <q-toolbar-title>
          <portal-target name="toolbar-title">BrewBlox</portal-target>
        </q-toolbar-title>
        <portal-target name="toolbar-buttons" class="toolbar-buttons"/>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" content-class="bg-dark" elevated>
      <q-list dark>
        <q-item exact to="/">
          <q-item-section avatar>
            <q-icon name="mdi-home"/>
          </q-item-section>
          <q-item-section>Main menu</q-item-section>
        </q-item>

        <q-separator dark/>

        <q-item clickable @click.native="wizardModalOpen = true">
          <q-item-section avatar>
            <q-icon name="mdi-creation"/>
          </q-item-section>
          <q-item-section>Wizardry</q-item-section>
        </q-item>

        <q-separator dark/>

        <q-item dark class="q-pb-none">
          <q-item-section avatar>
            <q-icon name="dashboard"/>
          </q-item-section>
          <q-item-section>Dashboards</q-item-section>
          <q-item-section side>
            <q-btn
              :disable="dashboards.length === 0"
              :flat="!dashboardEditing"
              :icon="dashboardEditing ? 'check' : 'edit'"
              :color="dashboardEditing ? 'primary': ''"
              round
              size="sm"
              @click="toggleDashboardEditing"
            />
          </q-item-section>
        </q-item>

        <draggable
          v-model="dashboards"
          :class="{ editing: dashboardEditing }"
          :disabled="!dashboardEditing"
        >
          <q-item
            v-for="dashboard in dashboards"
            :key="dashboard.id"
            :link="!dashboardEditing"
            :to="dashboardEditing ? undefined : `/dashboard/${dashboard.id}`"
            dark
            style="min-height: 0px"
            class="q-pb-sm"
          >
            <q-item-section v-if="dashboardEditing" side>
              <q-icon name="mdi-drag-vertical"/>
            </q-item-section>
            <q-item-section v-if="dashboardEditing">
              <InputPopupEdit
                :field="dashboard.title"
                :change="v => changeDashboardTitle(dashboard, v)"
                label="Title"
                tag="span"
              />
            </q-item-section>
            <q-item-section v-else>{{ dashboard.title }}</q-item-section>
            <q-item-section v-if="dashboardEditing" side>
              <div class="row">
                <q-btn
                  :color="defaultDashboard === dashboard.id ? 'primary' : ''"
                  round
                  flat
                  icon="home"
                  @click="updateDefaultDashboard(dashboard.id)"
                />
                <q-btn round flat icon="delete" @click="removeDashboard(dashboard)"/>
              </div>
            </q-item-section>
          </q-item>
        </draggable>

        <q-separator dark/>

        <q-item dark class="q-pb-none">
          <q-item-section avatar>
            <q-icon name="cloud"/>
          </q-item-section>
          <q-item-section>
            <q-item-section>Services</q-item-section>
          </q-item-section>
          <q-item-section side>
            <q-btn
              :disable="services.length === 0"
              :flat="!serviceEditing"
              :icon="serviceEditing ? 'check' : 'edit'"
              :color="serviceEditing ? 'primary': ''"
              round
              size="sm"
              @click="toggleServiceEditing"
            />
          </q-item-section>
        </q-item>

        <draggable
          v-model="services"
          :class="{ editing: serviceEditing }"
          :disabled="!serviceEditing"
          :striped="serviceEditing"
        >
          <q-item
            v-for="service in services"
            :key="service.id"
            :link="!serviceEditing"
            :to="serviceEditing ? undefined : `/service/${service.id}`"
            dark
            style="min-height: 0px"
            class="q-pb-sm"
          >
            <q-item-section v-if="serviceEditing" side>
              <q-icon name="mdi-drag-vertical"/>
            </q-item-section>
            <q-item-section v-if="serviceEditing">
              <InputPopupEdit
                :field="service.title"
                :change="v => changeServiceTitle(service, v)"
                label="Title"
                tag="span"
              />
            </q-item-section>
            <q-item-section v-else>{{ service.title }}</q-item-section>
            <q-item-section v-if="serviceEditing" side>
              <q-btn round flat icon="delete" @click="removeService(service)"/>
            </q-item-section>
          </q-item>
        </draggable>
      </q-list>

      <q-list no-border class="build-info">
        <q-item dark>
          <small>version: {{ version }}</small>
        </q-item>
      </q-list>
    </q-drawer>

    <q-dialog v-model="wizardModalOpen" no-backdrop-dismiss>
      <WizardPicker v-if="wizardModalOpen" @close="wizardModalOpen = false"/>
    </q-dialog>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>
