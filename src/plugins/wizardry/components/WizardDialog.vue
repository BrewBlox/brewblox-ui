<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { useDashboardStore } from '@/store/dashboards';
import { userUISettings } from '@/user-settings';

export default defineComponent({
  name: 'WizardDialog',
  props: {
    ...useDialog.props,
    activeDashboardId: {
      type: String,
      default: null,
    },
    initialWizard: {
      type: String,
      default: null,
    },
    initialProps: {
      type: Object,
      default: () => ({}),
    },
    showMenu: {
      type: Boolean,
      default: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();
    const { dense } = useGlobals.setup();
    const sparkStore = useSparkStore();
    const dashboardStore = useDashboardStore();

    const dialogTitle = ref<string>('Wizardry');
    const activeWizard = ref<string | null>(props.initialWizard);
    const activeProps = ref(props.initialProps);

    const sparkServiceAvailable = computed<boolean>(
      () => sparkStore.serviceIds.length > 0,
    );

    const primaryDashboardId = computed<string | null>(() => {
      const { homePage } = userUISettings.value;
      if (!homePage || !homePage.startsWith('/dashboard')) {
        return null;
      }
      return homePage.split('/')[2] ?? null;
    });

    const dashboardId = computed<string | null>(
      () =>
        props.activeDashboardId ??
        primaryDashboardId.value ??
        dashboardStore.dashboardIds[0] ??
        null,
    );

    function reset(): void {
      activeWizard.value = null;
      dialogTitle.value = 'Wizardry';
    }

    function pickWizard(component: string | null, props: any = {}): void {
      activeWizard.value = component;
      activeProps.value = props;
    }

    function onBack(): void {
      if (props.showMenu) {
        reset();
      } else {
        onDialogHide();
      }
    }

    function onClose(): void {
      onDialogHide();
    }

    function onDone(...args: any[]): void {
      onDialogOK(...args);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      dense,
      dialogTitle,
      activeWizard,
      activeProps,
      sparkServiceAvailable,
      dashboardId,
      reset,
      pickWizard,
      onBack,
      onClose,
      onDone,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <Card no-scroll>
      <template #toolbar>
        <Toolbar
          icon="mdi-creation"
          :title="dialogTitle"
        />
      </template>

      <component
        :is="activeWizard"
        v-if="activeWizard"
        v-bind="activeProps"
        :active-dashboard-id="dashboardId"
        @title="(v) => (dialogTitle = v)"
        @back="onBack"
        @close="onClose"
        @done="onDone"
      />

      <WizardBody v-else>
        <q-card-section>
          <q-item
            :disable="!sparkServiceAvailable"
            clickable
            @click="pickWizard('QuickstartWizardPicker')"
          >
            <q-item-section
              side
              class="col-4"
            >
              <q-item-label class="text-h6"> Quick Start </q-item-label>
              <q-item-label caption> Add a brewing process </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>
                This wizard helps to set up common brewing setups, like a
                fermentation fridge or a HERMS.
              </p>
              <p>
                It will create all required blocks on the controller and a new
                dashboard for quick access to settings and graphs.
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
            <q-item-section
              side
              class="col-4"
            >
              <q-item-label class="text-h6"> New Dashboard </q-item-label>
              <q-item-label caption> Add an empty dashboard </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>
                Add widgets to dashboards to create a custom UI for your
                brewery.
              </p>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item
            clickable
            @click="pickWizard('WidgetWizardPicker')"
          >
            <q-item-section
              side
              class="col-4"
            >
              <q-item-label class="text-h6"> New Widget </q-item-label>
              <q-item-label caption> Add a widget to a dashboard </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>
                A widget is a card on dashboard with a specific function. Many
                different widget types are available.
              </p>
              <p>
                There are graph widgets, brewery overview widgets, block
                widgets, and more.
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
            <q-item-section
              side
              class="col-4"
            >
              <q-item-label class="text-h6"> New Block </q-item-label>
              <q-item-label caption>
                Add a block to a Spark controller
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>
                Blocks can be combined to build the control chains that manage
                brew day or fermentation temperature.
              </p>
              <p>
                Blocks exist on Spark controllers. You can add a widget to show
                a block on a dashboard.
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
            <q-item-section
              side
              class="col-4"
            >
              <q-item-label class="text-h6"> Import Widget </q-item-label>
              <q-item-label caption> Add a widget from a file </q-item-label>
            </q-item-section>
            <q-item-section>
              <p>Import a previously exported widget from a file.</p>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-item
            class="darkish text-italic"
            style="cursor: not-allowed"
          >
            <q-item-section
              side
              class="col-4"
            >
              <q-item-label class="text-h6"> Services </q-item-label>
              <q-item-label caption> (No longer a wizard) </q-item-label>
            </q-item-section>
            <q-item-section>
              Discovered services automatically appear in the sidebar. Click on
              them to add them as UI service.
            </q-item-section>
          </q-item>
        </q-card-section>
      </WizardBody>
    </Card>
  </q-dialog>
</template>
