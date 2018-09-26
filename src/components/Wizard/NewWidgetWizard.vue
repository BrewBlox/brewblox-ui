<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';
import { Notify } from 'quasar';
import { DashboardItem } from '@/store/dashboards/state';
import { dashboardItemById } from '@/store/dashboards/getters';

import {
  featureIds,
  wizardById,
  displayNameById,
} from '@/store/features/getters';

@Component({
  props: {
    onCreateItem: {
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
        && opt.label.match(this.searchModel));
  }

  get wizardComponent() {
    return wizardById(this.$store, this.featureId);
  }

  selectFeature(id: string) {
    this.featureId = id;
  }

  onCreate(partial: Partial<DashboardItem>) {
    this.$props.onCreateItem(partial);
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
  <div class="layout-padding">

    <!-- display wizard -->
    <q-item v-if="wizardComponent">
      <component
        v-if="wizardComponent"
        :is="wizardComponent"
        :featureId="featureId"
        :onCreateItem="onCreate"
        :onCancel="reset"
      />
    </q-item>

    <!-- Select a wizard -->
    <q-item v-else>

      <q-field
        label="Select a widget type"
        icon="widgets"
        orientation="vertical"
      >
        <q-item>
          <q-search
            v-model="searchModel"
            placeholder="Search"
          />
        </q-item>
        <q-list link inset-separator>
          <q-item
            icon="widgets"
            v-for="opt in wizardOptions"
            :key="opt.label"
            @click.native="() => { featureId = opt.value; }"
          >
            <div class="row">
              <q-item-main>
                <q-item-tile label>{{ opt.label }}</q-item-tile>
              </q-item-main>
              <q-item-side right icon="chevron_right" />
            </div>
          </q-item>
        </q-list>
      </q-field>
    </q-item>

  </div>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}

.q-list {
  border: 0;
}

.q-option-group {
  border: 0;
}

.layout-padding {
  position: relative;
}
</style>
