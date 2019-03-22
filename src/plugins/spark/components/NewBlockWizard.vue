<script lang="ts">
import { objectStringSorter } from '@/helpers/functional';
import { Block } from '@/plugins/spark/state';
import { blockIds } from '@/plugins/spark/store/getters';
import {
  displayNameById,
  formById,
  wizardById,
} from '@/store/features/getters';
import { featuresById } from '@/store/providers/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    onCreateBlock: {
      type: Function,
      required: true,
    },
  },
})
export default class NewBlockWizard extends Vue {
  $q: any;
  searchModel: string = '';
  featureId: string = '';
  block: Block | null = null;

  get wizardOptions() {
    return featuresById(this.$store, 'Spark')
      .map(id => ({
        label: displayNameById(this.$store, id),
        value: id,
      }))
      .filter(opt =>
        wizardById(this.$store, opt.value) // we consider anything that has a wizard as "creatable"
        && formById(this.$store, opt.value)
        && opt.label.toLowerCase().match(this.searchModel.toLowerCase()))
      .sort(objectStringSorter('label'));
  }

  blockIdError(id) {
    if (!id) {
      return 'Name must not be empty';
    }
    const serviceId = this.$props.serviceId;
    if (blockIds(this.$store, serviceId).includes(id)) {
      return 'Name must be unique';
    }
    return null;
  }

  get formComponent() {
    return formById(this.$store, this.featureId);
  }

  selectFeature(featureId: string) {
    this.block = {
      id: `New ${featureId} Block`,
      serviceId: this.$props.serviceId,
      groups: [0],
      type: featureId,
      data: null,
    };
    this.featureId = featureId;
  }

  async changeBlockId(newId: string) {
    if (this.blockIdError(newId)) {
      this.$q.notify(this.blockIdError);
      return;
    }
    (this.block as Block).id = newId;
  }

  onCreate(block: Block) {
    this.$props.onCreateBlock(block);
    this.reset();
  }

  reset() {
    this.searchModel = '';
    this.featureId = '';
    this.block = null;
  }

  confirm() {
    const block = this.block as Block;
    if (!block.id) {
      this.$q.notify('No block ID set');
      return;
    }
    if (blockIds(this.$store, this.$props.serviceId).includes(block.id)) {
      this.$q.notify(`Block "${block.id}" already exists`);
      return;
    }
    if (block.data === null) {
      this.$q.notify('No block data saved');
      return;
    }
    this.$props.onCreateBlock(this.block);
    this.reset();
  }

  mounted() {
    this.reset();
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-card v-if="formComponent" dark>
      <q-card-title>Configure new block
        <q-btn slot="right" flat dense icon="clear" label="Cancel" @click="reset"/>
        <q-btn slot="right" flat dense icon="done_all" label="Create" @click="confirm"/>
      </q-card-title>
      <component
        :is="formComponent"
        :type="block.type"
        :field="block"
        :on-change-field="v => block = v"
        :id="block.id"
        :on-change-block-id="changeBlockId"
        embedded
      />
    </q-card>
    <q-card v-else dark>
      <q-card-title>Create new block
        <q-btn v-close-overlay slot="right" flat dense icon="clear" label="Cancel"/>
      </q-card-title>
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
            @click.native="() => selectFeature(opt.value)"
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
