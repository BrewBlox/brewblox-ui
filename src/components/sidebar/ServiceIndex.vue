<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectSorter } from '@/helpers/functional';
import notify from '@/plugins/logging/notify';
import { Service, serviceStore } from '@/store/services';


@Component
export default class ServiceIndex extends Vue {
  dragging = false;

  @Prop({ type: Boolean, required: true })
  public readonly value!: boolean;

  get editing(): boolean {
    return this.value;
  }

  set editing(val: boolean) {
    this.$emit('input', val);
  }

  get services(): Service[] {
    return serviceStore.serviceValues.sort(objectSorter('order'));
  }

  set services(services: Service[]) {
    serviceStore.updateServiceOrder(services.map(service => service.id));
  }

  startWizard(): void {
    createDialog({
      parent: this,
      component: 'WizardDialog',
      initialComponent: 'ServiceWizardPicker',
    });
  }

  removeService(service: Service): void {
    createDialog({
      parent: this,
      title: 'Remove service',
      message: `Are you sure you want to remove ${service.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => serviceStore.removeService(service));
  }

  changeServiceTitle(service: Service): void {
    createDialog({
      parent: this,
      title: 'Change service Title',
      message: "Change your service's display name",
      cancel: true,
      prompt: {
        model: service.title,
        type: 'text',
      },
    })
      .onOk(async newTitle => {
        const oldTitle = service.title;
        if (!newTitle || oldTitle === newTitle) {
          return;
        }

        await serviceStore.saveService({ ...service, title: newTitle });
        notify.done(`Renamed service '${oldTitle}' to '${newTitle}'`);
      });
  }
}
</script>

<template>
  <div>
    <q-item class="q-pb-none">
      <q-item-section>
        <q-item-section class="text-bold">
          Services
        </q-item-section>
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          icon="add"
          round
          flat
          size="sm"
          @click="startWizard"
        />
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          :disable="services.length === 0"
          :icon="editing ? 'mdi-pencil-off' : 'mdi-pencil'"
          round
          flat
          size="sm"
          @click="editing = !editing"
        >
          <q-tooltip>
            {{ editing ? 'Stop editing' : 'Edit services' }}
          </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>

    <draggable
      v-model="services"
      :disabled="$dense || !editing"
      @start="dragging=true"
      @end="dragging=false"
    >
      <q-item
        v-for="service in services"
        :key="service.id"
        :to="editing ? undefined : `/service/${service.id}`"
        :inset-level="0.2"
        :class="{hoverable: editing && !dragging,bordered: editing, 'q-pb-sm': true}"
        style="min-height: 0px"
      >
        <q-item-section :class="{'text-italic': editing, ellipsis: true}">
          {{ service.title }}
        </q-item-section>
        <template v-if="editing">
          <q-item-section avatar>
            <q-icon name="mdi-chevron-down" />
          </q-item-section>
          <q-menu :offset="[-50, 0]">
            <q-list bordered>
              <ActionItem
                icon="edit"
                label="Change service title"
                @click="changeServiceTitle(service)"
              />
              <ActionItem
                icon="delete"
                label="Remove service"
                @click="removeService(service)"
              />
            </q-list>
          </q-menu>
        </template>
      </q-item>
    </draggable>
  </div>
</template>

<style scoped>
.bordered {
  border: 1px solid whitesmoke;
  margin-top: 2px;
}
</style>
