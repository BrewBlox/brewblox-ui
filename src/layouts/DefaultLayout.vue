<script lang="ts">
import { Dialog } from 'quasar';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import draggable from 'vuedraggable';

import buildEnv from '@/build-env.json';
import ServiceWizardPicker from '@/components/Wizard/ServiceWizardPicker.vue';
import { startChangeDashboardId, startChangeDashboardTitle, startRemoveDashboard } from '@/helpers/dashboards';
import { objectSorter } from '@/helpers/functional';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { Service, serviceStore } from '@/store/services';

@Component({
  components: {
    draggable,
    ServiceWizardPicker,
  },
})
export default class DefaultLayout extends Vue {
  leftDrawerOpen: boolean = true;
  dashboardEditing: boolean = false;
  serviceEditing: boolean = false;
  wizardModalOpen: boolean = false;
  wizardComponent: string | null = null;

  get version() {
    return buildEnv.version || 'UNKNOWN';
  }

  get dashboards() {
    return dashboardStore.dashboardValues.sort(objectSorter('order'));
  }

  set dashboards(dashboards: Dashboard[]) {
    dashboardStore.updateDashboardOrder(dashboards.map(dashboard => dashboard.id));
  }

  get defaultDashboard() {
    return dashboardStore.primaryDashboardId;
  }

  get services() {
    return serviceStore.serviceValues.sort(objectSorter('order'));
  }

  set services(services: Service[]) {
    serviceStore.updateServiceOrder(services.map(service => service.id));
  }

  onIdChanged(oldId, newId) {
    if (newId && this.$route.path === `/dashboard/${oldId}`) {
      this.$router.replace(`/dashboard/${newId}`);
    }
  }

  async changeDashboardId(dashboard: Dashboard) {
    const oldId = dashboard.id;
    await startChangeDashboardId(dashboard, newId => this.onIdChanged(oldId, newId));
  }

  changeDashboardTitle(dashboard: Dashboard) {
    const oldId = dashboard.id;
    startChangeDashboardTitle(dashboard, newId => this.onIdChanged(oldId, newId));
  }

  removeDashboard(dashboard: Dashboard) {
    startRemoveDashboard(dashboard);
  }

