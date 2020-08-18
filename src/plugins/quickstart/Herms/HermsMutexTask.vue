<script lang="ts">
import { Component } from 'vue-property-decorator';

import QuickStartTaskBase from '../components/QuickStartTaskBase';
import { HermsConfig } from './types';


@Component
export default class HermsMutexTask extends QuickStartTaskBase<HermsConfig> {
  mutex = true;

  done(): void {
    this.config.mutex = this.mutex;
    this.updateConfig(this.config);
    this.next();
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Heating elements configuration
          </q-item-label>
          <p>We will create PWM blocks to modulate the power of your heating elements.</p>
          <p>
            If you cannot run both heating elements at the same time,
            because the total available power is limited, we can configure constraints to:
            <ul>
              <li>Prevent turning on both elements at any time <i>(Mutually exclusive)</i></li>
              <li>Divide the time fairly between them when heating both kettles <i>(Balanced)</i></li>
            </ul>
          </p>
          <p class="text-weight-regular">
            Turn ON the setting below if the running both elements at the same time would trip a fuse.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-toggle v-model="mutex" class="q-mx-auto" left-label label="Mutually exclusive heaters" />
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn unelevated label="Next" color="primary" @click="done" />
    </template>
  </ActionCardBody>
</template>
