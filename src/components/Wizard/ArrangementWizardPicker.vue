<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import { featureStore } from '@/store/features';

@Component
export default class ArrangementWizardPicker extends Vue {
  arrangementId = '';
  searchModel = '';
  wizardModel: any = null;
  wizardActive = false;

  get wizardOptions() {
    return featureStore.arrangementValues
      .filter(arr => !!arr.wizard)
      .sort(objectStringSorter('displayName'));
  }

  setTitle(title: string) {
    this.$emit('title', title);
  }

  reset() {
    this.wizardActive = false;
    this.setTitle('Arrangement wizard');
  }

  back() {
    this.$emit('back');
  }

  close() {
    this.$emit('close');
  }

  next() {
    if (!this.wizardModel) {
      this.$q.notify({
        message: 'Please select a wizard',
        color: 'negative',
        icon: 'error',
      });
      return;
    }
    this.setTitle(`${this.wizardModel.displayName} wizard`);
    this.wizardActive = true;
  }

  mounted() {
    this.reset();
    this.wizardModel = this.wizardOptions[0];
  }
}
</script>

<template>
  <div>
    <!-- Display selected wizard -->
    <component
      :is="wizardModel.wizard"
      v-if="wizardActive"
      :feature-id="wizardModel.id"
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
              v-model="wizardModel"
              :options="wizardOptions"
              label="Arrangement type"
              option-label="displayName"
              option-value="id"
              dark
              options-dark
            />
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark />

      <q-card-actions class="row justify-between">
        <q-btn unelevated label="Back" @click="back" />
        <q-btn unelevated label="Next" color="primary" @click="next" />
      </q-card-actions>
    </template>
  </div>
</template>
