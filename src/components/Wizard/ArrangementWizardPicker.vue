<script lang="ts">
import { objectStringSorter } from '@/helpers/functional';
import { arrangementValues, arrangements } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class ArrangementWizardPicker extends Vue {
  $q: any;
  arrangementId: string = '';
  searchModel: string = '';
  wizardModel: any = null;
  wizardActive: boolean = false;

  get wizardOptions() {
    return arrangementValues(this.$store)
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
      v-if="wizardActive"
      :is="wizardModel.wizard"
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
              label="Arrangement type"
              :options="wizardOptions"
              v-model="wizardModel"
              option-label="displayName"
              dark
              options-dark
            />
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark/>

      <q-card-actions>
        <q-btn unelevated label="Back" class="full-width" @click="back"/>
        <q-btn unelevated label="Next" color="primary" class="full-width q-mt-sm" @click="next"/>
      </q-card-actions>
    </template>
  </div>
</template>
