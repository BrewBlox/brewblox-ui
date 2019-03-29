<script lang="ts">
import ServiceWizardPicker from '@/components/Wizard/ServiceWizardPicker.vue';
import { objectSorter } from '@/helpers/functional';
import {
  removeDashboard,
  updateDashboardOrder,
  updatePrimaryDashboard,
  saveDashboard,
  createDashboard,
  saveDashboardItem,
} from '@/store/dashboards/actions';
import {
  dashboardValues,
  primaryDashboardId,
  dashboardIds,
  dashboardItemValues,
} from '@/store/dashboards/getters';
import { Dashboard } from '@/store/dashboards/state';
import {
  removeService,
  updateServiceOrder,
  saveService,
} from '@/store/services/actions';
import { serviceValues } from '@/store/services/getters';
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

  get version() {
    return buildEnv.version || 'UNKNOWN';
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

  removeDashboard(dashboard: Dashboard) {
    this.$q.dialog({
      title: 'Remove dashboard',
      message: `Are you sure you want to remove ${dashboard.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => removeDashboard(this.$store, dashboard));
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

        if (dashboardIds(this.$store).includes(newId)) {
          this.$q.notify({
            color: 'negative',
            icon: 'error',
            message: `Dashboard ${newId} already exists`,
          });
          return;
        }

        await createDashboard(this.$store, { ...dashboard, id: newId });
        await Promise.all(
          dashboardItemValues(this.$store)
            .filter(item => item.dashboard === oldId)
            .map(item => saveDashboardItem(this.$store, { ...item, dashboard: newId }))
        );
        await removeDashboard(this.$store, { ...dashboard });

        if (this.defaultDashboard === oldId) {
          await updatePrimaryDashboard(this.$store, newId);
        }

        if (this.$route.path === `/dashboard/${oldId}`) {
          this.$router.replace(`/dashboard/${newId}`);
        }

        this.$q.notify({
          color: 'positive',
          icon: 'edit',
          message: `Changed dashboard ID '${oldId}' to '${newId}'`,
        });
      });
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
        const oldTitle = dashboard.title;
        if (!newTitle || oldTitle === newTitle) {
          return;
        }

        await saveDashboard(this.$store, { ...dashboard, title: newTitle });
        this.$q.notify({
          color: 'positive',
          icon: 'edit',
          message: `Renamed dashboard '${oldTitle}' to '${newTitle}'`,
        });
      });
  }

  removeService(service: Service) {
    this.$q.dialog({
      title: 'Remove service',
      message: `Are you sure you want to remove ${service.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => removeService(this.$store, service));
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

        await saveService(this.$store, { ...service, title: newTitle });
        this.$q.notify({
          color: 'positive',
          icon: 'edit',
          message: `Renamed service '${oldTitle}' to '${newTitle}'`,
        });
      });
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
                  <q-item dark link clickable @click="changeDashboardId(dashboard)">
                    <q-item-section avatar>
                      <q-icon name="edit"/>
                    </q-item-section>
                    <q-item-section>Change dashboard ID</q-item-section>
                  </q-item>
                  <q-item dark link clickable @click="changeDashboardTitle(dashboard)">
                    <q-item-section avatar>
                      <q-icon name="edit"/>
                    </q-item-section>
                    <q-item-section>Change dashboard title</q-item-section>
                  </q-item>
                  <q-item dark link clickable @click="removeDashboard(dashboard)">
                    <q-item-section avatar>
                      <q-icon name="delete"/>
                    </q-item-section>
                    <q-item-section>Delete dashboard</q-item-section>
                  </q-item>
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
                  <q-item dark link clickable @click="changeServiceTitle(service)">
                    <q-item-section avatar>
                      <q-icon name="edit"/>
                    </q-item-section>
                    <q-item-section>Change service title</q-item-section>
                  </q-item>
                  <q-item dark link clickable @click="removeService(service)">
                    <q-item-section avatar>
                      <q-icon name="delete"/>
                    </q-item-section>
                    <q-item-section>Delete service</q-item-section>
                  </q-item>
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
      <WizardPicker v-if="wizardModalOpen" @close="wizardModalOpen = false"/>
    </q-dialog>

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
</style>
