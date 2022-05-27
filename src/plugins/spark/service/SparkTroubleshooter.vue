<script lang="ts">
import { computed, defineComponent, provide, reactive } from 'vue';

import { useSparkStore } from '@/plugins/spark/store';
import { SparkStatus } from '@/plugins/spark/types';
import { WidgetContext } from '@/store/features';
import { ContextKey } from '@/symbols';
import { createDialog } from '@/utils/dialog';

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

    const status = computed<SparkStatus | null>(() =>
      sparkStore.statusByService(props.serviceId),
    );

    const lastStatus = computed<string>(
      () =>
        sparkStore.lastStatusAtByService(props.serviceId)?.toLocaleString() ??
        'Unknown',
    );

    function triStateDesc(
      value: boolean | null | undefined,
      trueDesc: string,
      falseDesc: string,
      nullDesc = 'Service status unknown',
    ): string {
      if (value == null) {
        return nullDesc;
      }
      return value ? trueDesc : falseDesc;
    }

    const isReachableDesc = computed<string>(() =>
      triStateDesc(
        status.value?.isServiceReachable,
        'Service running',
        'Unable to connect to service',
      ),
    );

    const autoconnectingDesc = computed<string>(() =>
      triStateDesc(
        status.value?.isAutoconnecting,
        'Service automatically connects to controller',
        'Service does not automatically connect to controller',
      ),
    );

    const isConnectedDesc = computed<string>(() =>
      triStateDesc(
        status.value?.isConnected,
        'Service connected to controller',
        'Service not connected to controller',
      ),
    );

    const isAcknowledgedDesc = computed<string>(() =>
      triStateDesc(
        status.value?.isAcknowledged,
        'Handshake performed',
        'Handshake not performed',
      ),
    );

    const isCompatibleDesc = computed<string>(() =>
      triStateDesc(
        status.value?.isCompatibleFirmware,
        'Firmware compatible',
        'Firmware not compatible',
      ),
    );

    const isValidDesc = computed<string>(() =>
      triStateDesc(
        status.value?.isValidDeviceId,
        'Valid device ID',
        'Invalid device ID',
      ),
    );

    const isSynchronizedDesc = computed<string>(() =>
      triStateDesc(
        status.value?.isSynchronized,
        'Service synchronized',
        'Service not synchronized',
      ),
    );

    async function refresh(): Promise<void> {
      await sparkStore.fetchAll(props.serviceId);
    }

    async function toggleAutoconnecting(): Promise<void> {
      await sparkStore.saveAutoConnecting(
        props.serviceId,
        !status.value?.isAutoconnecting,
      );
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
      status,
      lastStatus,
      isReachableDesc,
      autoconnectingDesc,
      isConnectedDesc,
      isAcknowledgedDesc,
      isCompatibleDesc,
      isValidDesc,
      isSynchronizedDesc,
      refresh,
      toggleAutoconnecting,
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

    <div
      v-if="status"
      class="widget-body row items-center"
    >
      <q-spinner
        size="24px"
        class="col-auto self-center"
      />
      <LabeledField
        label="Last update"
        tag="big"
        class="col-grow"
      >
        {{ lastStatus }}
      </LabeledField>

      <template v-if="status.isUpdating">
        <div class="col-break" />
        <q-icon
          v-bind="iconProps(status.isUpdating)"
          color="secondary"
          name="mdi-progress-download"
        />
        <div>Update is in progress</div>
      </template>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.isServiceReachable)" />
      <div>
        {{ isReachableDesc }}
      </div>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.isAutoconnecting)" />
      <div>
        {{ autoconnectingDesc }}
      </div>

      <template v-if="status.isServiceReachable">
        <div class="col-break" />
        <div class="row q-gutter-x-sm q-pl-lg">
          <q-btn
            flat
            :label="
              status.isAutoconnecting
                ? 'Pause autoconnect'
                : 'Resume autoconnect'
            "
            @click="toggleAutoconnecting"
          />
          <q-btn
            flat
            label="Reboot service"
            @click="serviceReboot"
          />
        </div>
      </template>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.isConnected)" />
      <div>
        {{ isConnectedDesc }}
      </div>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.isAcknowledged)" />
      <div>
        {{ isAcknowledgedDesc }}
      </div>

      <template v-if="status.isAcknowledged">
        <div class="col-break" />
        <q-icon v-bind="iconProps(status.isCompatibleFirmware)" />
        <div>
          {{ isCompatibleDesc }}
        </div>

        <template v-if="!status.isCompatibleFirmware">
          <div class="col-break" />
          <div class="row q-gutter-x-sm q-pl-lg">
            <q-btn
              unelevated
              color="primary"
              label="Update firmware"
              @click="startFirmwareUpdate"
            />
          </div>
        </template>

        <div class="col-break" />
        <q-icon v-bind="iconProps(status.isValidDeviceId)" />
        <div>
          {{ isValidDesc }}
        </div>
      </template>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.isSynchronized)" />
      <div>
        {{ isSynchronizedDesc }}
      </div>

      <div class="col-break" />
      <div class="col">
        <!-- not available -->
        <span v-if="!status.isServiceReachable">
          Your Spark service is offline.
          <ul>
            <li>Is your backend reachable?</li>
            <li>Is the service present in your docker-compose file?</li>
            <li>Is the service running?</li>
          </ul>
        </span>
        <!-- not autoconnecting -->
        <span v-else-if="!status.isAutoconnecting">
          Your Spark service is paused, and not automatically connecting to your
          controller.<br />
          This status can be toggled manually.
        </span>
        <!-- not connected -->
        <span v-else-if="!status.isConnected">
          Your Spark service is online, but not connected to your controller.
          <ul>
            <li>Is your controller turned on?</li>
            <li>Does your controller have the correct firmware?</li>
            <li>WiFi: Does your controller display its IP address?</li>
            <li>Are there any error messages in your service logs?</li>
            <li>
              USB: Your service must have been (re)started after plugging in the
              USB cable.
            </li>
            <li>USB: Can your service access USB devices? (Mac hosts)</li>
          </ul>
        </span>
        <!-- awaiting handshake -->
        <span v-else-if="!status.isAcknowledged">
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
        </span>
        <!-- not compatible -->
        <span v-else-if="!status.isCompatibleFirmware">
          Your Spark service is not compatible with the firmware
          <br />
          <b>Please update your firmware</b>
        </span>
        <!-- not valid -->
        <span v-else-if="!status.isValidDeviceId">
          The controller device ID doesn't match the service
          <i>--device-id</i> setting.
          <br />
          <b>Please check your connection settings</b>
        </span>
        <!-- not synchronized -->
        <span v-else-if="!status.isSynchronized">
          Your Spark service is connected to your controller, but not yet
          synchronized.
          <b>This status is usually temporary.</b>
          <ul>
            <li>Is your datastore service running?</li>
            <li>
              Are there any error messages in your service container logs?
            </li>
          </ul>
        </span>
      </div>
    </div>
  </Card>
</template>
