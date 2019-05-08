<script lang="ts">
import UrlSafeString from 'url-safe-string';
import ServiceWizardPicker from '@/components/Wizard/ServiceWizardPicker.vue';
import { objectSorter } from '@/helpers/functional';
import dashboardStore from '@/store/dashboards';
import serviceStore from '@/store/services';
import { Dashboard } from '@/store/dashboards/state';
import { Service } from '@/store/services/state';
import Vue from 'vue';
import Component from 'vue-class-component';
import draggable from 'vuedraggable';
import buildEnv from '@/build-env.json';

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
  wizardComponent: string | null = null;

  get version() {
    return buildEnv.version || 'UNKNOWN';
  }

  get dashboards() {
    return [...dashboardStore.dashboardValues].sort(objectSorter('order'));
  }

  set dashboards(dashboards: Dashboard[]) {
    dashboardStore.updateDashboardOrder(dashboards.map(dashboard => dashboard.id));
  }

  get defaultDashboard() {
    return dashboardStore.primaryDashboardId;
  }

  get services() {
    return [...serviceStore.serviceValues].sort(objectSorter('order'));
  }

  set services(services: Service[]) {
    serviceStore.updateServiceOrder(services.map(service => service.id));
  }

  removeDashboard(dashboard: Dashboard) {
    this.$q.dialog({
      title: 'Remove dashboard',
      message: `Are you sure you want to remove ${dashboard.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => dashboardStore.removeDashboard(dashboard));
  }

  changeDashboardId(dashboard: Dashboard) {
    this.$q.dialog({
      title: 'Change dashboard ID',
      message: "This will change your dashboard's unique ID",
      cancel: true,
      prompt: {
        model: dashboard.id,
        type: 'text',
      },
    })
      .onOk(async newId => {
        const oldId = dashboard.id;
        if (!newId || newId === oldId) {
          return;
        }

        if (dashboardStore.dashboardIds.includes(newId)) {
          this.$q.notify({
            color: 'negative',
            icon: 'error',
            message: `Dashboard ${newId} already exists`,
          });
          return;
        }

        this.doChangeDashboardId(oldId, newId);
      });
  }

  async doChangeDashboardId(oldId: string, newId: string) {
    const dashboard = dashboardStore.dashboardById(oldId);

    await dashboardStore.createDashboard({ ...dashboard, id: newId });
    await Promise.all(
      dashboardStore.itemValues
        .filter(item => item.dashboard === oldId)
        .map(item => dashboardStore.saveDashboardItem({ ...item, dashboard: newId }))
    );
    await dashboardStore.removeDashboard({ ...dashboard });

    if (this.defaultDashboard === oldId) {
      await dashboardStore.updatePrimaryDashboard(newId);
    }

    if (this.$route.path === `/dashboard/${oldId}`) {
      this.$router.replace(`/dashboard/${newId}`);
    }

    this.$q.notify({
      color: 'positive',
      icon: 'edit',
      message: `Changed dashboard ID '${oldId}' to '${newId}'`,
    });
  }

  findIdSuggestion(id: string, oldId: string): null | string {
    if (id === oldId) {
      return null;
    }
    const existingIds = dashboardStore.dashboardIds;
    if (!existingIds.includes(id)) {
      return id;
    }

    const copyName = (i: number): string =>
      (id.match(/-\d+$/)
        ? id.replace(/-\d+$/, `-${i}`)
        : `${id}-${i}`);

    let idx = 2;
    while (existingIds.includes(copyName(idx))) {
      idx += 1;
    }

    return copyName(idx);
  }

  changeDashboardTitle(dashboard: Dashboard) {
    this.$q.dialog({
      title: 'Change dashboard Title',
      message: "Change your dashboard's display name",
      cancel: true,
      prompt: {
        model: dashboard.title,
        type: 'text',
      },
    })
      .onOk(async newTitle => {
        const oldId = dashboard.id;
        const oldTitle = dashboard.title;
        if (!newTitle || oldTitle === newTitle) {
          return;
        }

        await dashboardStore.saveDashboard({ ...dashboard, title: newTitle });
        this.$q.notify({
          color: 'positive',
          icon: 'edit',
          message: `Renamed dashboard '${oldTitle}' to '${newTitle}'`,
        });

        const defaultId = new UrlSafeString().generate(newTitle);
        const suggestedId = this.findIdSuggestion(defaultId, oldId);
        if (!suggestedId) {
          return; // no change
        }

        this.$q.dialog({
          title: 'Update dashboard URL',
          message: `Do you want to change the dashboard ID from '${oldId}' to '${suggestedId}'?`,
          cancel: true,
        })
          .onOk(() => this.doChangeDashboardId(oldId, suggestedId));
      });
  }

  removeService(service: Service) {
    this.$q.dialog({
      title: 'Remove service',
      message: `Are you sure you want to remove ${service.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => serviceStore.removeService(service));
  }

  changeServiceTitle(service: Service) {
    this.$q.dialog({
      title: 'Change service Title',
      message: "Change your service's display name",
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

  updateDefaultDashboard(id: string) {
    dashboardStore.updatePrimaryDashboard(this.defaultDashboard === id ? null : id);
  }

  openWizard(component: string | null = null) {
    this.wizardComponent = component;
    this.wizardModalOpen = true;
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="glossy bg-dark">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen">
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
          <q-item-section>BrewBlox</q-item-section>
        </q-item>

        <q-separator dark/>

        <q-item clickable @click.native="openWizard(null)">
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
              <q-icon name="mdi-drag-vertical"/>
            </q-item-section>
            <q-item-section>{{ dashboard.title }}</q-item-section>
            <q-item-section v-if="dashboardEditing" side>
              <q-btn-dropdown outline icon="edit" size="sm">
                <q-list dark>
                  <q-item dark link clickable @click="updateDefaultDashboard(dashboard.id)">
                    <q-item-section avatar>
                      <q-icon
                        :color="defaultDashboard === dashboard.id ? 'primary' : ''"
                        name="home"
                      />
                    </q-item-section>
                    <q-item-section>Default dashboard</q-item-section>
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

        <q-separator dark/>

        <q-item dark class="q-pb-none">
          <q-item-section avatar>
            <q-icon name="cloud"/>
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
              <q-icon name="mdi-drag-vertical"/>
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
                  <ActionItem icon="delete" label="Delete service" @click="removeService(service)"/>
                </q-list>
              </q-btn-dropdown>
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
      <WizardPicker
        v-if="wizardModalOpen"
        :initial-component="wizardComponent"
        @close="wizardModalOpen = false"
      />
    </q-dialog>

    <ServiceWatchers/>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<style lang="stylus" scoped>
@import '../styles/quasar.variables.styl';
@import '../styles/quasar.styl';

.editing {
  cursor: move;
}

.build-info {
  bottom: 0;
  position: absolute;
}
</style>
