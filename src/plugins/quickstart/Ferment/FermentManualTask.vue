<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '../components/WizardTaskBase';
import { FermentConfig } from './types';


@Component
export default class FermentManualTask extends WizardTaskBase<FermentConfig> {
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
  <div>
    <q-card-section>
      <q-item dark>
        <big>About your new fermentation dashboard</big>
      </q-item>
      <q-item dark class="text-weight-light">
        <q-item-section>
          <p>
            While the wizard is configuring the Spark and your new dashboard,
            here is a quick explanation of what we set up.
            <span>
              Visit our
              <a
                href="https://brewblox.netlify.com/user/ferment_guide.html"
                target="_blank"
                style="color: white"
              >documentation page</a> for a more in-depth guide.
            </span>
          </p>
          <p>
            On the controller we created two PIDs to drive the heater and the cooler.
            <br>The input to both will either be the
            <i>Fridge Setpoint</i> or the
            <i>Beer Setpoint</i>.
          </p>
          <p>
            We did not put every controller block on your new dashboard.
            You can find all blocks and their relations on the Spark controller service page.
          </p>
          <p>
            On your new dashboard, you will find:
            <ul>
              <li>A graphical representation of your fridge. Parts are clickable for quick access to settings.</li>
              <li>A graph with the most important metrics.</li>
              <li>A temperature profile that can slowly change a setpoint over time.</li>
              <li>Actions that reconfigure your blocks for different behavior.</li>
            </ul>
          </p>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark />

    <q-card-actions>
      <q-space />
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
    </q-card-actions>
  </div>
</template>