  removeService(service: Service) {
    Dialog.create({
      title: 'Remove service',
      message: `Are you sure you want to remove ${service.title}?`,
      dark: true,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => serviceStore.removeService(service));
  }

  changeServiceTitle(service: Service) {
    Dialog.create({
      title: 'Change service Title',
      message: "Change your service's display name",
      dark: true,
      cancel: true,
      prompt: {
        model: service.title,
        type: 'text',
      },
    })
      .onOk(async newTitle => {
        const oldTitle = service.title;
        if (!newTitle || oldTitle === newTitle) {
          return;
        }

        await serviceStore.saveService({ ...service, title: newTitle });
        this.$q.notify({
          color: 'positive',
          icon: 'edit',
          message: `Renamed service '${oldTitle}' to '${newTitle}'`,
        });
      });
  }

  toggleDefaultDashboard(dashboard: Dashboard) {
    dashboardStore.updatePrimaryDashboard(dashboard.primary ? null : dashboard.id);
  }

  openWizard(component: string | null = null) {
    this.wizardComponent = component;
    this.wizardModalOpen = true;
  }

  stopEditing() {
    this.dashboardEditing = false;
    this.serviceEditing = false;
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="glossy bg-dark">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen">
          <q-icon name="menu" />
        </q-btn>
        <q-toolbar-title>
          <portal-target name="toolbar-title">BrewBlox</portal-target>
        </q-toolbar-title>
        <portal-target name="toolbar-buttons" class="toolbar-buttons" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" content-class="bg-dark" elevated>
      <q-list dark>
        <q-item exact to="/">
          <q-item-section avatar>
            <q-icon name="mdi-home" />
          </q-item-section>
          <q-item-section>BrewBlox</q-item-section>
        </q-item>

        <q-separator dark />

        <q-item clickable @click.native="openWizard(null)">
          <q-item-section avatar>
            <q-icon name="mdi-creation" />
          </q-item-section>
          <q-item-section>Wizardry</q-item-section>
        </q-item>

        <q-separator dark />

        <q-item dark class="q-pb-none">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboards</q-item-section>
          <q-item-section v-if="dashboardEditing" side>
            <q-btn
              icon="add"
              outline
              color="white"
              round
              size="sm"
              @click="openWizard('DashboardWizard')"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn
              :disable="dashboards.length === 0"
              :flat="!dashboardEditing"
              :icon="dashboardEditing ? 'check' : 'edit'"
              :color="dashboardEditing ? 'primary': ''"
              round
              size="sm"
              @click="dashboardEditing = !dashboardEditing"
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
            :to="dashboardEditing ? undefined : `/dashboard/${dashboard.id}`"
            dark
            style="min-height: 0px"
            class="q-pb-sm"
          >
            <q-item-section v-if="dashboardEditing" avatar>
              <q-icon name="mdi-drag-vertical" />
            </q-item-section>
            <q-item-section>{{ dashboard.title }}</q-item-section>
            <q-item-section v-if="dashboardEditing" side>
              <q-btn-dropdown outline icon="edit" size="sm">
                <q-list dark>
                  <q-item dark link clickable @click="toggleDefaultDashboard(dashboard)">
                    <q-item-section avatar>
                      <q-icon :color="dashboard.primary ? 'primary' : ''" name="home" />
                    </q-item-section>
                    <q-item-section>Toggle default dashboard</q-item-section>
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
                    label="Delete dashboard"
                    @click="removeDashboard(dashboard)"
                  />
                </q-list>
              </q-btn-dropdown>
            </q-item-section>
          </q-item>
        </draggable>

        <q-separator dark />

        <q-item dark class="q-pb-none">
          <q-item-section avatar>
            <q-icon name="cloud" />
          </q-item-section>
          <q-item-section>
            <q-item-section>Services</q-item-section>
          </q-item-section>
          <q-item-section v-if="serviceEditing" side>
            <q-btn
              icon="add"
              outline
              color="white"
              round
              size="sm"
              @click="openWizard('ServiceWizardPicker')"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn
              :disable="services.length === 0"
              :flat="!serviceEditing"
              :icon="serviceEditing ? 'check' : 'edit'"
              :color="serviceEditing ? 'primary': ''"
              round
              size="sm"
              @click="serviceEditing = !serviceEditing"
            />
          </q-item-section>
        </q-item>

        <draggable
          v-model="services"
          :class="{ editing: serviceEditing }"
          :disabled="!serviceEditing"
        >
          <q-item
            v-for="service in services"
            :key="service.id"
            :to="serviceEditing ? undefined : `/service/${service.id}`"
            dark
            style="min-height: 0px"
            class="q-pb-sm"
          >
            <q-item-section v-if="serviceEditing" avatar>
              <q-icon name="mdi-drag-vertical" />
            </q-item-section>
            <q-item-section>{{ service.title }}</q-item-section>
            <q-item-section v-if="serviceEditing" side>
              <q-btn-dropdown outline icon="edit" size="sm">
                <q-list dark>
                  <ActionItem
                    icon="edit"
                    label="Change service title"
                    @click="changeServiceTitle(service)"
                  />
                  <ActionItem icon="delete" label="Delete service" @click="removeService(service)" />
                </q-list>
              </q-btn-dropdown>
            </q-item-section>
          </q-item>
        </draggable>
      </q-list>

      <q-btn-dropdown text-color="white" icon="mdi-bug-outline" class="bottomed">
        <q-list dark bordered>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>Version</q-item-label>
              {{ version }}
            </q-item-section>
          </q-item>
          <ExportErrorsAction />
        </q-list>
      </q-btn-dropdown>
    </q-drawer>

    <q-dialog v-model="wizardModalOpen" no-backdrop-dismiss>
      <WizardPicker
        v-if="wizardModalOpen"
        :initial-component="wizardComponent"
        @close="wizardModalOpen = false"
      />
    </q-dialog>

    <ServiceWatchers />

    <q-page-container @click.native="stopEditing">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="stylus" scoped>
@import '../styles/quasar.variables.styl';
@import '../styles/quasar.styl';

.editing {
  cursor: move;
}

.bottomed {
  bottom: 0;
  position: absolute;
}
</style>
