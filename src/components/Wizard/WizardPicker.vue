<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    dashboardId: {
      type: String,
      required: false,
    },
  },
})
export default class WizardPicker extends Vue {
  wizardComponent: string = '';

  startServiceWizard() {
    this.wizardComponent = 'ServiceWizardPicker';
  }

  startDashboardWizard() {
    this.wizardComponent = 'DashboardWizard';
  }

  startWidgetWizard() {
    this.wizardComponent = 'WidgetWizardPicker';
  }

  startArrangementWizard() {
    this.wizardComponent = 'ArrangementWizardPicker';
  }

  close() {
    this.$emit('close');
  }
}
</script>

<template>
  <div class="widget-modal column">
    <!-- display wizard -->
    <component v-if="wizardComponent" :is="wizardComponent" class="unpadded fit" @close="close"/>

    <!-- Select a wizard -->
    <q-list v-else no-border>
      <q-toolbar class="unpadded">
        <q-toolbar-title>Select a wizard</q-toolbar-title>
        <q-btn v-close-overlay flat rounded label="close"/>
      </q-toolbar>

      <q-card dark class="cursor-pointer" @click.native="startServiceWizard">
        <q-card-title>
          Service
          <span slot="subtitle">Click to start</span>
        </q-card-title>
        <q-card-main>
          <ul>
            <li>Services communicate with containers in docker-compose.</li>
            <li>There should be one service per container.</li>
            <li>There can be multiple services of the same type.</li>
          </ul>
        </q-card-main>
      </q-card>

      <q-card dark class="cursor-pointer" @click.native="startDashboardWizard">
        <q-card-title>
          Dashboard
          <span slot="subtitle">Click to start</span>
        </q-card-title>
        <q-card-main>
          <ul>
            <li>Dashboards display widgets.</li>
            <li>You can have as many dashboards as you want.</li>
            <li>Deleting a dashboard will delete all widgets on the dashboard.</li>
          </ul>
        </q-card-main>
      </q-card>

      <q-card dark class="cursor-pointer" @click.native="startWidgetWizard">
        <q-card-title>
          Widget
          <span slot="subtitle">Click to start</span>
        </q-card-title>
        <q-card-main>
          <ul>
            <li>A Widget is a card on a dashboard.</li>
            <li>Widgets can be anything, but usually display something from a service.</li>
            <li>Multiple block widgets can be linked to the same block on a Spark controller.</li>
          </ul>
        </q-card-main>
      </q-card>

      <q-card dark class="cursor-pointer" @click.native="startArrangementWizard">
        <q-card-title>
          Arrangement
          <span slot="subtitle">Click to start</span>
        </q-card-title>
        <q-card-main>
          <ul>
            <li>An arrangement creates and configures a group of widgets.</li>
            <li>This is a quick way to set up default configurations.</li>
          </ul>
        </q-card-main>
      </q-card>
    </q-list>
  </div>
</template>
