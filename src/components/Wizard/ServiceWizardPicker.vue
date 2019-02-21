<script lang="ts">
import {
  displayNameById,
  providerIds,
  wizardById,
} from '@/store/providers/getters';
import { createService, initService } from '@/store/services/actions';
import { serviceIds } from '@/store/services/getters';
import { Service } from '@/store/services/state';
import { Notify } from 'quasar';
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';

@Component
export default class ServiceWizardPicker extends Vue {
  serviceId: string = '';
  serviceTitle: string = '';
  searchModel: string = '';
  serviceWizard: VueConstructor | null = null;

  get wizardOptions() {
    return providerIds(this.$store)
      .map(id => ({
        label: displayNameById(this.$store, id),
        value: wizardById(this.$store, id),
      }))
      .filter(opt => opt.value && opt.label.match(this.searchModel));
  }

  get existingIds() {
    return serviceIds(this.$store);
  }

  get serviceIdError() {
    if (!this.serviceId) {
      return 'ID must not be empty';
    }
    if (this.existingIds.includes(this.serviceId)) {
      return 'ID must be unique';
    }
    return null;
  }

  get serviceTitleError() {
    if (!this.serviceTitle) {
      return 'Title must not be empty';
    }
    return null;
  }

  get serviceWizardActive() {
    return this.serviceWizard !== null;
  }

  get wizardComponent() {
    return this.serviceWizard;
  }

  set wizardComponent(component: VueConstructor | null) {
    this.serviceWizard = component;
  }

  selectFeature(wizard: VueConstructor) {
    const err = [this.serviceIdError, this.serviceTitleError].find(e => !!e);
    if (err) {
      Notify.create(err);
      return;
    }
    this.wizardComponent = wizard;
  }

  async onCreate(partial: Partial<Service>) {
    const service: Service = {
      id: this.serviceId,
      title: this.serviceTitle,
      order: this.existingIds.length + 1,
      config: {},
      type: 'Unknown',
      ...partial,
    };
    await createService(this.$store, service);
    await initService(this.$store, service);
    this.reset();
    Notify.create({
      type: 'positive',
      message: `Added ${displayNameById(this.$store, service.type)} "${service.title}"`,
    });
  }

  onCancel(message: string) {
    this.wizardComponent = null;
    Notify.create({ message });
  }

  reset() {
    this.serviceId = '';
    this.serviceTitle = '';
    this.searchModel = '';
    this.wizardComponent = null;
  }

  mounted() {
    this.reset();
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar>
      <span class="col row spaced">New Service Wizard</span>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>

    <!-- Display selected wizard -->
    <component
      v-if="serviceWizardActive"
      :is="serviceWizard"
      :service-id="serviceId"
      :on-create="onCreate"
      :on-cancel="onCancel"
    />

    <!-- Select a wizard -->
    <q-item v-else>
      <q-field label="Service ID" icon="create" orientation="vertical">
        <q-input
          v-model="serviceId"
          :error="serviceIdError !== null"
          :suffix="serviceIdError"
          placeholder="Choose an ID"
        />
      </q-field>
      <q-field label="Service name" icon="create" orientation="vertical">
        <q-input
          v-model="serviceTitle"
          :error="serviceTitleError !== null"
          :suffix="serviceTitleError"
          placeholder="Choose a name"
        />
      </q-field>
      <q-field label="Service type" icon="widgets" orientation="vertical">
        <q-item>
          <q-search v-model="searchModel" placeholder="Search"/>
        </q-item>
        <q-list link inset-separator>
          <q-item
            v-for="opt in wizardOptions"
            :key="opt.label"
            icon="widgets"
            @click.native="selectFeature(opt.value)"
          >
            <div class="row">
              <q-item-main>
                <q-item-tile label>{{ opt.label }}</q-item-tile>
              </q-item-main>
              <q-item-side right icon="chevron_right"/>
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
