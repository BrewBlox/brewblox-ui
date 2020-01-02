<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '../components/WizardTaskBase';
import { RimsConfig } from './types';


@Component
export default class RimsManualTask extends WizardTaskBase<RimsConfig> {
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
  <WizardCard>
    <q-card-section>
      <q-item>
        <big>About your new RIMS dashboard</big>
      </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            While the wizard is configuring the Spark and your new dashboard,
            here is a quick explanation of what we set up.
            <!-- <span>
              Visit our
              <a
                href="https://brewblox.netlify.com/user/rims_guide.html"
                target="_blank"
                style="color: white"
              >documentation page</a> for a more in-depth guide.
            </span> -->
          </p>
          <p>
            On the controller we created two PIDs to dynamically control the tube heater element.
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
              <li>Actions that reconfigure your blocks for the various brewing steps.</li>
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
  </WizardCard>
</template>
