<script lang="ts">
import isString from 'lodash/isString';
import { Dialog, uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';
import providerStore from '@/store/providers';


@Component
export default class BlockWizard extends Vue {
  filteredOptions: any[] = [];
  feature: any = null;
  blockId: string = '';
  block: Block | null = null;
  widget: DashboardItem | null = null;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get blockIdRules() {
    return [
      v => !!v || 'Name must not be empty',
      v => !sparkStore.blockIds(this.serviceId).includes(v) || 'Name must be unique',
      v => v.match(/^[a-zA-Z]/) || 'Name must start with a letter',
      v => v.match(/^[a-zA-Z0-9 \(\)_\-\|]*$/) || 'Name may only contain letters, numbers, spaces, and ()-_|',
      v => v.length < 200 || 'Name must be less than 200 characters',
    ];
  }

  get createReady() {
    return !!this.feature && !this.blockIdRules.some(rule => isString(rule(this.blockId)));
  }

  get wizardOptions() {
    return providerStore.featuresById('Spark')
      .map(id => ({
        label: featureStore.displayNameById(id),
        value: id,
      }))
      .filter(opt => featureStore.wizardById(opt.value) === 'BlockWidgetWizard')
      .sort(objectStringSorter('label'));
  }

  filterFn(val, update) {
    if (val === '') {
      update(() => this.filteredOptions = this.wizardOptions);
      return;
    }

    update(() => {
      const needle = val.toLowerCase();
      this.filteredOptions = this.wizardOptions
        .filter(opt => opt.label.toLowerCase().match(needle));
    });
  }

  ensureLocalBlock() {
    const typeId = this.feature.value;
    this.widget = this.widget || {
      id: uid(),
      title: this.blockId,
      feature: typeId,
      dashboard: '',
      order: 0,
      config: {
        serviceId: this.serviceId,
        blockId: this.blockId,
      },
      ...featureStore.widgetSizeById(typeId),
    };
    this.block = this.block || {
      id: this.blockId,
      serviceId: this.serviceId,
      type: typeId,
      groups: [0],
      data: sparkStore.specs[typeId].generate(),
    };
  }

  changeBlockId(newId: string) {
    const errors = this.blockIdRules
      .map(rule => rule(newId))
      .filter(isString);

    if (errors.length > 0) {
      this.$q.notify({
        message: errors.join(', '),
        color: 'negative',
        icon: 'error',
      });
      return;
    }
    this.blockId = newId;
    (this.block as Block).id = newId;
  }

  configureBlock() {
    this.ensureLocalBlock();
    Dialog.create({
      component: 'BlockFormDialog',
      block: this.block,
      widget: this.widget,
      saveBlock: v => this.block = v,
      saveWidget: v => this.widget = v,
      volatile: true,
      root: this.$root,
    });
  }

  async createBlock() {
    this.ensureLocalBlock();
    try {
      await sparkStore.createBlock([this.serviceId, this.block as Block]);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Created ${featureStore.displayNameById((this.block as Block).type)} Block '${this.blockId}'`,
      });
    } catch (e) {
      this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to create Block: ${e.toString()}`,
      });
    }
    this.$emit('close');
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>Block wizard</FormToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-select
            v-model="feature"
            :options="filteredOptions"
            :rules="[v => !!v || 'You must select a block type']"
            dark
            use-input
            options-dark
            label="Block Type"
            @filter="filterFn"
            @change="block = null; widget = null;"
          >
            <template v-slot:no-option>
              <q-item dark>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-input v-model="blockId" :rules="blockIdRules" dark label="Block name">
            <template v-slot:append>
              <q-icon name="mdi-information">
                <q-tooltip>
                  The name of the Spark Controller Block.
                  <br>Multiple widgets can display the same Block.
                  <br>Rules:
                  <ul>
                    <li>The name must not be empty.</li>
                    <li>The name must be unique.</li>
                    <li>The name must begin with a letter (a-z).</li>
                    <li>The name must not contain brackets ([]&lt;&gt;).</li>
                    <li>The name must be less than 200 characters.</li>
                  </ul>
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions align="right">
      <q-btn
        :disable="!createReady"
        unelevated
        label="Configure"
        color="primary"
        @click="configureBlock"
      />
      <q-btn
        :disable="!createReady"
        unelevated
        label="Create"
        color="primary"
        @click="createBlock"
      />
    </q-card-actions>
  </q-card>
</template>
