<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { startChangeServiceTitle, startCreateService, startRemoveService } from '@/helpers/services';
import { featureStore, ServiceFeature } from '@/store/features';
import { Service, ServiceStatus, serviceStore, ServiceStub } from '@/store/services';;

interface ServiceSuggestion {
  stub: ServiceStub;
  feature: ServiceFeature;
}

@Component
export default class ServiceIndex extends Vue {
  startChangeServiceTitle = startChangeServiceTitle;
  startCreateService = startCreateService;
  startRemoveService = startRemoveService;

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
    // Avoid modifying the store object
    return [...serviceStore.services].sort(objectSorter('order'));
  }

  set services(services: Service[]) {
    serviceStore.updateServiceOrder(services.map(v => v.id));
  }

  get suggestions(): ServiceSuggestion[] {
    return serviceStore.stubs
      .map(stub => {
        const feature = featureStore.serviceById(stub.type)!;
        return { stub, feature };
      })
      .filter(({ feature }) => feature !== null);
  }

  status(service: Service): ServiceStatus | null {
    return serviceStore.statuses.find(v => v.id === service.id) ?? null;
  }
}
</script>

<template>
  <draggable
    v-model="services"
    :disabled="$dense || !editing"
    @start="dragging=true"
    @end="dragging=false"
  >
    <template #header>
      <q-item class="q-pb-none">
        <q-item-section>
          <q-item-section class="text-bold">
            Services
          </q-item-section>
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
    </template>
    <q-item
      v-for="service in services"
      :key="service.id"
      :to="editing ? undefined : `/service/${service.id}`"
      :inset-level="0.2"
      :class="['q-pb-sm', {bordered: editing, hoverable: editing && !dragging}]"
      style="min-height: 0px"
    >
      <q-item-section :class="['ellipsis', {'text-italic': editing}]">
        {{ service.title }}
      </q-item-section>
      <template v-if="editing">
        <q-item-section avatar>
          <q-icon name="mdi-dots-vertical" />
        </q-item-section>
        <q-menu :offset="[-50, 0]">
          <q-list bordered>
            <ActionItem
              icon="edit"
              label="Change service title"
              @click="startChangeServiceTitle(service)"
            />
            <ActionItem
              icon="delete"
              label="Remove service"
              @click="startRemoveService(service, $router)"
            />
          </q-list>
        </q-menu>
      </template>
      <template v-else-if="status(service) !== null">
        <q-item-section class="col-auto q-mr-sm">
          <q-icon
            :name="status(service).icon || 'mdi-checkbox-blank-circle'"
            :color="status(service).color"
          />
          <q-tooltip>
            {{ status(service).desc }}
          </q-tooltip>
        </q-item-section>
      </template>
    </q-item>

    <template #footer>
      <q-item
        v-for="({stub, feature}) in suggestions"
        :key="stub.id"
        :inset-level="0.2"
        class="q-pb-sm darkish"
        style="min-height: 0px"
        clickable
        @click="startCreateService(stub, $router)"
      >
        <q-item-section class="col-auto">
          <q-icon name="add" size="xs" />
        </q-item-section>
        <q-item-section class="ellipsis">
          {{ stub.id }}
        </q-item-section>
        <q-item-section class="col-auto text-grey text-italic">
          Click to add
        </q-item-section>
        <q-tooltip>
          Click to create UI service for {{ feature.title }} '{{ stub.id }}'
        </q-tooltip>
      </q-item>
    </template>
  </draggable>
</template>

<style scoped>
.bordered {
  border: 1px solid whitesmoke;
  margin-top: 2px;
}
</style>
