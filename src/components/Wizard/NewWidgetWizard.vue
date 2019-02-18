<script lang="ts">
import { objectStringSorter } from '@/helpers/functional';
import { DashboardItem } from '@/store/dashboards/state';
import {
  displayNameById,
  featureIds,
  wizardById,
} from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    onCreate: {
      type: Function,
      required: true,
    },
  },
})
export default class NewWidgetWizard extends Vue {
  featureId: string = '';
  searchModel: string = '';

  get wizardOptions() {
    return featureIds(this.$store)
      .map(id => ({
        label: displayNameById(this.$store, id),
        value: id,
      }))
      .filter(opt =>
        wizardById(this.$store, opt.value)
        && opt.label.toLowerCase().match(this.searchModel.toLowerCase()))
      .sort(objectStringSorter('label'));
  }

  get wizardComponent() {
    return wizardById(this.$store, this.featureId);
  }

  selectFeature(id: string) {
    this.featureId = id;
  }

  create(partial: Partial<DashboardItem>) {
    this.$props.onCreate(partial);
    this.reset();
  }

  reset() {
    this.featureId = '';
    this.searchModel = '';
  }

  mounted() {
    this.reset();
  }
}
</script>

<template>
  <div class="widget-modal column">
    <!-- display wizard -->
    <q-card v-if="wizardComponent">
      <component
        v-if="wizardComponent"
        :is="wizardComponent"
        :feature-id="featureId"
        :on-create="create"
        :on-cancel="reset"
      />
    </q-card>
    <!-- Select a wizard -->
    <q-card v-else dark>
      <q-card-title>Create new widget
        <q-btn v-close-overlay slot="right" flat dense icon="clear" label="Cancel"/>
      </q-card-title>
      <q-card-main>
        <q-list no-border>
          <q-item>
            <q-search v-model="searchModel" placeholder="Search"/>
          </q-item>
        </q-list>
        <q-list link inset-separator no-border>
          <q-item
            v-for="opt in wizardOptions"
            :key="opt.label"
            icon="widgets"
            @click.native="() => { featureId = opt.value; }"
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
