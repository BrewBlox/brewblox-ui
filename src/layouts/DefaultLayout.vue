<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';
import draggable from 'vuedraggable';
import { objectSorter } from '@/helpers/functional';
import { Dashboard } from '@/store/dashboards/state';
import {
  allDashboards,
  primaryDashboard,
} from '@/store/dashboards/getters';
import {
  createDashboard,
  updateDashboardOrder,
  removeDashboard,
  updatePrimaryDashboard,
} from '@/store/dashboards/actions';
import {
  updateServiceOrder,
  removeService as removeServiceInStore,
} from '@/store/services/actions';
import { Service } from '@/store/services/state';
import { serviceValues } from '@/store/services/getters';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import NewServiceWizard from '@/components/Wizard/NewServiceWizard.vue';

@Component({
  components: {
    draggable,
    NewServiceWizard,
    WidgetModal,
  },
})
export default class DefaultLayout extends Vue {
  leftDrawerOpen: boolean = false;
  dashboardEditing: boolean = false;
  serviceEditing: boolean = false;
  wizardModalOpen: boolean = false;
  $q: any;

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
        <!-- dashboards -->

        <q-list-header>
          <q-item-side icon="dashboard" />
          Dashboards
          <q-btn
            round
            size="sm"
            :flat="!dashboardEditing"
            :icon="dashboardEditing ? 'check' : 'mode edit'"
            :color="dashboardEditing ? 'primary': ''"
            @click="toggleDashboardEditing"
          />
        </q-list-header>

        <q-item v-if="dashboards.length === 0">
          No dashboards yet
        </q-item>

        <draggable
          :class="{ editing: dashboardEditing }"
          :options="{ disabled: !dashboardEditing }"
          v-model="dashboards"
        >
          <q-item
            dark
            v-for="dashboard in dashboards"
            :link="!dashboardEditing"
            :key="dashboard.id"
            :to="dashboardEditing ? undefined : `/dashboard/${dashboard.id}`"
          >
            <q-item-side
              v-if="dashboardEditing"
              icon="drag_indicator"
            />
            <q-item-main :label="dashboard.title" />
            <q-item-side
              right
              v-if="dashboardEditing"
            >
              <q-btn
                round
                flat
                icon="home"
                :color="defaultDashboard === dashboard.id ? 'primary' : ''"
                @click="updateDefaultDashboard(dashboard.id)"
              />
            </q-item-side>
            <q-item-side
              right
              v-if="dashboardEditing"
            >
              <q-btn
                round
                flat
                icon="delete"
                @click="removeDashboard(dashboard)"
              />
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
        </div>

        <q-item-separator />
        <!-- services -->

        <q-list-header>
          <q-item-side icon="cloud" />
          Services
          <q-btn
            round
            size="sm"
            :flat="!serviceEditing"
            :icon="serviceEditing ? 'check' : 'mode edit'"
            :color="serviceEditing ? 'primary': ''"
            @click="toggleServiceEditing"
          />
        </q-list-header>

        <q-item v-if="services.length === 0">
          No services yet
        </q-item>

        <draggable
          :class="{ editing: serviceEditing }"
          :options="{ disabled: !serviceEditing }"
          :striped="serviceEditing"
          v-model="services"
        >
          <q-item
            dark
            v-for="service in services"
            :link="!serviceEditing"
            :key="service.id"
            :to="serviceEditing ? undefined : `/service/${service.id}`"
          >
            <q-item-side
              v-if="serviceEditing"
              icon="drag_indicator"
            />
            <q-item-main :label="service.title" />
            <q-item-side
              right
              v-if="serviceEditing"
            >
              <q-btn
                round
                flat
                icon="delete"
                @click="removeService(service)"
              />
            </q-item-side>
          </q-item>
        </draggable>

        <div class="q-list-container">
          <q-btn
            icon="add"
            label="Add service"
            color="dark-bright"
            v-if="serviceEditing"
            @click="createService"
          />
        </div>

      </q-list>
    </q-layout-drawer>

    <widget-modal
      title="Service Wizard"
      :isOpen="wizardModalOpen"
      :onClose="() => { this.wizardModalOpen = false; }"
    >
      <new-service-wizard
        v-if="wizardModalOpen"
      />
    </widget-modal>

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

.widget-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.widget-modal {
  display: flex;
  flex-wrap: wrap;
  max-width: 800px;
  align-items: center;
  padding: 10px;
}

.widget-body {
  flex: 1;
  overflow: auto;
}

.centered {
  margin: auto;
}

.editable {
  border-bottom: 1px solid gray;
}

.unimportant {
  color: grey;
}

.unpadded {
  padding: 0px;
}

.title-bar {
  padding: 5px 10px;
}

.q-card-main {
  padding: 10px;
}
</style>
