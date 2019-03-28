<script lang="ts">
import Component from 'vue-class-component';
import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

/*
We inherit from WidgetWizardBase, which defines the properties provided to any wizard.
WidgetWizardBase inherits from Vue, and defines some generic getters and functions.
*/
@Component
export default class ExampleFeatureWizard extends WidgetWizardBase {
  createWidget() {
    // this.createItem() is inherited from WidgetWizardBase.
    this.createItem({
      id: this.widgetId,
      feature: this.typeId,
      dashboard: this.$props.dashboardId,
      order: 0,
      config: {
        lastUrl: '/datastore',
      },
      ...this.defaultWidgetSize,
    });
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="widgetId" :rules="widgetIdRules" dark label="Widget name"/>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <q-btn
        :disable="!widgetIdOk"
        unelevated
        label="Create"
        color="primary"
        @click="createWidget"
      />
    </q-card-actions>
  </div>
</template>
