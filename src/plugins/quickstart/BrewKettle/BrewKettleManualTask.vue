<script lang="ts">
import { Component } from 'vue-property-decorator';

import QuickStartTaskBase from '../components/QuickStartTaskBase';
import { BrewKettleConfig } from './types';


@Component
export default class BrewKettleManualTask extends QuickStartTaskBase<BrewKettleConfig> {
  mounted(): void {
    this.executePrepared();
  }

  done(): void {
    this.$router.push(`/dashboard/${this.config.dashboardId}`);
    this.finish();
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item>
        <big>About your new dashboard</big>
      </q-item>
      <q-item>
        <q-item-section>
          <p>
            While the wizard is configuring the Spark and your new dashboard,
            here is a quick explanation of what we set up.
          </p>
          <p>
            We did not put every controller block on your new dashboard.
            You can find all blocks and their relations on the Spark controller service page.
          </p>
          <p>
            On your new dashboard, you will find:
            <ul>
              <li>A graphical representation of your setup. Parts are clickable for quick access to settings.</li>
              <li>A graph with the most important metrics.</li>
              <li>Actions that reconfigure your blocks for different behavior.</li>
            </ul>
          </p>
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn
        :loading="busyExecuting"
        unelevated
        label="Go to dashboard"
        color="primary"
        @click="done"
      >
        <q-tooltip v-if="busyExecuting">
          Creating everything...
        </q-tooltip>
      </q-btn>
    </template>
  </ActionCardBody>
</template>
