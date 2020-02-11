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
  statusColor: Record<ServiceStatus['connection'], string> = {
    'Unknown': 'grey',
    'Disconnected': 'red',
    'Connecting': 'yellow',
    'Connected': 'green',
  }

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

  get statuses(): Mapped<ServiceStatus> {
    return serviceStore.statuses;
  }

  get suggestions(): ServiceSuggestion[] {
    return serviceStore.stubValues
      .filter(stub => !!featureStore.services[stub.type])
      .map(stub => {
        const feature = featureStore.services[stub.type];
        return { stub, feature };
      });
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
      :class="['q-pb-sm', {hoverable: editing && !dragging, bordered: editing}]"
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
      <template v-else>
        <q-item-section class="col-auto q-mr-sm">
          <q-icon name="mdi-checkbox-blank-circle" :color="statusColor[statuses[service.id].connection]" />
          <q-tooltip>
            {{ statuses[service.id].connection }}
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
