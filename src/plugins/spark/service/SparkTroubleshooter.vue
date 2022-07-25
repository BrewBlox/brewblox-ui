<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { WidgetContext } from '@/store/features';
import { ContextKey } from '@/symbols';
import { createDialog } from '@/utils/dialog';
import { shortDateString } from '@/utils/quantity';
import { SparkStatusDescription } from 'brewblox-proto/ts';
import { computed, defineComponent, provide, reactive } from 'vue';

type ConnectStatus = SparkStatusDescription['connection_status'];

type ConnectionStep = 'UNREACHABLE' | ConnectStatus;

const stepOrder: ConnectionStep[] = [
  'UNREACHABLE',
  'DISCONNECTED',
  'CONNECTED',
  'ACKNOWLEDGED',
  'SYNCHRONIZED',
  'UPDATING',
];

export default defineComponent({
  name: 'SparkTroubleshooter',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    provide(
      ContextKey,
      reactive<WidgetContext>({
        container: 'Dashboard',
        size: 'Content',
        mode: 'Basic',
      }),
    );

    const sparkStore = useSparkStore();

    const status = computed<SparkStatusDescription | null>(() =>
      sparkStore.statusByService(props.serviceId),
    );

    const lastStatusAt = computed<Date | null>(() =>
      sparkStore.lastStatusAtByService(props.serviceId),
    );

    const connectionStep = computed<ConnectionStep>(() => {
      if (!status.value) {
        return 'UNREACHABLE';
      }
      return status.value.connection_status;
    });

    function isStepDone(step: ConnectionStep): boolean {
      return stepOrder.indexOf(step) < stepOrder.indexOf(connectionStep.value);
    }

    async function refresh(): Promise<void> {
      await sparkStore.fetchAll(props.serviceId);
    }

    async function setAutoconnect(enabled: boolean): Promise<void> {
      await sparkStore.saveAutoConnecting(props.serviceId, enabled);
      await refresh();
    }

    function iconProps(val: boolean | undefined): AnyDict {
      return {
        name: val ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline',
        color: val ? 'positive' : 'negative',
        size: 'md',
        class: 'col-auto q-mr-sm',
      };
    }

    function startFirmwareUpdate(): void {
      createDialog({
        component: 'FirmwareUpdateDialog',
        componentProps: {
          serviceId: props.serviceId,
        },
      });
    }

    function serviceReboot(): void {
      sparkStore.serviceReboot(props.serviceId);
    }

    return {
      shortDateString,
      status,
      lastStatusAt,
      connectionStep,
      isStepDone,
      refresh,
      setAutoconnect,
      iconProps,
      startFirmwareUpdate,
      serviceReboot,
    };
  },
});
</script>

<template>
  <Card style="max-width: 500px">
    <template #toolbar>
      <Toolbar
        :title="serviceId"
        subtitle="Troubleshooter"
      >
        <template #buttons>
          <q-btn
            flat
            dense
            icon="refresh"
            @click="refresh"
          />
        </template>
      </Toolbar>
    </template>

    <div class="widget-body">
      <div class="row">
        <q-spinner
          size="24px"
          class="col-auto self-center"
        />
        <LabeledField
          label="Last update"
          tag="big"
          class="col-grow"
        >
          {{ shortDateString(lastStatusAt) }}
        </LabeledField>
      </div>
      <q-stepper
        v-model="connectionStep"
        vertical
        flat
        done-color="positive"
        done-icon="mdi-check"
        active-icon="mdi-dots-horizontal"
        style="background-color: transparent"
      >
        <q-step
          :done="isStepDone('UNREACHABLE')"
          name="UNREACHABLE"
          title="Connect to the service"
        >
          Your Spark service is offline.
          <ul>
            <li>Is your backend reachable?</li>
            <li>Is the service present in your docker-compose file?</li>
            <li>Is the service running?</li>
          </ul>
        </q-step>
        <q-step
          :done="isStepDone('DISCONNECTED')"
          name="DISCONNECTED"
          title="Connect to the controller"
        >
          <template v-if="status">
            <template v-if="status.enabled">
              Your Spark service is online, but not connected to your
              controller.
              <ul>
                <li>Is your controller turned on?</li>
                <li>Does your controller have the correct firmware?</li>
                <li>WiFi: Does your controller display its IP address?</li>
                <li>Are there any error messages in your service logs?</li>
                <li>
                  USB: Your service must have been (re)started after plugging in
                  the USB cable.
                </li>
                <li>USB: Can your service access USB devices? (Mac hosts)</li>
              </ul>
            </template>
            <template v-else>
              Your Spark service is paused, and not automatically connecting to
              your controller.<br />
              This status can be toggled manually.
            </template>
          </template>
        </q-step>
        <q-step
          :done="isStepDone('CONNECTED')"
          name="CONNECTED"
          title="Wait for controller handshake"
        >
          Your Spark service is waiting for the controller handshake.
          <br />
          <b>This status is usually temporary</b>
          <br />
          <br />
          If your Spark is showing a blank screen, you may need to flash the
          bootloader.
          <br />
          To do so, run
          <span class="monospace">
            brewblox-ctl particle -c flash-bootloader
          </span>
        </q-step>
        <q-step
          :done="isStepDone('ACKNOWLEDGED')"
          name="ACKNOWLEDGED"
          title="Synchronize settings"
        >
          Your Spark service is connected to your controller, but not yet
          synchronized.
          <br />
          <b>This status is usually temporary.</b>
        </q-step>
        <q-step
          v-if="connectionStep === 'UPDATING'"
          name="UPDATING"
          title="Controller update"
        >
          Your Spark is being updated. It will reboot automatically when the
          update is done.
        </q-step>
      </q-stepper>

      <div
        v-if="status"
        class="row q-gutter-sm justify-between"
      >
        <ToggleButton
          flat
          :model-value="status.enabled"
          label="Autoconnect"
          color="secondary"
          @update:model-value="setAutoconnect"
        />
        <q-btn
          flat
          label="Reboot service"
          color="secondary"
          icon="mdi-reload"
          @click="serviceReboot"
        />
      </div>
    </div>
  </Card>
</template>
