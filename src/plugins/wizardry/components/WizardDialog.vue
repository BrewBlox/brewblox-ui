<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { sparkStore } from '@/plugins/spark/store';
import { dashboardStore } from '@/store/dashboards';
import { systemStore } from '@/store/system';

@Component
export default class WizardDialog extends DialogBase {
  dialogTitle: string | null = null;
  activeWizard: string | null = null;
  activeProps: any = {};

  @Prop({ type: String, required: false })
  readonly activeDashboardId!: string | undefined;

  @Prop({ type: String, required: false })
  readonly initialWizard!: string | undefined;

  @Prop({ type: Object, default: () => ({}) })
  readonly initialProps!: any;

  @Prop({ type: Boolean, default: true })
  readonly showMenu!: boolean;

  get sparkServiceAvailable(): boolean {
    return sparkStore.modules.length > 0;
  }

  get primaryDashboardId(): string | null {
    const { homePage } = systemStore.config;
    if (!homePage || !homePage.startsWith('/dashboard')) {
      return null;
    }
    return homePage.split('/')[2] ?? null;
  }

  get dashboardId(): string | null {
    return this.activeDashboardId
      ?? this.primaryDashboardId
      ?? dashboardStore.dashboardIds[0]
      ?? null;
  }

  mounted(): void {
    this.reset();
    this.pickWizard(this.initialWizard ?? null, this.initialProps);
  }

  reset(): void {
    this.activeWizard = null;
    this.dialogTitle = 'Wizardry';
  }

  pickWizard(component: string | null, props: any = {}) {
    this.activeWizard = component;
    this.activeProps = props;
  }

  onBack(): void {
    if (this.showMenu) {
      this.reset();
    }
    else {
      this.onDialogHide();
    }
  }

  onClose(): void {
    this.onDialogHide();
  }

  onDone(...args: any[]): void {
    this.onDialogOk(...args);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    :maximized="$dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <CardWrapper :no-scroll="!!activeWizard" v-bind="{context}">
      <template #toolbar>
        <DialogToolbar icon="mdi-creation" :title="dialogTitle" />
      </template>

      <component
        :is="activeWizard"
        v-if="activeWizard"
        v-bind="activeProps"
        :active-dashboard-id="dashboardId"
        @title="v => dialogTitle = v"
        @back="onBack"
        @close="onClose"
        @done="onDone"
      />

      <template v-else>
        <q-card-section>
          <q-item
            :disable="!sparkServiceAvailable"
            clickable
            @click="pickWizard('QuickStartWizardPicker')"
          >
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
          <q-item
            clickable
            @click="pickWizard('DashboardWizard')"
          >
            <q-item-section side class="col-4">
              <q-item-label class="text-h6">
                New Dashboard
              </q-item-label>
              <q-item-label caption>
                Add an empty dashboard
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>Add widgets to dashboards to create a custom UI for your brewery.</p>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item
            clickable
            @click="pickWizard('WidgetWizardPicker')"
          >
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
                There are graph widgets, brewery overview widgets,
                block widgets, and more.
              </p>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item
            :disable="!sparkServiceAvailable"
            clickable
            @click="pickWizard('BlockWizard')"
          >
            <q-item-section side class="col-4">
              <q-item-label class="text-h6">
                New Block
              </q-item-label>
              <q-item-label caption>
                Add a block to a Spark controller
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>
                Blocks can be combined to build the control chains
                that manage brew day or fermentation temperature.
              </p>
              <p>
                Blocks exist on Spark controllers.
                You can add a widget to show a block on a dashboard.
              </p>
            </q-item-section>
            <q-tooltip v-if="!sparkServiceAvailable">
              An active Spark service is required for block wizards.
            </q-tooltip>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item
            clickable
            @click="pickWizard('ImportWizard')"
          >
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
          <q-item
            class="darkish text-italic"
            style="cursor: not-allowed"
          >
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
