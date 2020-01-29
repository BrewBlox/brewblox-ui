<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { objectStringSorter, ruleErrorFinder } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';

@Component
export default class ServiceWizardPicker extends Vue {
  serviceId: string | null = null;
  serviceTitle: string | null = null;
  serviceTypeModel: any = null;
  serviceWizardActive = false;

  mounted(): void {
    this.reset();
    this.serviceTypeModel = this.wizardOptions[0];
  }

  get wizardOptions(): SelectOption[] {
    return featureStore.serviceValues
      .filter(feature => feature.wizard !== undefined)
      .map(feature => ({
        label: feature.title,
        value: feature.wizard,
      }))
      .sort(objectStringSorter('label'));
  }

  get serviceIdRules(): InputRule[] {
    return [
      v => !!v || 'ID is required',
      v => !serviceStore.serviceIds.includes(v) || 'ID must be unique',
    ];
  }

  setTitle(title: string): void {
    this.$emit('title', title);
  }

  reset(): void {
    this.serviceWizardActive = false;
    this.setTitle('Service wizard');
  }

  back(): void {
    this.$emit('back');
  }

  close(): void {
    this.$emit('close');
  }

  next(): void {
    const err = ruleErrorFinder(this.serviceIdRules)(this.serviceId);

    if (err) {
      notify.error(err);
      return;
    }

    this.serviceTitle = this.serviceTitle || this.serviceId;
    this.serviceWizardActive = true;
  }
}
</script>

<template>
  <!-- Display selected wizard -->
  <component
    :is="serviceTypeModel.value"
    v-if="serviceWizardActive"
    :service-id="serviceId"
    :service-title="serviceTitle"
    @title="setTitle"
    @back="reset"
    @close="close"
  />

  <!-- Select a wizard -->
  <ActionCardBody v-else>
    <q-card-section @keyup.ctrl.enter="next">
      <q-item>
        <q-item-section>
          <q-select
            v-model="serviceTypeModel"
            :options="wizardOptions"
            label="Service type"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-input v-model="serviceId" :rules="serviceIdRules" label="Service ID" lazy-rules>
            <template #append>
              <q-icon name="mdi-information">
                <q-tooltip>
                  The Service ID is how the service is contacted.
                  <br>This should match the ID in docker-compose.
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-input v-model="serviceTitle" label="Service title">
            <template #append>
              <q-icon name="mdi-information">
                <q-tooltip>
                  The Service title is how the service is displayed in the UI.
                  <br>This choice is purely graphical: pick a name that makes sense to you.
                  <br>If left empty, the service ID will be used.
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn unelevated label="Next" color="primary" @click="next" />
    </template>
  </ActionCardBody>
</template>
