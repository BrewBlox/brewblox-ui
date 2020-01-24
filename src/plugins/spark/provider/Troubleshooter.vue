<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { sparkStore } from '@/plugins/spark/store';
import { SystemStatus } from '@/plugins/spark/types';
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

  get lastStatus(): SystemStatus | null {
    return sparkStore.lastStatus(this.serviceId);
  }

  get textAvailable(): string {
    return this.lastStatus?.available
      ? 'Service running'
      : 'Unable to connect to service';
  }

  get textConnect(): string {
    return this.lastStatus?.connect
      ? 'Service connected to controller'
      : 'Service not connected to controller';
  }

  get textHandshake(): string {
    return this.lastStatus?.handshake
      ? 'Handshake performed'
      : 'Handshake not performed';
  }

  get textCompatible(): string {
    return this.lastStatus?.compatible
      ? 'Firmware compatible'
      : 'Firmware not compatible';
  }

  get textValid(): string {
    return this.lastStatus?.valid
      ? 'Valid device ID'
      : 'Invalid device ID';
  }

  get textSynchronize(): string {
    return this.lastStatus?.synchronize
      ? 'Service synchronized'
      : 'Service not synchronized';
  }

  refresh(): void {
    sparkStore.fetchServiceStatus(this.serviceId)
      .then(() => sparkStore.createUpdateSource(this.serviceId))
      .catch(() => { });
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

    <div v-if="lastStatus" class="widget-body row items-center">
      <q-spinner
        size="24px"
        class="col-auto self-center"
      />
      <LabeledField
        label="Last update"
        tag="big"
        class="col-grow"
      >
        {{ lastStatus.checkedAt.toLocaleString() }}
      </LabeledField>

      <div class="col-break" />
      <q-icon v-bind="iconProps(lastStatus.available)" />
      <div>
        {{ textAvailable }}
      </div>

      <div class="col-break" />
      <q-icon v-bind="iconProps(lastStatus.connect)" />
      <div>
        {{ textConnect }}
      </div>

      <div class="col-break" />
      <q-icon v-bind="iconProps(lastStatus.handshake)" />
      <div>
        {{ textHandshake }}
      </div>

      <template v-if="lastStatus.handshake">
        <div class="col-break" />
        <q-icon v-bind="iconProps(lastStatus.compatible)" />
        <div>
          {{ textCompatible }}
        </div>

        <div class="col-break" />
        <q-icon v-bind="iconProps(lastStatus.valid)" />
        <div>
          {{ textValid }}
        </div>
      </template>

      <div class="col-break" />
      <q-icon v-bind="iconProps(lastStatus.synchronize)" />
      <div>
        {{ textSynchronize }}
      </div>

      <div class="col-break" />
      <div class="col">
        <!-- not available -->
        <span v-if="!lastStatus.available">
          Your Spark service is offline.
          <ul>
            <li>Is your backend reachable?</li>
            <li>Is the container present in your docker-compose file?</li>
            <li>Is the container running?</li>
          </ul>
        </span>
        <!-- not connected -->
        <span v-else-if="!lastStatus.connect">
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
        <span v-else-if="!lastStatus.handshake">
          Your Spark service is waiting for the controller handshake.
          <br>
          <b>This status is usually temporary</b>
        </span>
        <!-- not compatible -->
        <span v-else-if="!lastStatus.compatible">
          Your Spark service is not compatible with the firmware
          <br>
          <b>Please run brewblox-ctl update</b>
        </span>
        <!-- not valid -->
        <span v-else-if="!lastStatus.valid">
          The controller device ID doesn't match the service <i>--device-id</i> setting.
          <br>
          <b>Please check your connection settings</b>
        </span>
        <!-- not synchronized -->
        <span v-else-if="!lastStatus.synchronize">
          Your Spark service is connected to your controller, but not yet synchronized.
          <b>This status is usually temporary.</b>
          <ul>
            <li>Is your datastore container running?</li>
            <li>Are there any error messages in your service container logs?</li>
            <li>Does your controller have the correct firmware?</li>
          </ul>
        </span>
      </div>

      <template v-if="(lastStatus.info || []).length > 0">
        <div class="col-break" />
        <div class="col">
          <b>Service info:</b>
          <q-list dense>
            <q-item v-for="(val, idx) in lastStatus.info" :key="`info-${idx}`">
              <q-item-section>{{ val }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>
    </div>
  </CardWrapper>
</template>
