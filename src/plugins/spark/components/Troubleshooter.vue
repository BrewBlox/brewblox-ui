<script lang="ts">
import Component from 'vue-class-component';
import WidgetBase from '@/components/Widget/WidgetBase';
import { fetchServiceStatus, createUpdateSource } from '@/plugins/spark/store/actions';
import { lastStatus } from '@/plugins/spark/store/getters';
import { SystemStatus } from '@/plugins/spark/state';

@Component
export default class Troubleshooter extends WidgetBase {
  get serviceId() {
    return this.$props.config.serviceId;
  }

  get lastStatus(): SystemStatus {
    return lastStatus(this.$store, this.serviceId);
  }

  refresh() {
    fetchServiceStatus(this.$store, this.serviceId)
      .then(() => createUpdateSource(this.$store, this.serviceId))
      .catch(() => { });
  }

  iconName(val: boolean) {
    return val ? 'check_circle' : 'error_outline';
  }

  iconColor(val: boolean) {
    return val ? 'positive' : 'negative';
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-card-title class="title-bar">Troubleshooter
      <q-btn slot="right" flat round dense icon="refresh" @click="refresh"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column">
      <q-btn
        v-if="!lastStatus"
        label="Check"
        style="margin: auto"
        color="primary"
        @click="refresh"
      />
      <div v-if="lastStatus" class="full-width">
        <q-field label="last checked">
          <big>{{ lastStatus.checkedAt.toLocaleString() }}</big>
        </q-field>
        <q-field label="Service running">
          <q-icon
            :name="iconName(lastStatus.available)"
            :color="iconColor(lastStatus.available)"
            size="24px"
          />
        </q-field>
        <q-field label="Controller connected">
          <q-icon
            :name="iconName(lastStatus.connected)"
            :color="iconColor(lastStatus.connected)"
            size="24px"
          />
        </q-field>
        <q-field label="Service ready">
          <q-icon
            :name="iconName(lastStatus.synchronized)"
            :color="iconColor(lastStatus.synchronized)"
            size="24px"
          />
        </q-field>
      </div>
    </q-card-main>
    <q-card-main v-if="lastStatus" class="column">
      <!-- not available -->
      <span v-if="!lastStatus.available">Your Spark service is offline.
        <ul>
          <li>Is your backend reachable?</li>
          <li>Is the container present in your docker-compose file?</li>
          <li>Is the container running?</li>
        </ul>
      </span>
      <!-- not connected -->
      <span
        v-else-if="!lastStatus.connected"
      >Your Spark service is online, but not connected to your controller.
        <ul>
          <li>Is your controller turned on?</li>
          <li>Does your controller have the correct firmware?</li>
          <li>WiFi: Does your controller display its IP address?</li>
          <li>Are there any error messages in your service logs?</li>
          <li>USB: Your service must have been (re)started after plugging in the USB cable.</li>
          <li>USB: Can your service access USB devices? (issue for mac hosts)</li>
        </ul>
      </span>
      <!-- not synchronized -->
      <span
        v-else-if="!lastStatus.synchronized"
      >Your Spark service is connected to your controller, but not synchronized.
        <ul>
          <li>Is your datastore container running?</li>
          <li>Are there any error messages in your service container logs?</li>
          <li>Does your controller have the correct firmware?</li>
        </ul>
      </span>
    </q-card-main>
  </q-card>
</template>
