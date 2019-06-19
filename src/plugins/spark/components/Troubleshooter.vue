<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store';
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

  get textConnected(): string {
    return this.lastStatus && this.lastStatus.connected
      ? 'Service connected to controller'
      : 'Service not connected to controller';
  }

  get textMatched(): string {
    return this.lastStatus && this.lastStatus.matched
      ? 'Service compatible with firmware'
      : 'Service incompatible with firmware';
  }

  get textSynchronized(): string {
    return this.lastStatus && this.lastStatus.synchronized
      ? 'Service synchronized'
      : 'Service not synchronized';
  }

  refresh() {
    sparkStore.fetchServiceStatus(this.serviceId)
      .then(() => sparkStore.createUpdateSource(this.serviceId))
      .catch(() => { });
  }

  iconName(val: boolean) {
    return val ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline';
  }

  iconColor(val: boolean) {
    return val ? 'positive' : 'negative';
  }
}
</script>

<template>
  <q-card dark class="text-white scroll" style="max-width: 500px">
    <WidgetToolbar :title="serviceId" subtitle="Troubleshooter">
      <q-item-section class="dense" side>
        <q-btn unelevated label="force refresh" color="primary" icon="refresh" @click="refresh"/>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <template v-if="lastStatus">
        <q-item dark>
          <q-item-section avatar>
            <q-spinner size="24px"/>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Last update</q-item-label>
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
              :name="iconName(lastStatus.connected)"
              :color="iconColor(lastStatus.connected)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>{{ textConnected }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section avatar>
            <q-icon
              :name="iconName(lastStatus.matched)"
              :color="iconColor(lastStatus.matched)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>{{ textMatched }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section avatar>
            <q-icon
              :name="iconName(lastStatus.synchronized)"
              :color="iconColor(lastStatus.synchronized)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>{{ textSynchronized }}</q-item-section>
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
          <span v-else-if="!lastStatus.connected">
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
          <!-- not matched -->
          <span v-else-if="!lastStatus.matched">
            Your Spark service is connected to your controller, but is not compatible.
            <br>
            <b>Run brewblox-ctl update to update your system.</b>
          </span>
          <!-- not synchronized -->
          <span v-else-if="!lastStatus.synchronized">
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
      <template v-if="lastStatus.issues.length > 0">
        <q-separator dark inset/>
        <q-item dark>
          <q-item-section>
            <b>Service issues:</b>
          </q-item-section>
        </q-item>
        <q-list dense>
          <q-item v-for="(issue, idx) in lastStatus.issues" :key="idx" dark>
            <q-item-section>{{ issue }}</q-item-section>
          </q-item>
        </q-list>
      </template>
    </q-card-section>
  </q-card>
</template>
