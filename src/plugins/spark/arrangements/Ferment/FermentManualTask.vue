<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';

import { FermentConfig } from './types';


@Component
export default class FermentManualTask extends WizardTaskBase {
  readonly config!: FermentConfig;

  mounted() {
    this.executePrepared();
  }

  done() {
    this.$router.push(`/dashboard/${this.config.dashboardId}`);
    this.finish();
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <big>How to use</big>
      </q-item>
      <q-item dark>
        <q-item-section>
          <p>
            While the wizard is busy creating all your widgets and blocks,
            here are some pointers on how you can use them.
            <span>
              Visit our
              <a
                href="https://brewblox.netlify.com/user/ferment_guide.html"
                target="_blank"
              >documentation page</a> for a more in-depth guide.
            </span>
          </p>
          <p>
            The controller can either use the
            <b>Fridge Setpoint</b>, or the
            <b>Beer Setpoint</b>.
            You can switch between these modes using the
            <b>Action widget</b>.
          </p>
          <p>
            You can configure setpoints and PIDs by clicking on them in the
            <b>Ferment Fridge</b>.
          </p>
          <p>
            You can use the
            <b>Temperature Profile</b> to slowly change the setpoint.
          </p>
          <p>
            In the
            <b>Spark Service page</b> you can view all blocks and how they relate.
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
        <q-tooltip v-if="busyExecuting">Creating everything...</q-tooltip>
      </q-btn>
    </q-card-actions>
  </div>
</template>
