<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import isString from 'lodash/isString';
import { objectStringSorter } from '@/helpers/functional';
import { Block } from '@/plugins/spark/state';
import { blockIds } from '@/plugins/spark/store/getters';
import {
  displayNameById,
  formById,
  wizardById,
} from '@/store/features/getters';
import { featuresById } from '@/store/providers/getters';
import { createBlock } from '@/plugins/spark/store/actions';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class BlockWizard extends Vue {
  $q: any;
  filteredOptions: any[] = [];
  modalOpen: boolean = false;

  feature: any = null;
  blockId: string = '';
  block: Block | null = null;

  get blockIdRules() {
    return [
      v => !!v || 'Name must not be empty',
      v => !blockIds(this.$store, this.$props.serviceId).includes(v) || 'Name must be unique',
      v => v.match(/^[a-zA-Z]/) || 'Name must start with a letter',
      v => v.match(/^[^\[\]\<\>]*$/) || 'Name must not contain brackets ([]<>)',
      v => v.length < 200 || 'Name must be less than 200 characters',
    ];
  }

  get configureReady() {
    return !!this.feature && !this.blockIdRules.some(rule => isString(rule(this.blockId)));
  }

  get createReady() {
    return this.configureReady && !!this.block && !!this.block.data;
  }

  get wizardOptions() {
    return featuresById(this.$store, 'Spark')
      .map(id => ({
        label: displayNameById(this.$store, id),
        value: id,
        form: formById(this.$store, id),
      }))
      .filter(opt => wizardById(this.$store, opt.value) === 'BlockWidgetWizard')
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
    this.block = this.block || {
      id: this.blockId,
      serviceId: this.$props.serviceId,
      type: this.feature.value,
      groups: [0],
      data: null,
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

  async createBlock() {
    try {
      await createBlock(this.$store, this.$props.serviceId, this.block);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Created ${displayNameById(this.$store, (this.block as Block).type)} Block '${this.blockId}'`,
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
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <component
        v-if="modalOpen"
        :is="feature.form"
        :type="block.type"
        :field="block"
        :on-change-field="v => block = v"
        :id="blockId"
        :title="blockId"
        :on-change-block-id="changeBlockId"
      />
    </q-dialog>

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
            label="Widget Type"
            @filter="filterFn"
            @change="block = null"
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
        :disable="!configureReady"
        unelevated
        label="Configure"
        color="primary"
        @click="ensureLocalBlock(); modalOpen = true"
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
