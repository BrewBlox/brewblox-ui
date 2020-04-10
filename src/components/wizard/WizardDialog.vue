<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { sparkStore } from '@/plugins/spark/store';

@Component
export default class WizardDialog extends DialogBase {
  dialogTitle: string | null = null;
  wizardComponent: string | null = null;
  wizardProps: any = {};

  @Prop({ type: String, required: false })
  readonly dashboardId!: string;

  @Prop({ type: String, required: false })
  readonly initialWizard!: string;

  @Prop({ type: Object, default: () => ({}) })
  public readonly initialProps!: any;

  get sparkServiceAvailable(): boolean {
    return sparkStore.modules.length > 0;
  }

  mounted(): void {
    this.reset();
    this.pickWizard(this.initialWizard, this.initialProps);
  }

  reset(): void {
    this.wizardComponent = null;
    this.dialogTitle = 'Wizardry';
  }

  pickWizard(component: string, props: any = {}) {
    this.wizardComponent = component;
    this.wizardProps = props;
  }
}
</script>

<template>
  <q-dialog ref="dialog" :maximized="$dense" no-backdrop-dismiss @hide="onDialogHide">
    <CardWrapper :no-scroll="!!wizardComponent" v-bind="{context}">
      <template #toolbar>
        <DialogToolbar icon="mdi-creation" :title="dialogTitle" />
      </template>

      <component
        :is="wizardComponent"
        v-if="wizardComponent"
        v-bind="wizardProps"
        @title="v => dialogTitle = v"
        @back="reset"
        @close="onDialogHide"
      />

      <template v-else>
        <q-card-section>
          <q-item :disable="!sparkServiceAvailable" clickable @click="pickWizard('QuickStartWizardPicker')">
            <q-item-section side class="col-4">
              <q-item-label class="text-h6">
                Quick Start
              </q-item-label>
              <q-item-label caption>
                Add a brewing process
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>This wizard helps to set up common brewing setups, like a fermentation fridge or a HERMS.</p>
              <p>
                It will create all required blocks on the controller
                and a new dashboard for quick access to settings and graphs.
              </p>
            </q-item-section>
            <q-tooltip v-if="!sparkServiceAvailable">
              An active Spark service is required for Quick start wizards.
            </q-tooltip>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item clickable @click="pickWizard('DashboardWizard')">
            <q-item-section side class="col-4">
              <q-item-label class="text-h6">
                New Dashboard
              </q-item-label>
              <q-item-label caption>
                Add an empty dashboard
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>You can then add widgets to a dashboard to create a custom UI for your brewery.</p>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item clickable @click="pickWizard('WidgetWizardPicker')">
            <q-item-section side class="col-4">
              <q-item-label class="text-h6">
                New Widget
              </q-item-label>
              <q-item-label caption>
                Add a widget to a dashboard
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>
                A widget is a card on dashboard with a specific function.
                Many different widget types are available.
              </p>
              <p>
                There are widgets for each block type on the controller, graph widgets,
                brewery overview widgets and more.
              </p>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item clickable @click="pickWizard('ImportWizard')">
            <q-item-section side class="col-4">
              <q-item-label class="text-h6">
                Import Widget
              </q-item-label>
              <q-item-label caption>
                Add a widget from a file
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>
                Import a previously exported widget from a file.
              </p>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item class="darkish text-italic" style="cursor: not-allowed">
            <q-item-section side class="col-4">
              <q-item-label class="text-h6">
                Services
              </q-item-label>
              <q-item-label caption>
                (No longer a wizard)
              </q-item-label>
            </q-item-section>
            <q-item-section>
              Discovered services automatically appear in the sidebar.
              Click on them to add them as UI service.
            </q-item-section>
          </q-item>
        </q-card-section>
      </template>
    </CardWrapper>
  </q-dialog>
</template>
