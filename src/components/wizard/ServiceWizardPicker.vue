<script lang="ts">
import isString from 'lodash/isString';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import { providerStore } from '@/store/providers';
import { serviceStore } from '@/store/services';

@Component
export default class ServiceWizardPicker extends Vue {
  serviceId: string | null = null;
  serviceTitle: string | null = null;
  serviceTypeModel: any = null;
  serviceWizardActive = false;

  get wizardOptions(): SelectOption[] {
    return providerStore.providerIds
      .map(id => ({
        label: providerStore.displayName(id),
        value: providerStore.wizard(id),
      }))
      .filter(opt => opt.value)
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
    const errors = this.serviceIdRules
      .map(rule => rule(this.serviceId))
      .filter(isString);

    if (errors.length > 0) {
      this.$q.notify({
        message: errors.join(', '),
        color: 'negative',
        icon: 'error',
      });
      return;
    }

    this.serviceTitle = this.serviceTitle || this.serviceId;
    this.serviceWizardActive = true;
  }

  mounted(): void {
    this.reset();
    this.serviceTypeModel = this.wizardOptions[0];
  }
}
</script>

<template>
  <div>
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
    <template v-else>
      <q-card-section>
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

      <q-separator />

      <q-card-actions class="row justify-between">
        <q-btn unelevated label="Back" @click="back" />
        <q-btn unelevated label="Next" color="primary" @click="next" />
      </q-card-actions>
    </template>
  </div>
</template>
