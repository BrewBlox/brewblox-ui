<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import providerStore from '@/store/providers';
import { serviceIds } from '@/store/services/getters';
import isString from 'lodash/isString';
import { objectStringSorter } from '@/helpers/functional';

@Component
export default class ServiceWizardPicker extends Vue {
  $q: any;
  serviceId: string | null = null;
  serviceTitle: string | null = null;
  serviceTypeModel: any = null;
  serviceWizardActive: boolean = false;

  get wizardOptions() {
    return providerStore.providerIds
      .map(id => ({
        label: providerStore.displayNameById(id),
        value: providerStore.wizardById(id),
      }))
      .filter(opt => opt.value)
      .sort(objectStringSorter('label'));
  }

  get serviceIdRules(): InputRule[] {
    return [
      v => !!v || 'ID is required',
      v => !serviceIds(this.$store).includes(v) || 'ID must be unique',
    ];
  }

  setTitle(title: string) {
    this.$emit('title', title);
  }

  reset() {
    this.serviceWizardActive = false;
    this.setTitle('Service wizard');
  }

  back() {
    this.$emit('back');
  }

  close() {
    this.$emit('close');
  }

  next() {
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

  mounted() {
    this.reset();
    this.serviceTypeModel = this.wizardOptions[0];
  }
}
</script>

<template>
  <div>
    <!-- Display selected wizard -->
    <component
      v-if="serviceWizardActive"
      :is="serviceTypeModel.value"
      :service-id="serviceId"
      :service-title="serviceTitle"
      @title="setTitle"
      @back="reset"
      @close="close"
    />

    <!-- Select a wizard -->
    <template v-else>
      <q-card-section>
        <q-item dark>
          <q-item-section>
            <q-select
              :options="wizardOptions"
              v-model="serviceTypeModel"
              label="Service type"
              dark
              options-dark
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-input v-model="serviceId" :rules="serviceIdRules" label="Service ID" dark lazy-rules>
              <template v-slot:append>
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
        <q-item dark>
          <q-item-section>
            <q-input v-model="serviceTitle" label="Service title" dark>
              <template v-slot:append>
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

      <q-separator dark/>

      <q-card-actions class="row justify-between">
        <q-btn unelevated label="Back" @click="back"/>
        <q-btn unelevated label="Next" color="primary" @click="next"/>
      </q-card-actions>
    </template>
  </div>
</template>
