<script lang="ts">
import { objectStringSorter } from '@/helpers/functional';
import { arrangementValues, arrangements } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class ArrangementWizardPicker extends Vue {
  arrangementId: string = '';
  searchModel: string = '';

  get wizardOptions() {
    return arrangementValues(this.$store)
      .filter(arr => !!arr.wizard)
      .map(arr => ({
        label: arr.displayName,
        value: arr.id,
      }))
      .sort(objectStringSorter('label'));
  }

  get wizardComponent() {
    if (!this.arrangementId) {
      return null;
    }
    return arrangements(this.$store)[this.arrangementId].wizard;
  }

  close() {
    this.$emit('close');
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar class="unpadded">
      <q-toolbar-title>Create new arrangement</q-toolbar-title>
      <q-btn v-close-popup flat rounded label="close"/>
    </q-toolbar>

    <!-- display wizard -->
    <component
      v-if="wizardComponent"
      :is="wizardComponent"
      :feature-id="arrangementId"
      @close="close"
    />

    <!-- Select a wizard -->
    <q-card v-else dark>
      <q-card-main>
        <q-list no-border>
          <q-item dark>
            <q-search v-model="searchModel" placeholder="Search"/>
          </q-item>
        </q-list>
        <q-list link inset-separator no-border>
          <q-item
            v-for="opt in wizardOptions"
            :key="opt.label"
            icon="widgets"
            @click.native="arrangementId = opt.value"
          >
            <q-item-main>
              <q-item-tile label>{{ opt.label }}</q-item-tile>
            </q-item-main>
            <q-item-side right icon="chevron_right"/>
          </q-item>
        </q-list>
      </q-card-main>
    </q-card>
  </div>
</template>
