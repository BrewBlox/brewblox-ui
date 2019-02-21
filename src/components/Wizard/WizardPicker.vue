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

  }
}
</script>

<template>
  <div class="widget-modal column">
    <!-- display wizard -->
    <component v-if="wizardComponent" :is="wizardComponent" class="unpadded fit"/>
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
          Sed accumsan, sem vel suscipit bibendum, sapien arcu ornare nulla, a placerat urna libero nec justo.
          <br>Donec mollis erat sit amet interdum iaculis.
          Ut sagittis, erat quis viverra rutrum, risus neque dictum augue, in sodales ex sapien vel nisi.
          In viverra finibus leo et pretium. Etiam sollicitudin porta tincidunt.
          Etiam gravida, ligula quis interdum sodales, neque dui porta nibh, a molestie ipsum nibh fermentum lorem.
          Nunc ut nisi tristique, malesuada tellus et, lacinia tortor.
          Donec blandit, nisi vitae congue dignissim, lectus metus porttitor quam, sit amet rutrum eros elit a ligula.
          In vel nibh ac mi mollis mollis.
        </q-card-main>
      </q-card>
      <q-card dark class="cursor-pointer" @click.native="startDashboardWizard">
        <q-card-title>
          Dashboard
          <span slot="subtitle">Click to start</span>
        </q-card-title>
        <q-card-main>
          Sed accumsan, sem vel suscipit bibendum, sapien arcu ornare nulla, a placerat urna libero nec justo.
          <br>Donec mollis erat sit amet interdum iaculis.
          Ut sagittis, erat quis viverra rutrum, risus neque dictum augue, in sodales ex sapien vel nisi.
          In viverra finibus leo et pretium. Etiam sollicitudin porta tincidunt.
          Etiam gravida, ligula quis interdum sodales, neque dui porta nibh, a molestie ipsum nibh fermentum lorem.
          Nunc ut nisi tristique, malesuada tellus et, lacinia tortor.
          Donec blandit, nisi vitae congue dignissim, lectus metus porttitor quam, sit amet rutrum eros elit a ligula.
          In vel nibh ac mi mollis mollis.
        </q-card-main>
      </q-card>
      <q-card dark class="cursor-pointer" @click.native="startWidgetWizard">
        <q-card-title>
          Widget
          <span slot="subtitle">Click to start</span>
        </q-card-title>
        <q-card-main>
          Sed accumsan, sem vel suscipit bibendum, sapien arcu ornare nulla, a placerat urna libero nec justo.
          <br>Donec mollis erat sit amet interdum iaculis.
          Ut sagittis, erat quis viverra rutrum, risus neque dictum augue, in sodales ex sapien vel nisi.
          In viverra finibus leo et pretium. Etiam sollicitudin porta tincidunt.
          Etiam gravida, ligula quis interdum sodales, neque dui porta nibh, a molestie ipsum nibh fermentum lorem.
          Nunc ut nisi tristique, malesuada tellus et, lacinia tortor.
          Donec blandit, nisi vitae congue dignissim, lectus metus porttitor quam, sit amet rutrum eros elit a ligula.
          In vel nibh ac mi mollis mollis.
        </q-card-main>
      </q-card>
      <q-card dark class="cursor-pointer" @click.native="startArrangementWizard">
        <q-card-title>
          Arrangement
          <span slot="subtitle">Click to start</span>
        </q-card-title>
        <q-card-main>
          Sed accumsan, sem vel suscipit bibendum, sapien arcu ornare nulla, a placerat urna libero nec justo.
          <br>Donec mollis erat sit amet interdum iaculis.
          Ut sagittis, erat quis viverra rutrum, risus neque dictum augue, in sodales ex sapien vel nisi.
          In viverra finibus leo et pretium. Etiam sollicitudin porta tincidunt.
          Etiam gravida, ligula quis interdum sodales, neque dui porta nibh, a molestie ipsum nibh fermentum lorem.
          Nunc ut nisi tristique, malesuada tellus et, lacinia tortor.
          Donec blandit, nisi vitae congue dignissim, lectus metus porttitor quam, sit amet rutrum eros elit a ligula.
          In vel nibh ac mi mollis mollis.
        </q-card-main>
      </q-card>
    </q-list>
  </div>
</template>
