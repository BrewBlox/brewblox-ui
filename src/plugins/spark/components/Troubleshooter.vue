<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { sparkStore } from '@/plugins/spark/store';
import { SystemStatus } from '@/plugins/spark/types';

@Component
export default class Troubleshooter extends Vue {
  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get lastStatus(): SystemStatus | null {
    return sparkStore.lastStatus(this.serviceId);
  }

  get textAvailable(): string {
    return this.lastStatus && this.lastStatus.available
      ? 'Service running'
      : 'Unable to connect to service';
  }

  get textConnect(): string {
    return this.lastStatus && this.lastStatus.connect
      ? 'Service connected to controller'
      : 'Service not connected to controller';
  }

  get textHandshake(): string {
    return this.lastStatus && this.lastStatus.handshake
      ? 'Handshake performed'
      : 'Handshake not performed';
  }

  get textCompatible(): string {
    return this.lastStatus && this.lastStatus.compatible
      ? 'Firmware compatible'
      : 'Firmware not compatible';
  }

  get textSynchronize(): string {
    return this.lastStatus && this.lastStatus.synchronize
      ? 'Service synchronized'
      : 'Service not synchronized';
  }

  refresh(): void {
    sparkStore.fetchServiceStatus(this.serviceId)
      .then(() => sparkStore.createUpdateSource(this.serviceId))
      .catch(() => { });
  }

  iconName(val: boolean): string {
    return val ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline';
  }

  iconColor(val: boolean): string {
    return val ? 'positive' : 'negative';
  }
}
</script>

<template>
  <q-card dark class="text-white scroll" style="max-width: 500px">
    <Toolbar :title="serviceId" subtitle="Troubleshooter">
      <q-item-section class="dense" side>
        <q-btn unelevated label="force refresh" color="primary" icon="refresh" @click="refresh" />
      </q-item-section>
    </Toolbar>

    <q-card-section>
      <template v-if="lastStatus">
        <q-item dark>
          <q-item-section avatar>
            <q-spinner size="24px" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>
              Last update
            </q-item-label>
            <big>{{ lastStatus.checkedAt.toLocaleString() }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section avatar>
            <q-icon
              :name="iconName(lastStatus.available)"
              :color="iconColor(lastStatus.available)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>{{ textAvailable }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section avatar>
            <q-icon
              :name="iconName(lastStatus.connect)"
              :color="iconColor(lastStatus.connect)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>{{ textConnect }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section avatar>
            <q-icon
              :name="iconName(lastStatus.handshake)"
              :color="iconColor(lastStatus.handshake)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>{{ textHandshake }}</q-item-section>
        </q-item>
        <!-- Only show after handshake -->
        <q-item v-if="lastStatus.handshake" dark>
          <q-item-section avatar>
            <q-icon
              :name="iconName(lastStatus.compatible)"
              :color="iconColor(lastStatus.compatible)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>{{ textCompatible }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section avatar>
            <q-icon
              :name="iconName(lastStatus.synchronize)"
              :color="iconColor(lastStatus.synchronize)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>{{ textSynchronize }}</q-item-section>
        </q-item>
      </template>
    </q-card-section>

    <q-card-section v-if="lastStatus">
      <q-item>
        <q-item-section>
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
          <!-- waiting handshake -->
          <span v-else-if="!lastStatus.handshake">
            Your Spark service is waiting for the controller handshake.
            <br />
            <b>This status is usually temporary</b>
          </span>
          <!-- not compatible -->
          <span v-else-if="!lastStatus.compatible">
            Your Spark service is not compatible with the firmware
            <br />
            <b>Please run brewblox-ctl update</b>
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
        </q-item-section>
      </q-item>
      <template v-if="(lastStatus.info || []).length > 0">
        <q-separator dark inset />
        <q-item dark>
          <q-item-section>
            <b>Service info:</b>
          </q-item-section>
        </q-item>
        <q-list dense>
          <q-item v-for="(val, idx) in lastStatus.info" :key="idx" dark>
            <q-item-section>{{ val }}</q-item-section>
          </q-item>
        </q-list>
      </template>
    </q-card-section>
  </q-card>
</template>
