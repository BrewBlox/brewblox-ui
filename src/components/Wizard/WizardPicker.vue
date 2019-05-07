<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    dashboardId: {
      type: String,
      required: false,
    },
    initialComponent: {
      type: String,
      default: null,
    },
  },
})
export default class WizardPicker extends Vue {
  title: string | null = null;
  wizardComponent: string | null = null;

  reset() {
    this.wizardComponent = null;
    this.title = 'Wizardry';
  }

  close() {
    this.$emit('close');
  }

  mounted() {
    this.reset();
    this.wizardComponent = this.$props.initialComponent;
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>{{ title }}</FormToolbar>
    <component
      v-if="wizardComponent"
      :is="wizardComponent"
      @title="v => title = v"
      @back="reset"
      @close="close"
    />

    <q-scroll-area v-else style="height: 80vh;">
      <q-card-section>
        <q-item link clickable dark @click="wizardComponent = 'ServiceWizardPicker'">
          <q-item-section side class="col-3">
            <q-item-label class="text-h6">Service</q-item-label>
            <q-item-label caption>Click to start</q-item-label>
          </q-item-section>
          <q-item-section>
            <ul>
              <li>Services communicate with containers in docker-compose.</li>
              <li>There should be one service per container.</li>
              <li>There can be multiple services of the same type.</li>
            </ul>
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark inset/>

      <q-card-section>
        <q-item link clickable dark @click="wizardComponent = 'DashboardWizard'">
          <q-item-section side class="col-3">
            <q-item-label class="text-h6">Dashboard</q-item-label>
            <q-item-label caption>Click to start</q-item-label>
          </q-item-section>
          <q-item-section>
            <ul>
              <li>Dashboards display widgets.</li>
              <li>You can have as many dashboards as you want.</li>
              <li>Deleting a dashboard will delete all widgets on the dashboard.</li>
            </ul>
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark inset/>

      <q-card-section>
        <q-item link clickable dark @click="wizardComponent = 'WidgetWizardPicker'">
          <q-item-section side class="col-3">
            <q-item-label class="text-h6">Widget</q-item-label>
            <q-item-label caption>Click to start</q-item-label>
          </q-item-section>
          <q-item-section>
            <ul>
              <li>A Widget is a card on a dashboard.</li>
              <li>Widgets can be anything, but usually display something from a service.</li>
              <li>Multiple block widgets can be linked to the same block on a Spark controller.</li>
            </ul>
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark inset/>

      <q-card-section>
        <q-item link clickable dark @click="wizardComponent = 'ArrangementWizardPicker'">
          <q-item-section side class="col-3">
            <q-item-label class="text-h6">Arrangement</q-item-label>
            <q-item-label caption>Click to start</q-item-label>
          </q-item-section>
          <q-item-section>
            <ul>
              <li>An arrangement creates and configures a group of widgets.</li>
              <li>This is a quick way to set up default configurations.</li>
            </ul>
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark inset/>

      <q-card-section>
        <q-item link clickable dark @click="wizardComponent = 'ImportWizard'">
          <q-item-section side class="col-3">
            <q-item-label class="text-h6">Import</q-item-label>
            <q-item-label caption>Click to start</q-item-label>
          </q-item-section>
          <q-item-section>
            <ul>
              <li>Import widget from JSON string</li>
              <li>Use widgets shared by other users</li>
            </ul>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-scroll-area>
  </q-card>
</template>
