<script lang="ts">
import FormBase from '@/components/Form/FormBase';
import { Block } from '@/plugins/spark/state';
import { createBlock } from '@/plugins/spark/store/actions';
import { blockIds, blockValues, blockById, blocks } from '@/plugins/spark/store/getters';
import { formById } from '@/store/features/getters';
import { serviceValues } from '@/store/services/getters';
import { Service } from '@/store/services/state';
import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';
import Component from 'vue-class-component';
import isString from 'lodash/isString';
import get from 'lodash/get';
import { objectStringSorter } from '@/helpers/functional';

@Component
export default class BlockWizard extends WidgetWizardBase {
  currentStep: string = 'start';
  modalOpen: boolean = false;

  widgetId: string = '';
  blockId: string = '';
  service: Service | null = null;
  block: Block | null = null;

  get serviceId(): string {
    return get(this, ['service', 'id'], '');
  }

  get widgetIdRules() {
    return [
      v => !!v || 'Name must not be empty',
      v => !this.itemAlreadyExists(v) || 'Name must be unique',
    ];
  }

  get blockIdRules() {
    return [
      v => !!v || 'Name must not be empty',
      v => !blockIds(this.$store, this.serviceId).includes(v) || 'Name must be unique',
      v => v.match(/^[a-zA-Z]/) || 'Name must start with a letter',
      v => v.match(/^[^\[\]\<\>]*$/) || 'Name must not contain brackets ([]<>)',
      v => v.length < 200 || 'Name must be less than 200 characters',
    ];
  }

  get blockOpts() {
    if (!this.service) {
      return [];
    }
    return blockValues(this.$store, this.serviceId)
      .filter(block => block.type === this.typeId)
      .sort(objectStringSorter('id'));
  }

  get serviceOpts() {
    return serviceValues(this.$store)
      .filter(service => service.type === 'Spark')
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  get blockForm() {
    return this.block
      ? formById(this.$store, this.block.type)
      : '';
  }

  get startOk() {
    return !!this.service
      && !this.widgetIdRules.some(rule => isString(rule(this.widgetId)));
  }

  get createOk() {
    return !!this.service
      && !this.blockIdRules.some(rule => isString(rule(this.blockId)));
  }

  get existingOk() {
    return !!this.service && !!this.block;
  }

  get finishReady() {
    return !!this.service && !!this.block && !!this.block.data;
  }

  async createWidget() {
    const service = this.service as Service;
    const block = this.block as Block;

    if (!blockIds(this.$store, service.id).includes(block.id)) {
      await createBlock(this.$store, service.id, block);
    }

    this.createItem({
      id: this.widgetId,
      feature: this.typeId,
      dashboard: this.$props.dashboardId,
      order: 0,
      config: {
        serviceId: service.id,
        blockId: block.id,
      },
      ...this.defaultWidgetSize,
    });
  }

  changeWidgetId(newId: string) {
    const errors = this.widgetIdRules
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
    this.widgetId = newId;
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
    (this.block as Block).id = newId;
  }

  ensureBlock() {
    this.block = this.block || {
      id: this.blockId,
      serviceId: this.serviceId,
      type: this.typeId,
      groups: [0],
      data: null,
    };
  }

  mounted() {
    if (this.serviceOpts.length > 0) {
      this.service = this.serviceOpts[0].value;
    }
  }
}
</script>

<template>
  <div>
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <component
        v-if="modalOpen"
        :is="blockForm"
        :type="block.type"
        :field="block"
        :on-change-field="v => block = v"
        :id="widgetId"
        :on-change-id="changeWidgetId"
        :on-change-block-id="changeBlockId"
      />
    </q-dialog>

    <q-stepper
      v-model="currentStep"
      :bordered="false"
      class="bg-dark-bright"
      vertical
      animated
      dark
    >
      <q-step name="start" title="Widget info">
        <q-item dark>
          <q-item-section>
            <q-input v-model="widgetId" :rules="widgetIdRules" dark label="Widget name"/>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Service</q-item-label>
            <q-option-group v-model="service" :options="serviceOpts"/>
          </q-item-section>
        </q-item>
        <q-stepper-navigation class="row justify-around">
          <q-btn unelevated label="Back" @click="back"/>
          <q-btn
            :disable="!startOk"
            unelevated
            label="Create new Block"
            color="primary"
            @click="blockId = widgetId; currentStep = 'create'"
          />
          <q-btn
            :disable="!startOk"
            unelevated
            label="Use existing Block"
            color="primary"
            @click="currentStep = 'existing'"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step name="create" title="Create new Block">
        <q-item dark>
          <q-item-section>
            <q-input v-model="blockId" :rules="blockIdRules" dark label="Block name"/>
          </q-item-section>
        </q-item>
        <q-stepper-navigation class="row justify-around">
          <q-btn unelevated label="Back" @click="block = null; currentStep = 'start'"/>
          <q-btn
            :disable="!createOk"
            unelevated
            label="Configure Block"
            color="primary"
            @click="ensureBlock(); modalOpen = true"
          />
          <q-btn
            :disable="!finishReady"
            unelevated
            label="Finish"
            color="primary"
            @click="createWidget()"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step name="existing" title="Choose existing Block">
        <q-item dark>
          <q-item-section>
            <q-select
              v-model="block"
              :options="blockOpts"
              :rules="[v => !!v || 'You must select a Block']"
              dark
              options-dark
              option-label="id"
              label="Block"
            >
              <template v-slot:no-option>
                <q-item dark>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-stepper-navigation class="row justify-around">
          <q-btn unelevated label="Back" @click="block = null; currentStep = 'start'"/>
          <q-btn
            :disable="!existingOk"
            unelevated
            label="Configure Block"
            color="primary"
            @click="modalOpen = true"
          />
          <q-btn
            :disable="!finishReady"
            unelevated
            label="Finish"
            color="primary"
            @click="createWidget"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>
