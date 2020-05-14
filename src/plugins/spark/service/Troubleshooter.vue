<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { SparkStatus } from '@/plugins/spark/types';
import { WidgetContext } from '@/store/features';

@Component
export default class Troubleshooter extends Vue {
  context: WidgetContext = {
    container: 'Dashboard',
    size: 'Content',
    mode: 'Basic',
  };

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get status(): SparkStatus | null {
    return this.sparkModule?.status ?? null;
  }

  get lastStatus(): string {
    return this.sparkModule?.lastStatus?.toLocaleString() ?? 'Unknown';
  }

  get textAvailable(): string {
    return this.status?.available
      ? 'Service running'
      : 'Unable to connect to service';
  }

  get textAutoconnecting(): string {
    return this.status?.autoconnecting
      ? 'Service automatically connects to controller'
      : 'Service does not automatically connect to controller';
  }

  get textConnect(): string {
    return this.status?.connect
      ? 'Service connected to controller'
      : 'Service not connected to controller';
  }

  get textHandshake(): string {
    return this.status?.handshake
      ? 'Handshake performed'
      : 'Handshake not performed';
  }

  get textCompatible(): string {
    return this.status?.compatible
      ? 'Firmware compatible'
      : 'Firmware not compatible';
  }

  get textValid(): string {
    return this.status?.valid
      ? 'Valid device ID'
      : 'Invalid device ID';
  }

  get textSynchronize(): string {
    return this.status?.synchronize
      ? 'Service synchronized'
      : 'Service not synchronized';
  }

  async refresh(): Promise<void> {
    await this.sparkModule?.fetchAll();
  }

  async toggleAutoconnecting(): Promise<void> {
    await this.sparkModule?.saveAutoConnecting(!this.status?.autoconnecting);
    await this.refresh();
  }

  iconProps(val: boolean): Mapped<any> {
    return {
      name: val ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline',
      color: val ? 'positive' : 'negative',
      size: 'md',
      class: 'col-auto q-mr-sm',
    };
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}" class="widget-md">
    <template #toolbar>
      <Toolbar :title="serviceId" subtitle="Troubleshooter">
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

    <div v-if="status" class="widget-body row items-center">
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

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.available)" />
      <div>
        {{ textAvailable }}
      </div>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.autoconnecting)" />
      <div>
        {{ textAutoconnecting }}
      </div>

      <div class="col-break" />
      <div class="row q-gutter-x-sm q-pl-lg">
        <q-btn
          flat
          :label="status.autoconnecting ? 'Pause' : 'Resume'"
          @click="toggleAutoconnecting"
        />
      </div>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.connect)" />
      <div>
        {{ textConnect }}
      </div>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.handshake)" />
      <div>
        {{ textHandshake }}
      </div>

      <template v-if="status.handshake">
        <div class="col-break" />
        <q-icon v-bind="iconProps(status.compatible)" />
        <div>
          {{ textCompatible }}
        </div>

        <div class="col-break" />
        <q-icon v-bind="iconProps(status.valid)" />
        <div>
          {{ textValid }}
        </div>
      </template>

      <div class="col-break" />
      <q-icon v-bind="iconProps(status.synchronize)" />
      <div>
        {{ textSynchronize }}
      </div>

      <div class="col-break" />
      <div class="col">
        <!-- not available -->
        <span v-if="!status.available">
          Your Spark service is offline.
          <ul>
            <li>Is your backend reachable?</li>
            <li>Is the container present in your docker-compose file?</li>
            <li>Is the container running?</li>
          </ul>
        </span>
        <!-- not autoconnecting -->
        <span v-else-if="!status.autoconnecting">
          Your Spark service is paused, and not automatically connecting to your controller.<br>
          This status can be toggled manually.
        </span>
        <!-- not connected -->
        <span v-else-if="!status.connect">
          Your Spark service is online, but not connected to your controller.
          <ul>
            <li>Is your controller turned on?</li>
            <li>Does your controller have the correct firmware?</li>
            <li>WiFi: Does your controller display its IP address?</li>
            <li>Are there any error messages in your service logs?</li>
            <li>USB: Your service must have been (re)started after plugging in the USB cable.</li>
            <li>USB: Can your service access USB devices? (Mac hosts)</li>
          </ul>
        </span>
        <!-- awaiting handshake -->
        <span v-else-if="!status.handshake">
          Your Spark service is waiting for the controller handshake.
          <br>
          <b>This status is usually temporary</b>
          <br>
          <br>
          If your Spark is showing a blank screen, you may need to flash the bootloader.
          <br>
          To do so, run <span class="monospace">brewblox-ctl particle -c flash-bootloader</span>
        </span>
        <!-- not compatible -->
        <span v-else-if="!status.compatible">
          Your Spark service is not compatible with the firmware
          <br>
          <b>Please run brewblox-ctl update</b>
        </span>
        <!-- not valid -->
        <span v-else-if="!status.valid">
          The controller device ID doesn't match the service <i>--device-id</i> setting.
          <br>
          <b>Please check your connection settings</b>
        </span>
        <!-- not synchronized -->
        <span v-else-if="!status.synchronize">
          Your Spark service is connected to your controller, but not yet synchronized.
          <b>This status is usually temporary.</b>
          <ul>
            <li>Is your datastore container running?</li>
            <li>Are there any error messages in your service container logs?</li>
            <li>Does your controller have the correct firmware?</li>
          </ul>
        </span>
      </div>

      <template v-if="(status.info || []).length > 0">
        <div class="col-break" />
        <div class="col">
          <b>Service info:</b>
          <q-list dense>
            <q-item v-for="(val, idx) in status.info" :key="`info-${idx}`">
              <q-item-section>{{ val }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>
    </div>
  </CardWrapper>
</template>
